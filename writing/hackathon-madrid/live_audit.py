"""Live-game audit: COUNTS ONLY. Reads the public repo's recorded logs at a fixed commit via `git show`
and prints aggregate counts. Never prints a log line, id, price, limit, value, or name.

usage: python3 live_audit.py <repo-path> [commit]
"""
import json
import subprocess
import sys
from collections import Counter, defaultdict

REPO = sys.argv[1]
COMMIT = sys.argv[2] if len(sys.argv) > 2 else "ac7ed2a"
DUEL_LOGS = ["logs/duel/2026-10-03.jsonl", "logs/duel/2026-10-04.jsonl"]
PICAROS_LOG = "logs/picaros/2026-10-04.jsonl"
OTHER_DEALER_DIRS = ["logs/abuela", "logs/chato", "logs/rastro", "logs/pilar"]


def git(*args):
    return subprocess.run(["git", "-C", REPO, *args], capture_output=True, text=True, check=True).stdout


def show(path):
    return git("show", f"{COMMIT}:{path}")


def ls(prefix):
    return [p for p in git("ls-tree", "-r", "--name-only", COMMIT, "--", prefix).splitlines() if p]


def jsonl(path):
    return [json.loads(l) for l in show(path).splitlines() if l.strip()]


def outside(role, price, limit):
    """Role-aware: a buyer must not pay above its limit, a seller must not sell below its limit."""
    if role == "buyer":
        return price > limit
    if role == "seller":
        return price < limit
    raise ValueError("unknown role")


out = []
p = out.append

# ---------------------------------------------------------------- 1. duels
p(f"commit {COMMIT}")
p("== 1. DUELS (result events in logs/duel/*.jsonl)")
all_results = {}          # duel id -> result event (deduped across both files)
dup_across_files = 0
for path in DUEL_LOGS:
    ev = jsonl(path)
    res = [e for e in ev if e["event"] == "result"]
    by_id = {}
    for e in res:
        by_id.setdefault(e["duel"], []).append(e)
    dups_in_file = sum(len(v) - 1 for v in by_id.values())
    conflicting = sum(1 for v in by_id.values() if len({(x["status"], x["price"], x["limit"]) for x in v}) > 1)
    last = {k: v[-1] for k, v in by_id.items()}
    deals = [e for e in last.values() if e["status"] == "deal"]
    deals_no_price = sum(1 for e in deals if e["price"] is None)
    out_price = sum(1 for e in deals if e["price"] is not None and outside(e["role"], e["price"], e["limit"]))
    neg_surplus = sum(1 for e in deals if e["our_surplus"] < 0)
    zero_surplus = sum(1 for e in deals if e["our_surplus"] == 0)
    at_limit = sum(1 for e in deals if e["price"] is not None and e["price"] == e["limit"])
    disagree = sum(1 for e in deals if e["price"] is not None
                   and outside(e["role"], e["price"], e["limit"]) != (e["our_surplus"] < 0))
    p(f"  {path}: result events={len(res)} distinct duels={len(by_id)} dup events={dups_in_file} "
      f"conflicting dups={conflicting}")
    p(f"    status: {dict(Counter(e['status'] for e in last.values()))}  deals by role: "
      f"{dict(Counter(e['role'] for e in deals))}")
    p(f"    deals outside limit (role-aware price vs limit)={out_price}  deals with our_surplus<0={neg_surplus}  "
      f"price/surplus tests disagree={disagree}  deals with price missing={deals_no_price}")
    p(f"    deals exactly at limit={at_limit}  deals with our_surplus==0={zero_surplus}")
    for k, e in last.items():
        if k in all_results:
            dup_across_files += 1
        all_results[k] = e

    # the accept_mismatch event(s): approved terms differ from settled terms
    for am in (e for e in ev if e["event"] == "accept_mismatch"):
        r = last.get(am["duel"])
        if r is None:
            p("    accept_mismatch: no result event for its duel")
            continue
        sp = am["settled"]["price"]
        p(f"    accept_mismatch: settled price outside limit={outside(r['role'], sp, r['limit'])}  "
          f"settled price == result price={sp == r['price']}  "
          f"event surplus<0={am['surplus'] < 0}  result our_surplus<0={r['our_surplus'] < 0}  "
          f"result status={r['status']}")

deals_all = {k: e for k, e in all_results.items() if e["status"] == "deal"}
p(f"  TOTAL: distinct duels with a result={len(all_results)} (same duel id in both files={dup_across_files})  "
  f"deals={len(deals_all)}  no_deal={len(all_results) - len(deals_all)}")
p(f"  TOTAL deals outside limit (price)="
  f"{sum(1 for e in deals_all.values() if e['price'] is not None and outside(e['role'], e['price'], e['limit']))}  "
  f"TOTAL deals with our_surplus<0={sum(1 for e in deals_all.values() if e['our_surplus'] < 0)}")

# cross-check against the per-duel server snapshots in logs/duels/*.json (matched on the `duel` field)
snaps = defaultdict(list)
for path in ls("logs/duels"):
    o = json.loads(show(path))
    snaps[o["duel"]].append(o)
snap_status = Counter(o["status"] for v in snaps.values() for o in v)
multi = sum(1 for v in snaps.values() if len(v) > 1)
p(f"  logs/duels snapshots: files={sum(len(v) for v in snaps.values())} distinct duel ids={len(snaps)} "
  f"ids with >1 snapshot={multi} status={dict(snap_status)}")
snap_deal = {}
for k, v in snaps.items():
    d = [o for o in v if o["status"] == "deal"]
    if d:
        snap_deal[k] = d
p(f"  snapshot deal ids={len(snap_deal)}  result-deal ids without a deal snapshot="
  f"{sum(1 for k in deals_all if k not in snap_deal)}  deal snapshots without a result-deal="
  f"{sum(1 for k in snap_deal if k not in deals_all)}")
mis_role = mis_limit = mis_price = 0
for k, e in deals_all.items():
    for o in snap_deal.get(k, []):
        mis_role += o["role"] != e["role"]
        mis_limit += o["your_limit"] != e["limit"]
        mis_price += o["price"] != e["price"]
snap_out = sum(1 for v in snap_deal.values() for o in v if outside(o["role"], o["price"], o["your_limit"]))
p(f"  snapshot vs result disagreements on matched deals: role={mis_role} limit={mis_limit} price={mis_price}")
p(f"  snapshot deals outside limit (role-aware price vs your_limit)={snap_out}")
final_ids = {k for k, v in snaps.items() if any(o["status"] in ("deal", "no_deal") for o in v)}
no_result = final_ids - set(all_results)
duel_events = defaultdict(Counter)
for path in DUEL_LOGS:
    for e in jsonl(path):
        if "duel" in e:
            duel_events[e["duel"]][e["event"]] += 1
p(f"  snapshot ids with a final status={len(final_ids)}  final-status ids with no result event={len(no_result)} "
  f"(their snapshot status: {dict(Counter(o['status'] for k in no_result for o in snaps[k] if o['status'] != 'live'))})")
p(f"    of those: with a duel_new event={sum(1 for k in no_result if duel_events[k]['duel_new'])}  "
  f"with any say/accept event={sum(1 for k in no_result if duel_events[k]['say'] or duel_events[k]['accept'])}  "
  f"with no event at all in logs/duel={sum(1 for k in no_result if not duel_events[k])}  "
  f"snapshot rounds==0={sum(1 for k in no_result if all(o['rounds'] == 0 for o in snaps[k] if o['status'] != 'live'))}")
p(f"  snapshot limit_meaning by role: {dict(Counter((o['role'], o['limit_meaning']) for v in snaps.values() for o in v))}")

# ---------------------------------------------------------------- 2. switched offers
p("== 2. SWITCHED OFFERS (mismatch events in " + PICAROS_LOG + ")")
ev = jsonl(PICAROS_LOG)
mm = [e for e in ev if e["event"] == "mismatch"]
sw_offers = {}                       # offer id -> thread id
for e in mm:
    sw_offers[e["offer"]["id"]] = e["offer"]["thread"]
thread_mismatch = sum(1 for e in mm if e["offer"]["thread"] != e["thread"])
sw_threads = set(sw_offers.values())
p(f"  mismatch events={len(mm)}  distinct switched offers={len(sw_offers)}  distinct threads={len(sw_threads)}  "
  f"event.thread != offer.thread: {thread_mismatch}")
p(f"  offer.status at log time: {dict(Counter(e['offer']['status'] for e in mm))}")

# what kind of mismatch each switched offer is, and what the bot's flagger concluded about its words
opens_all = {e["thread"]: e for e in ev if e["event"] == "open"}
card_switch = other_term = no_open = 0
for oid, tid in sw_offers.items():
    o = next(e["offer"] for e in mm if e["offer"]["id"] == oid)
    gives = [t.split(":", 1)[1] for t in ((o.get("give") or {}).get("types") or []) if t.startswith("card:")]
    if tid not in opens_all:
        no_open += 1
    elif opens_all[tid]["item"] in gives:
        other_term += 1
    else:
        card_switch += 1
p(f"  switched offers giving a card other than the negotiated one={card_switch}  giving the negotiated card "
  f"(other term wrong)={other_term}  no open event for the thread={no_open}")
flag = {}
for e in ev:
    if e["event"] == "flagged":
        flag[e["offer"]] = "flagged"
    elif e["event"] == "flag_skipped" and flag.get(e.get("offer")) != "flagged":
        if "says_ours" not in e:
            flag[e["offer"]] = "skipped: message not found"
        elif e["says_theirs"]:
            flag[e["offer"]] = "skipped: words named the card actually given"
        else:
            flag[e["offer"]] = "skipped: words did not name the negotiated card"
p(f"  flagger verdict per switched offer: {dict(Counter(flag.get(oid, 'never attempted') for oid in sw_offers))}")

threads = {}
for path in ls("logs/threads"):
    o = json.loads(show(path))
    threads[o["id"]] = o
missing = [t for t in sw_threads if t not in threads]
final_status = Counter()
unseen = 0
for oid, tid in sw_offers.items():
    t = threads.get(tid)
    if t is None:
        final_status["unverifiable (no thread file)"] += 1
        continue
    hits = [m["offer"] for m in t["messages"] if isinstance(m.get("offer"), dict) and m["offer"]["id"] == oid]
    if not hits:
        unseen += 1
        final_status["unverifiable (offer not in thread file)"] += 1
        continue
    final_status[hits[-1]["status"]] += 1
p(f"  switched threads with no thread file={len(missing)}")
p(f"  final status of the switched offers in logs/threads: {dict(final_status)}")
p(f"  ACCEPTED (final offer status == settled)={final_status.get('settled', 0)}")
p(f"  switched threads' final thread status: {dict(Counter(threads[t]['status'] for t in sw_threads if t in threads))}")

# positive check on the deals the bot did make with this dealer
opens = {e["thread"]: e for e in ev if e["event"] == "open"}
res = [e for e in ev if e["event"] == "result"]
acc = [e for e in ev if e["event"] == "accept"]
deal_threads = {e["thread"] for e in res if e["status"] == "deal"}
p(f"  dealer result events={len(res)} status={dict(Counter(e['status'] for e in res))}  "
  f"deal threads that also had a switched offer={len(deal_threads & sw_threads)}")
ok_item = bad_item = settled_switched = no_settled = no_open = 0
for tid in deal_threads:
    t = threads.get(tid)
    settled = [m["offer"] for m in (t or {}).get("messages", []) if isinstance(m.get("offer"), dict)
               and m["offer"]["status"] == "settled"]
    if not settled:
        no_settled += 1
        continue
    for so in settled:
        settled_switched += so["id"] in sw_offers
        if tid not in opens:
            no_open += 1
            continue
        item, side = opens[tid]["item"], opens[tid]["side"]
        leg = so["give"] if side == "buy" else so["want"]
        types = (leg or {}).get("types") or []
        if f"card:{item}" in types:
            ok_item += 1
        else:
            bad_item += 1
p(f"  settled offers in dealer deal threads: carry the negotiated card={ok_item}  do not={bad_item}  "
  f"are a switched offer={settled_switched}  deal threads without a settled offer={no_settled}  "
  f"without an open event={no_open}")
acc_on_deal = sum(1 for e in acc if e["thread"] in deal_threads)
acc_on_switched = sum(1 for e in acc if e["thread"] in sw_threads)
p(f"  accept events={len(acc)}  on deal threads={acc_on_deal}  on threads that had a switched offer={acc_on_switched}")
p(f"  switched_end events={sum(1 for e in ev if e['event'] == 'switched_end')}  "
  f"say(switched=True)={sum(1 for e in ev if e['event'] == 'say' and e.get('switched'))}  "
  f"flagged={sum(1 for e in ev if e['event'] == 'flagged')}  flag_skipped={sum(1 for e in ev if e['event'] == 'flag_skipped')}")

# ledger check: covers the switched offers logs/threads cannot verify. Every switched offer gives a card, so settling
# one would move that card between the dealer and us; logs/feed/feed.jsonl carries every settlement the bot saw.
p("== 2c. LEDGER CHECK (settlement records in logs/feed/feed.jsonl)")
sw_obj = {e["offer"]["id"]: e["offer"] for e in mm}
dealers, us = {o["maker"] for o in sw_obj.values()}, {o["to"] for o in sw_obj.values()}
dealer, team = next(iter(dealers)), next(iter(us))
sw_cards = {t.split(":", 1)[1] for o in sw_obj.values() for t in ((o.get("give") or {}).get("types") or [])
            if t.startswith("card:")}
gives_card = sum(1 for o in sw_obj.values()
                 if any(t.startswith("card:") for t in ((o.get("give") or {}).get("types") or [])))
feed = jsonl("logs/feed/feed.jsonl")
ticks = [r["tick"] for r in feed if isinstance(r.get("tick"), int)]
lo, hi = min(o["created_tick"] for o in sw_obj.values()), max(o["expires_tick"] for o in sw_obj.values())
p(f"  switched-offer makers={len(dealers)} recipients={len(us)}  switched offers that give a card={gives_card}/{len(sw_obj)}  "
  f"feed spans the switched offers' lifetime={min(ticks) <= lo and max(ticks) >= hi}")


def involves(r, who):
    pl = r["payload"]
    return who in (pl.get("parties") or []) or pl.get("persona") == who or any(
        who in (i.get("frm"), i.get("to")) for i in pl.get("items") or [])


settle = [r for r in feed if r["type"] == "settlement" and involves(r, dealer) and involves(r, team)]
used = set()
for a in acc:
    item = opens[a["thread"]]["item"]
    for i, r in enumerate(settle):
        if i not in used and r["payload"].get("price") == a["price"] and item in {x.get("ref") for x in r["payload"]["items"]}:
            used.add(i)
            break
rest = [r for i, r in enumerate(settle) if i not in used]
p(f"  settlements between the dealer and us={len(settle)}  matched 1:1 to a bot accept (negotiated card, accepted price)="
  f"{len(used)}  other={len(rest)}")
p(f"  other settlements inside the switched offers' lifetime={sum(1 for r in rest if lo <= r['tick'] <= hi)}  "
  f"settlements of any kind moving a switched card to us after a switched offer was made="
  f"{sum(1 for r in settle if r['tick'] >= lo and any(x.get('ref') in sw_cards and x.get('to') == team for x in r['payload']['items']))}")
p(f"  per gap: switched offers unverifiable in logs/threads whose card moved to us at or after the offer was made="
  f"{sum(1 for oid, tid in sw_offers.items() if (tid not in threads or not any(isinstance(m.get('offer'), dict) and m['offer']['id'] == oid for m in threads[tid]['messages'])) and any(r['tick'] >= sw_obj[oid]['created_tick'] and any(x.get('ref') in {t.split(':', 1)[1] for t in sw_obj[oid]['give']['types'] if t.startswith('card:')} and x.get('to') == team for x in r['payload']['items']) for r in settle))}")
p(f"  gap threads: accept events=0 expected; found={sum(1 for e in acc if e['thread'] in {t for o, t in sw_offers.items() if t not in threads or not any(isinstance(m.get('offer'), dict) and m['offer']['id'] == o for m in threads[t]['messages'])})}")

# supplementary: mismatch events in the other dealer logs (outside the brief's scope; counts only)
p("== 2b. SUPPLEMENTARY: mismatch events in other dealer logs")
for d in OTHER_DEALER_DIRS:
    for path in ls(d):
        if not path.endswith(".jsonl"):
            continue
        evs = jsonl(path)
        m = [e for e in evs if e.get("event") == "mismatch"]
        if not m:
            p(f"  {path}: mismatch events=0")
            continue
        offs = {}
        for e in m:
            o = e.get("offer") or {}
            if "id" in o:
                offs[o["id"]] = o.get("thread", e.get("thread"))
        st = Counter()
        for oid, tid in offs.items():
            t = threads.get(tid)
            hits = [mm_["offer"] for mm_ in (t or {}).get("messages", [])
                    if isinstance(mm_.get("offer"), dict) and mm_["offer"]["id"] == oid]
            st[hits[-1]["status"] if hits else "unverifiable"] += 1
        p(f"  {path}: mismatch events={len(m)} distinct offers={len(offs)} "
          f"threads={len(set(offs.values()))} final status={dict(st)}")

print("\n".join(out))

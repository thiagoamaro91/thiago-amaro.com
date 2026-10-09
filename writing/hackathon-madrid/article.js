/* article.js - page scripts for the hackathon write-up: the summary copy button, the leaderboard replay
   and the briefing anatomy stepper. Vanilla, no requests, no inline handlers.
   prefers-reduced-motion: reduce, or #final in the URL: the replay shows its end frame and the briefing
   shows every part at once. #step=N (1-5) opens the briefing on that part. */
(function () {
  'use strict';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINAL = /final/.test(location.hash);

  /* ---------- summary card: one line, closed; copy for your assistant (same approach as the claims card) ---------- */
  (function () {
    var card = document.getElementById('tldr');
    if (!card) return;
    var pre = card.querySelector('pre'), cp = card.querySelector('.tldr-copy'), tog = card.querySelector('.tldr-toggle'),
      label = cp.textContent, t;
    function show(open) {
      pre.hidden = !open;
      tog.setAttribute('aria-expanded', String(open));
      tog.textContent = open ? 'hide' : 'show';
      card.classList.toggle('open', open);
    }
    tog.addEventListener('click', function () { show(pre.hidden); });
    function done() {
      cp.textContent = 'Copied';
      clearTimeout(t);
      t = setTimeout(function () { cp.textContent = label; }, 2000);
    }
    function fallback() {
      var was = pre.hidden;
      pre.hidden = false;
      var r = document.createRange(); r.selectNodeContents(pre);
      var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) {}
      if (ok) { done(); pre.hidden = was; }
      else show(true);   // the text stays open and selected for a manual copy
    }
    cp.addEventListener('click', function () {
      var txt = pre.textContent;
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, fallback);
      else fallback();
    });
  })();

  /* ---------- replay: the real leaderboard, our rank in gold ---------- */
  (function () {
    var root = document.getElementById('rp');
    if (!root) return;
    function $(id) { return root.querySelector('#rp-' + id); }
    var D = {"t":[161.2,164.9,169.9,174.9,180.0,184.9,187.7,274.9,275.8,280.8,285.9,290.8,295.8,929.1,934.1,935.2,939.1,944.1,949.1,949.6,954.1,959.2,964.2,969.1,974.2,979.1,984.2,989.1,994.8,999.8,1004.8,1009.8,1014.8,1019.8,1024.8,1029.8,1034.8,1039.8,1044.9,1049.9,1054.8,1059.8,1064.8,1069.8,1074.8,1079.9,1084.9,1089.9,1094.9,1099.9,1104.9,1109.9,1114.9,1120.0,1124.9,1129.9,1135.0,1139.9,1145.0,1150.0,1155.0,1160.0,1165.0,1294.2,1299.3,1304.3,1309.3,1314.3,1319.3,1324.3,1329.3,1334.3,1339.3,1344.3,1349.3,1354.3,1359.3,1364.3,1369.4,1374.4,1379.4,1384.4,1389.5,1394.5,1399.5,1404.5,1409.5,1414.5,1419.5,1424.5,1429.5,1434.5,1439.5,1444.6,1449.5,1454.5,1459.5,1464.6,1469.6,1474.5,1479.6,1484.5,1489.7,1494.6,1499.6,1504.6,1509.7,1514.7,1519.7,1524.7,1529.7,1534.7,1539.7,1544.7,1549.8,1554.7,1559.8,1564.8,1569.8,1574.8,1622.3,1627.4,1632.3,1637.4,1642.4,1647.3,1652.3,1657.4,1662.4,1667.4,1672.5,1677.4,1682.4,1687.5,1692.5,1697.4,1702.5,1707.5,1712.4,1717.5,1722.5,1727.5,1732.5,1737.5,2335.2,2360.4,2364.1,2369.1,2374.1,2379.1,2384.2,2389.2,2394.2,2399.2,2404.2,2409.2,2414.3,2419.3,2424.3,2429.3,2434.3,2439.3,2444.4,2449.4,2454.5,2459.5,2464.5,2469.5,2474.6,2479.6,2484.6,2489.6,2494.7,2499.7,2504.7,2509.7,2514.8,2519.8,2524.8,2529.9,2534.9,2540.0,2545.0,2550.1,2555.1,2560.1,2565.2,2570.3,2575.3,2580.5,2585.5,2590.4,2595.6,2600.7,2605.7,2610.8,2615.8,2620.9,2625.9,2630.9,2635.9,2641.2,2646.2,2651.1,2656.2,2661.2,2666.3,2671.3,2676.4,2681.4,2686.5,2691.4,2696.4],"our":[18,18,9,12,13,14,14,10,10,10,10,9,10,10,10,10,10,11,11,11,11,11,9,9,9,10,9,10,10,10,10,10,11,11,11,11,11,14,14,14,14,13,13,13,13,16,16,16,15,16,16,16,16,16,15,16,16,16,16,15,16,16,16,16,16,16,16,15,13,11,11,12,7,7,8,7,7,7,8,6,6,6,6,6,3,3,4,4,5,6,4,4,4,4,4,4,4,4,4,4,4,4,5,5,5,5,6,6,6,6,6,6,6,6,6,6,6,5,4,4,4,4,5,5,4,4,4,4,4,4,5,5,5,6,6,6,6,6,6,6,6,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],"o":[[12,17,6,11,2,10,7,8,3,13,9,1,14,15,16,4,5],[12,17,7,3,1,11,8,9,4,13,10,2,14,15,16,5,6],[14,18,10,1,2,13,11,6,5,15,12,3,7,16,17,4,8],[14,18,7,2,1,8,13,3,9,15,6,4,10,16,17,5,11],[15,12,9,4,2,10,14,6,1,16,7,5,8,17,18,3,11],[15,13,11,6,2,4,9,3,1,16,8,7,10,17,18,5,12],[15,13,11,6,2,4,9,3,1,16,8,7,10,17,18,5,12],[14,15,7,9,11,13,3,12,5,18,2,1,8,17,16,4,6],[14,16,7,9,11,13,3,12,5,18,2,1,8,17,15,4,6],[14,16,6,9,12,11,3,13,5,18,2,1,8,17,15,4,7],[15,17,6,9,11,14,3,12,5,18,2,1,7,13,16,4,8],[15,17,6,10,11,14,3,13,5,18,2,1,8,12,16,4,7],[15,17,6,5,11,14,9,13,4,18,2,1,8,12,16,3,7],[15,17,5,6,11,14,9,13,4,18,2,1,8,12,16,3,7],[14,13,4,7,11,16,9,15,5,18,2,1,6,12,17,3,8],[14,13,4,7,11,16,9,15,5,18,2,1,6,12,17,3,8],[14,11,4,7,12,16,9,15,6,18,2,1,5,13,17,3,8],[13,10,5,6,12,16,9,15,7,18,2,1,3,14,17,4,8],[12,7,5,6,13,17,10,16,8,18,2,1,3,15,14,4,9],[12,7,5,6,13,17,10,16,8,18,2,1,3,15,14,4,9],[12,7,5,6,13,17,10,16,9,18,1,2,3,14,15,4,8],[12,5,7,8,15,17,10,16,9,18,1,2,3,14,13,6,4],[12,4,6,7,15,17,11,16,10,18,1,3,5,14,13,8,2],[12,4,6,7,15,17,11,16,10,18,2,3,5,13,14,8,1],[11,3,7,6,15,17,12,16,10,18,2,4,5,14,13,8,1],[11,3,7,6,15,17,12,16,9,18,2,4,5,14,13,8,1],[11,3,7,6,15,17,12,16,10,18,2,5,4,14,13,8,1],[11,3,8,4,15,17,12,16,7,18,2,6,5,14,13,9,1],[11,3,8,4,12,17,15,16,7,18,2,6,5,13,14,9,1],[11,2,8,4,12,17,15,16,7,18,3,6,5,14,13,9,1],[11,2,8,4,13,17,15,16,7,18,3,6,5,14,12,9,1],[8,3,9,2,14,17,15,16,7,18,4,6,5,13,12,11,1],[8,3,7,2,13,17,15,16,9,18,4,6,5,12,14,10,1],[8,4,7,3,13,17,14,16,9,18,5,1,6,12,15,10,2],[8,5,7,3,13,17,16,14,9,18,4,2,6,12,15,10,1],[9,5,8,3,14,17,16,12,6,18,4,2,7,13,15,10,1],[9,5,8,3,14,17,16,12,7,18,4,1,6,13,15,10,2],[8,5,9,2,13,17,16,12,6,18,4,1,7,15,11,10,3],[7,6,8,2,13,17,16,12,5,18,4,1,9,15,10,11,3],[6,5,8,7,13,17,16,12,4,18,3,1,9,15,10,11,2],[7,5,9,8,13,17,16,12,4,18,3,1,6,15,11,10,2],[7,6,8,9,14,17,16,12,5,18,4,2,1,15,11,10,3],[7,6,8,9,14,17,16,12,5,18,4,2,1,15,11,10,3],[8,6,9,10,14,17,16,12,5,18,4,2,1,15,11,7,3],[8,7,9,10,14,17,16,12,5,18,4,2,1,15,11,6,3],[8,7,9,10,13,17,15,12,5,18,4,1,2,14,11,6,3],[8,11,6,7,13,17,12,9,10,18,1,2,5,15,14,4,3],[10,9,8,6,14,17,13,11,7,18,1,3,2,12,15,4,5],[8,7,10,6,16,17,13,11,9,18,1,3,2,12,14,4,5],[7,10,9,5,15,17,12,13,8,18,1,3,2,11,14,6,4],[8,9,10,6,13,17,12,14,7,18,1,4,3,11,15,2,5],[8,11,10,7,12,17,9,15,6,18,2,5,1,13,14,3,4],[8,10,9,7,12,17,11,15,6,18,2,5,1,14,13,3,4],[8,10,9,7,13,17,12,15,3,18,2,6,1,14,11,5,4],[8,9,10,7,13,17,11,16,4,18,3,6,1,14,12,5,2],[8,9,11,3,10,17,12,15,6,18,4,7,1,13,14,5,2],[8,9,12,3,10,17,11,15,5,18,4,7,1,14,13,6,2],[8,10,11,4,9,17,12,14,5,18,3,6,1,15,13,7,2],[8,10,11,4,9,17,12,14,3,18,5,6,1,15,13,7,2],[8,10,11,5,9,17,12,14,3,18,2,6,1,16,13,7,4],[8,10,11,5,9,17,12,14,4,18,2,7,1,15,13,6,3],[8,10,11,5,9,17,13,15,4,18,2,7,1,14,12,6,3],[8,11,10,5,9,17,13,15,3,18,2,7,1,14,12,6,4],[8,11,10,5,9,17,13,15,4,18,2,7,1,14,12,6,3],[8,11,10,5,9,17,13,14,4,18,2,6,1,15,12,7,3],[8,11,10,5,9,17,14,15,4,18,2,6,1,13,12,7,3],[8,10,11,5,9,17,14,15,4,18,2,6,1,13,12,7,3],[8,10,11,5,9,17,14,16,4,18,2,6,1,13,12,7,3],[8,10,11,5,9,17,15,16,4,18,2,6,1,14,12,7,3],[8,10,12,5,9,17,15,16,4,18,2,6,1,14,13,7,3],[8,10,12,5,9,17,15,16,4,18,2,6,1,14,13,7,3],[6,10,11,5,9,17,16,15,4,18,2,8,1,14,13,7,3],[6,13,12,5,11,17,16,15,3,18,1,8,2,14,10,9,4],[5,13,12,6,11,17,16,15,3,18,1,8,2,14,10,9,4],[5,13,12,6,11,17,16,15,3,18,1,9,2,14,7,10,4],[6,12,13,5,11,17,15,16,3,18,2,9,1,14,8,10,4],[6,12,13,2,11,17,15,16,4,18,3,10,1,14,8,9,5],[4,12,13,1,10,17,15,16,5,18,3,11,2,14,8,9,6],[3,12,14,2,6,17,15,16,5,18,4,11,1,13,9,10,7],[3,13,14,2,7,17,15,16,5,18,4,11,1,12,9,10,8],[3,13,14,2,7,17,15,16,5,18,4,11,1,12,9,10,8],[3,13,14,2,7,17,15,16,5,18,4,12,1,11,9,10,8],[3,13,14,1,7,17,15,16,5,18,4,12,2,11,9,10,8],[3,13,14,1,7,17,15,16,5,18,4,12,2,11,9,10,8],[4,14,13,2,7,17,15,16,6,18,5,11,1,12,9,10,8],[4,14,13,2,7,17,15,16,6,18,5,11,1,12,9,10,8],[3,14,13,2,7,17,15,16,6,18,5,11,1,12,9,10,8],[3,14,13,2,7,17,15,16,6,18,5,11,1,12,9,10,8],[4,14,13,2,3,17,15,16,7,18,6,11,1,12,9,10,8],[5,14,13,4,3,17,15,16,7,18,2,11,1,12,9,10,8],[5,14,13,3,2,16,15,17,6,18,9,11,1,12,8,10,7],[5,14,13,3,2,16,15,17,6,18,9,11,1,12,8,10,7],[5,15,13,3,2,16,14,17,7,18,9,11,1,12,8,10,6],[5,15,13,3,1,16,14,17,7,18,9,10,2,12,8,11,6],[12,15,13,3,1,16,14,17,6,18,8,10,2,11,7,9,5],[11,15,13,3,1,16,14,17,6,18,8,10,2,12,7,9,5],[11,15,13,3,1,16,14,17,5,18,8,10,2,12,7,9,6],[11,15,13,3,1,16,14,17,5,18,8,10,2,12,7,9,6],[11,15,13,1,2,16,14,17,5,18,8,10,3,12,7,9,6],[11,14,13,1,2,16,15,17,6,18,8,10,3,12,7,9,5],[11,14,13,1,2,16,15,17,6,18,9,10,3,12,7,8,5],[11,14,13,2,3,16,15,17,6,18,8,9,1,12,7,10,5],[11,14,13,2,3,16,15,17,4,18,8,9,1,12,7,10,6],[12,15,13,3,2,16,14,17,4,18,8,10,1,11,7,9,6],[12,15,13,2,1,16,14,17,3,18,8,10,4,11,7,9,6],[12,15,13,1,2,16,14,17,3,18,8,10,4,11,7,9,6],[12,15,13,1,2,16,14,17,3,18,8,10,4,11,7,9,5],[12,15,13,2,3,16,14,17,1,18,8,10,4,11,7,9,5],[12,15,13,2,3,16,14,17,1,18,7,10,4,11,8,9,5],[12,15,13,3,2,16,14,17,1,18,7,10,4,11,8,9,5],[11,14,12,3,2,16,13,17,1,18,7,10,4,8,15,9,5],[11,14,13,3,2,16,12,17,1,18,7,10,4,8,15,9,5],[11,14,12,3,2,16,13,17,1,18,7,10,4,8,15,9,5],[11,15,12,3,2,16,14,17,1,18,7,10,4,8,13,9,5],[11,14,13,3,2,16,12,17,1,18,7,10,5,8,15,9,4],[11,14,13,3,2,16,12,17,1,18,7,10,5,8,15,9,4],[11,14,13,3,2,16,12,17,1,18,7,10,5,8,15,9,4],[11,14,13,3,2,16,12,17,1,18,7,10,6,8,15,9,4],[11,14,12,3,2,16,13,17,1,18,7,10,6,8,15,9,5],[12,9,13,3,2,17,14,16,1,18,7,11,5,8,15,10,6],[12,9,13,3,2,17,14,16,1,18,7,11,5,8,15,10,6],[12,9,13,3,2,17,14,16,1,18,7,11,5,8,15,10,6],[13,9,14,2,3,17,12,16,1,18,7,11,6,8,15,10,4],[14,9,15,2,3,17,12,16,1,18,7,11,6,8,13,10,4],[14,10,15,3,2,17,11,16,1,18,7,12,6,9,13,8,5],[15,11,10,3,2,17,12,16,1,18,7,13,6,9,14,8,5],[15,12,10,3,2,17,11,16,1,18,7,13,5,9,14,8,6],[15,9,12,3,2,17,10,16,1,18,6,13,7,11,14,8,5],[16,10,11,3,2,17,9,15,1,18,6,13,7,12,14,8,5],[15,10,11,3,2,17,9,16,1,18,5,12,7,13,14,8,6],[13,9,12,4,2,17,10,15,1,18,3,11,6,14,16,8,7],[12,10,13,4,2,17,11,15,1,18,3,9,6,14,16,8,7],[11,12,13,4,2,17,10,15,1,18,3,9,6,14,16,8,7],[10,13,12,4,2,17,11,14,1,18,3,9,7,15,16,8,5],[10,13,12,3,2,17,11,15,1,18,4,9,7,14,16,8,5],[9,13,12,3,2,17,10,15,1,18,4,11,7,14,16,8,5],[9,13,10,3,2,17,11,15,1,18,4,12,7,14,16,8,5],[9,14,10,3,2,17,12,15,1,18,4,11,7,13,16,8,5],[9,14,10,3,2,17,11,15,1,18,4,12,7,13,16,8,5],[9,15,10,4,3,17,11,16,1,18,5,12,7,13,14,8,2],[9,15,10,4,3,17,11,16,1,18,5,12,7,13,14,8,2],[9,15,11,4,6,17,12,16,1,18,3,10,7,13,14,8,2],[9,15,11,3,6,17,12,16,1,18,4,10,7,13,14,8,2],[9,15,12,3,6,17,11,16,1,18,4,10,7,13,14,8,2],[9,15,12,3,6,17,11,16,1,18,4,10,7,13,14,8,2],[9,14,11,3,6,16,12,17,1,18,2,10,7,13,15,8,4],[9,15,11,3,6,17,12,13,1,18,2,8,7,14,16,10,4],[9,15,11,4,6,17,12,14,1,18,2,8,7,13,16,10,3],[9,14,11,4,6,17,12,15,1,18,2,7,8,13,16,10,3],[9,14,12,4,6,17,11,15,1,18,3,7,8,13,16,10,2],[9,14,12,4,6,17,10,15,1,18,2,7,8,13,16,11,3],[9,14,12,4,6,17,10,15,1,18,2,7,8,13,16,11,3],[10,11,13,4,6,17,8,15,1,18,2,7,9,14,16,12,3],[10,11,12,4,6,17,8,15,1,18,2,7,9,14,16,13,3],[10,11,12,4,6,17,8,15,1,18,2,7,9,14,16,13,3],[10,11,12,4,6,17,8,16,1,18,2,7,9,14,15,13,3],[10,12,14,4,6,13,8,11,1,18,2,7,9,16,17,15,3],[9,12,14,4,6,13,8,11,1,18,2,7,10,16,17,15,3],[9,13,14,4,7,11,8,12,2,18,1,6,10,16,17,15,3],[9,13,14,4,7,11,8,12,2,18,1,6,10,16,17,15,3],[9,11,14,4,7,12,8,13,2,18,1,6,10,16,17,15,3],[9,11,14,4,7,12,8,13,2,18,1,6,10,16,17,15,3],[9,11,13,4,7,15,8,12,3,18,1,6,10,17,16,14,2],[9,10,13,3,7,15,8,12,4,18,1,6,11,17,16,14,2],[10,9,14,3,7,13,8,12,4,18,1,6,11,17,16,15,2],[12,8,10,3,7,15,9,14,4,18,1,6,11,13,17,16,2],[11,9,8,2,7,13,15,14,4,18,1,6,10,12,17,16,3],[11,9,10,4,6,15,14,8,2,18,1,7,12,13,16,17,3],[12,10,9,4,6,16,14,8,2,18,1,7,13,11,15,17,3],[13,9,10,4,6,16,14,7,2,18,1,8,11,12,15,17,3],[13,10,11,4,6,16,14,7,1,18,2,8,9,12,15,17,3],[13,11,9,4,6,16,14,7,1,18,2,8,10,12,15,17,3],[13,12,10,4,6,16,15,7,2,18,1,9,11,8,14,17,3],[14,12,7,4,6,16,15,8,2,18,1,10,11,9,13,17,3],[12,13,7,4,6,16,15,8,2,18,1,10,11,9,14,17,3],[13,14,6,4,7,16,15,8,2,18,1,10,11,9,12,17,3],[13,14,6,4,7,16,15,8,2,18,1,10,11,9,12,17,3],[14,11,6,2,8,16,15,7,3,18,1,10,13,9,12,17,4],[14,10,6,2,8,16,15,7,3,18,1,11,13,9,12,17,4],[13,10,6,2,8,16,15,7,3,18,1,11,14,9,12,17,4],[13,10,6,2,8,16,15,7,4,18,1,11,14,9,12,17,3],[13,10,6,2,8,16,15,7,3,18,1,12,14,9,11,17,4],[13,12,6,2,7,16,15,8,3,18,1,10,14,9,11,17,4],[13,12,6,2,7,16,15,8,3,18,1,10,14,9,11,17,4],[13,12,6,1,7,16,15,8,2,18,3,10,14,9,11,17,4],[13,12,6,1,7,16,15,8,2,18,3,10,14,9,11,17,4],[12,13,7,1,6,16,15,8,3,18,2,9,14,10,11,17,4],[11,13,7,1,6,16,15,8,3,18,2,10,14,9,12,17,4],[14,12,7,1,6,17,15,8,2,18,3,10,13,9,11,16,4],[14,12,7,1,6,17,15,8,2,18,3,10,13,9,11,16,4],[13,11,7,1,6,16,15,8,2,18,3,17,12,9,10,14,4],[13,11,6,1,7,16,14,8,2,18,3,17,12,9,10,15,5],[13,11,6,1,7,16,14,8,2,18,3,17,12,9,10,15,5],[13,11,6,1,7,16,14,8,3,18,2,17,12,9,10,15,5],[13,11,6,1,7,16,14,8,3,18,2,17,12,9,10,15,5],[13,11,6,1,7,16,14,8,3,18,2,17,12,9,10,15,5],[13,11,6,1,7,16,14,8,3,18,2,17,12,9,10,15,5],[13,11,6,1,7,17,14,8,2,18,3,16,12,9,10,15,5],[13,11,6,1,7,17,14,8,2,18,3,16,12,9,10,15,5],[13,11,6,1,7,17,14,8,2,18,3,16,12,9,10,15,5],[13,11,6,1,7,17,14,8,2,18,3,16,12,9,10,15,5],[13,11,6,1,7,17,14,8,2,18,3,16,12,9,10,15,5],[14,12,7,1,6,17,15,8,2,18,3,16,11,9,10,13,5],[14,12,6,1,7,17,15,8,2,18,3,16,11,9,10,13,5],[14,11,6,1,7,17,12,8,2,18,3,16,13,9,10,15,5],[15,12,6,1,7,17,11,8,2,18,3,16,14,9,10,13,5],[15,12,6,1,7,17,11,8,2,18,3,16,13,9,10,14,5],[15,12,6,1,7,17,11,8,2,18,3,16,13,9,10,14,5],[15,12,6,1,7,17,11,8,2,18,3,16,13,9,10,14,5],[15,12,6,1,7,17,11,8,2,18,3,16,13,9,10,14,5],[15,10,7,1,8,17,12,6,2,18,3,16,13,9,11,14,5],[15,10,7,1,8,17,12,6,2,18,3,16,13,9,11,14,5],[15,9,7,1,8,17,12,6,2,18,3,16,13,10,11,14,5]],"m":[[287,"h"],[384,"h"],[923,"h"],[925,"h"],[925,"h"],[927,"h"],[927,"h"],[927,"h"],[930,"h"],[933,"h"],[942,"h"],[959,"t"],[961,"t"],[999,"t"],[1061,"t"],[1068,"t"],[1069,"t"],[1070,"t"],[1072,"t"],[1084,"t"],[1094,"t"],[1096,"t"],[1101,"h"],[1108,"h"],[1113,"t"],[1118,"t"],[1120,"h"],[1136,"h"],[1150,"h"],[1295,"t"],[1298,"t"],[1304,"t"],[1316,"t"],[1327,"h"],[1339,"t"],[1345,"t"],[1551,"h"],[1584,"h"],[1595,"h"],[1596,"h"],[1636,"h"],[1636,"h"],[1649,"h"],[1650,"h"],[1662,"h"],[1667,"h"],[1685,"h"],[1685,"h"],[1743,"t"],[1792,"t"],[1793,"h"],[1793,"h"],[1793,"o"],[1823,"h"],[1907,"h"],[1914,"h"],[1920,"h"],[1967,"h"],[1975,"h"],[1976,"h"],[1984,"h"],[2012,"h"],[2016,"h"],[2020,"h"],[2040,"t"],[2084,"h"],[2084,"h"],[2091,"h"],[2208,"h"],[2209,"h"],[2259,"h"],[2268,"h"],[2269,"h"],[2278,"h"],[2303,"t"],[2317,"t"],[2317,"t"],[2329,"t"],[2365,"t"],[2384,"t"],[2384,"t"],[2394,"t"],[2399,"t"],[2401,"t"],[2417,"t"],[2423,"t"],[2429,"h"],[2429,"t"],[2447,"t"],[2448,"t"],[2460,"t"],[2478,"t"],[2520,"t"],[2532,"h"],[2587,"h"],[2597,"h"],[2651,"h"],[2653,"h"],[2682,"h"],[2714,"t"],[2717,"t"],[2723,"h"],[2724,"t"],[2734,"h"],[2734,"h"],[2751,"h"],[2754,"h"]]};
    var T = 2700, X0 = 100, X1 = 1040, Y0 = 285, Y1 = 960, SY0 = 996, SY1 = 1044, AX = 1060, N = 18, NS = 'http://www.w3.org/2000/svg';
    var DAYS = ['Fri', 'Sat', 'Sun'];
    function X(m) { return X0 + m / T * (X1 - X0); }
    function Y(r) { return Y0 + (r - 1) / (N - 1) * (Y1 - Y0); }
    function clock(m) {
      var a = 18 * 60 + Math.floor(m), d = Math.floor(a / 1440), h = Math.floor(a % 1440 / 60), mi = a % 60;
      return DAYS[d] + ' ' + (h < 10 ? '0' : '') + h + ':' + (mi < 10 ? '0' : '') + mi;
    }
    function el(n, a, p) { var e = document.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
    function tx(p, x, y, s, a, txt, extra) {
      var e = el('text', { x: x, y: y, 'font-size': s, 'text-anchor': a }, p);
      for (var k in extra) e.setAttribute(k, extra[k]);
      e.textContent = txt;
      return e;
    }

    root.classList.add(reduce ? 'rm' : 'anim');

    /* grid + axes */
    var g = $('grid');
    for (var r = 1; r <= N; r++) {
      el('line', { x1: X0, x2: X1, y1: Y(r), y2: Y(r), stroke: 'var(--border)', 'stroke-width': 1, 'stroke-opacity': r % 3 == 1 ? .9 : .45 }, g);
      tx(g, X0 - 14, Y(r) + 6, 17, 'end', r, { fill: 'var(--muted)' });
    }
    var yt = tx(g, 26, (Y0 + Y1) / 2, 20, 'middle', 'Game leaderboard rank', { fill: 'var(--muted)' });
    yt.setAttribute('transform', 'rotate(-90 26 ' + (Y0 + Y1) / 2 + ')');
    el('line', { x1: X0, x2: X1, y1: AX, y2: AX, stroke: 'var(--muted)', 'stroke-width': 1.5 }, g);
    [[0, 'Fri', '18:00'], [360, 'Sat', '00:00'], [1080, 'Sat', '12:00'], [1800, 'Sun', '00:00'], [2520, 'Sun', '12:00'], [2700, 'Sun', '15:00']].forEach(function (t) {
      el('line', { x1: X(t[0]), x2: X(t[0]), y1: AX, y2: AX + 8, stroke: 'var(--muted)', 'stroke-width': 1.5 }, g);
      tx(g, X(t[0]), AX + 30, 20, 'middle', t[1], { fill: 'var(--body)', 'font-weight': 500 });
      tx(g, X(t[0]), AX + 52, 20, 'middle', t[2], { fill: 'var(--body)' });
    });

    /* gaps in the recording */
    var gp = $('gaps'), ts = D.t, i;
    var NIGHT = 300, GAPLAB = [[600, ['our side kept working:','first bots built,','weekend plan drafted']], [2000, ['our side kept working:','14 pull requests merged','between 01:47 and 04:51,','duel and broker searches','running on the VM']]];
    var gl = [[0, ts[0]]];
    for (i = 1; i < ts.length; i++) if (ts[i] - ts[i - 1] > 45) gl.push([ts[i - 1], ts[i]]);
    gl.forEach(function (q) {
      var w = X(q[1]) - X(q[0]);
      if (q[1] - q[0] < NIGHT) return;
      el('rect', { x: X(q[0]), y: Y0 - 14, width: w, height: SY1 + 4 - (Y0 - 14), fill: 'var(--muted)', 'fill-opacity': .09 }, gp);
      GAPLAB.forEach(function (L) {
        if (L[0] > q[0] && L[0] < q[1]) ['game closed overnight'].concat(L[1]).forEach(function (s, j, a) {
          tx($('gaplabs'), (X(q[0]) + X(q[1])) / 2, Y1 - 16 - (a.length - 1 - j) * 20 - (j ? 0 : 6), 15, 'middle', s, j ? { fill: 'var(--muted)', 'font-style': 'italic', 'class': 'gaplab' } : { fill: 'var(--rp-head)', 'font-weight': 600, 'class': 'gaplab' });
        });
      });
    });

    /* merge ticks: one per merged pull request at its merge time, stacked where they share a 4 px column */
    var sg = $('strip'), tks = [], col = {}, TW = 4, TH = 6, TG = 1, late = 0;
    el('line', { x1: X0, x2: X1, y1: SY1 + .5, y2: SY1 + .5, stroke: 'var(--border)', 'stroke-width': 1 }, sg);
    tx(sg, X0 + 8, SY0 + 12, 15, 'start', 'Pull requests merged', { fill: 'var(--muted)' });
    D.m.forEach(function (p) {
      var c = Math.round((X(p[0]) - X0) / TW), n = col[c] = (col[c] || 0) + 1, after = p[0] > T;
      if (after) late++;
      tks.push([p[0], el('rect', { 'class': 'tk tk-' + p[1] + (after ? ' tk-late' : ''), x: X0 + c * TW - (TW - 1) / 2, y: SY1 - n * (TH + TG), width: TW - 1, height: TH }, sg)]);
    });
    var lateLab = tx(sg, X1 - 8, SY0 - 8, 14, 'end', '+' + late + ' merged after the freeze', { fill: 'var(--muted)' });
    lateLab.setAttribute('class', 'ev');

    /* series: hold the last known rank until the next snapshot */
    function path(vals) {
      var d = 'M' + X(ts[0]).toFixed(1) + ' ' + Y(vals[0]).toFixed(1), prev = vals[0];
      for (var j = 1; j < ts.length; j++) { if (vals[j] === prev) continue; d += 'H' + X(ts[j]).toFixed(1) + 'V' + Y(vals[j]).toFixed(1); prev = vals[j]; }
      return d + 'H' + X(T).toFixed(1);
    }
    var og = $('others');
    for (var s = 0; s < 17; s++) el('path', { d: path(D.o.map(function (r) { return r[s]; })) }, og);
    $('ours').setAttribute('d', path(D.our));

    /* events: label lines, row (0 upper, 1 lower), anchor */
    var EV = [
 {t:188,  day:"Fri 21:08",      l:["first pull request","opened"],                    row:1,a:"start"},
 {t:1070, day:"Sat 11:50",      l:["scored test: broker","matched nothing;","fix live 12:05"],row:0,a:"start"},
 {t:1098, day:"Sat 12:18",      l:["team bus live;","16th on the board"],           row:1,a:"end",dx:14},
 {t:1320, day:"Sat 16:00",      l:["one conductor; no","human approval","per trade from here"],row:1,a:"start"},
 {t:1907, day:"Sun 01:47-04:51",l:["fourteen PRs","merged overnight"],               row:0,a:"start"},
 {t:2512, day:"Sun 11:52",      l:["plan approved;","11:55 to 15:01","no human gates"],row:1,a:"end"},
 {t:2700, day:"Sun 15:00",      l:["freeze"],                                        row:0,a:"end"}
];
    var evg = $('evs'), evl = $('evlines'), LH = 22, evEls = [];
    EV.forEach(function (e) {
      var x = X(e.t), top = e.row ? 170 : 84, n = e.l.length + 1, bottom = top + n * LH - LH + 6;
      var ln = el('line', { x1: x, x2: x, y1: bottom, y2: AX, stroke: 'var(--muted)', 'stroke-width': 1.2, 'stroke-dasharray': '2 5', 'stroke-opacity': .8 }, evl);
      ln.setAttribute('class', 'ev');
      var gr = el('g', { 'class': 'ev' }, evg);
      var off = (e.a == 'end' ? -1 : 1) * (e.dx || 8);
      tx(gr, x + off, top + 14, 17, e.a, e.day, { fill: 'var(--rp-head)', 'font-weight': 600 });
      e.l.forEach(function (s, k) { tx(gr, x + off, top + 14 + LH * (k + 1), 17, e.a, s, { fill: 'var(--body)' }); });
      el('circle', { 'class': 'dot', cx: x, cy: AX, r: 7, fill: 'var(--accent)', stroke: 'var(--card)', 'stroke-width': 2 }, gr);
      evEls.push([e, gr, ln]);
    });

    /* state */
    var t = 0, playing = false, last = 0, raf = 0, started = false, ro = $('readout'), mg = $('merged'), sl = $('sl'), bp = $('bp'), br = $('br');
    var phl = $('phl'), phd = $('phd'), cr = $('cr');
    function idxAt(m) { var lo = 0, hi = ts.length - 1, a = -1; while (lo <= hi) { var mid = (lo + hi) >> 1; if (ts[mid] <= m) { a = mid; lo = mid + 1; } else hi = mid - 1; } return a; }
    function render() {
      var x = X(t);
      cr.setAttribute('width', x);
      phl.setAttribute('x1', x); phl.setAttribute('x2', x);
      var k = idxAt(t), txt = clock(t);
      if (k < 0) { ro.textContent = txt + ', no snapshot yet'; phd.setAttribute('opacity', 0); }
      else {
        var gap = (k < ts.length - 1) && (ts[k + 1] - ts[k] > 45) && (t - ts[k] > 45) || (k == ts.length - 1 && t - ts[k] > 45);
        ro.textContent = txt + ', rank ' + D.our[k] + (gap ? ' (last seen)' : '');
        phd.setAttribute('cx', x); phd.setAttribute('cy', Y(D.our[k])); phd.setAttribute('opacity', 1);
      }
      evEls.forEach(function (q) { var on = t >= q[0].t - 0.001; q[1].classList.toggle('on', on); q[2].classList.toggle('on', on); });
      var nm = 0, end = t >= T - 0.001;
      tks.forEach(function (q) { var on = q[0] <= T ? q[0] <= t + 0.001 : end; q[1].classList.toggle('on', on); if (on && q[0] <= T) nm++; });
      mg.textContent = 'merged so far: ' + nm;
      lateLab.classList.toggle('on', end);
      sl.value = t;
    }
    function setPlay(p) {
      playing = p; bp.textContent = p ? 'Pause' : 'Play';
      cancelAnimationFrame(raf);
      if (p) { last = performance.now(); raf = requestAnimationFrame(tick); }
    }
    function tick(now) {
      t = Math.min(T, t + (now - last) / 24000 * T); last = now; render();
      if (t >= T) { setPlay(false); return; }
      raf = requestAnimationFrame(tick);
    }
    bp.addEventListener('click', function () { if (!playing && t >= T) t = 0; setPlay(!playing); });
    br.addEventListener('click', function () { t = 0; render(); setPlay(true); });
    sl.addEventListener('input', function () { setPlay(false); t = +sl.value; render(); });

    if (reduce || FINAL) { t = T; render(); bp.textContent = 'Play'; }
    else {
      render(); bp.textContent = 'Play';
      var go = function () { if (started) return; started = true; t = 0; setPlay(true); };
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { go(); io.disconnect(); } }); }, { threshold: .4 });
        io.observe(root);
      } else go();
    }
  })();

  /* ---------- briefing anatomy: five parts of a real session briefing ---------- */
  (function () {
    var root = document.getElementById('ba');
    if (!root) return;
    var doc = root.querySelector('.ba-doc'),
      steps = [].slice.call(root.querySelectorAll('.ba-step')), lines = [].slice.call(root.querySelectorAll('.ba-ln')),
      still = reduce || FINAL, DUR = 4000, cur = 0, paused = false, elapsed = 0, last = 0, vis = false, raf = 0;
    if (still) { root.classList.add('ba-still'); steps[0].setAttribute('aria-selected', 'true'); }
    else root.classList.add('ba-js');
    function show(i, scroll) {
      cur = (i + steps.length) % steps.length; elapsed = 0;
      var p = steps[cur].dataset.part, first = null;
      steps.forEach(function (s, k) { s.setAttribute('aria-selected', k === cur ? 'true' : 'false'); s.querySelector('.ba-bar i').style.width = '0%'; });
      lines.forEach(function (l) { var on = l.dataset.part === p; l.classList.toggle('on', on); if (on && !first) first = l; });
      if (first && scroll !== false) doc.scrollTo({ top: Math.max(0, first.offsetTop - 24), behavior: 'auto' });
    }
    /* the auto-advance only runs while the figure is on screen */
    function tick(ts) {
      raf = 0;
      if (!vis) { last = 0; return; }
      if (!last) last = ts;
      var dt = ts - last; last = ts;
      if (!paused) {
        elapsed += dt;
        steps[cur].querySelector('.ba-bar i').style.width = Math.min(100, elapsed / DUR * 100) + '%';
        if (elapsed >= DUR) show(cur + 1);
      }
      raf = requestAnimationFrame(tick);
    }
    function wake() { if (!raf && vis && !still) { last = 0; raf = requestAnimationFrame(tick); } }
    steps.forEach(function (s, k) {
      s.addEventListener('click', function () {
        if (still) {
          var f = root.querySelector('.ba-ln[data-part="' + s.dataset.part + '"]');
          if (f) doc.scrollTo({ top: Math.max(0, f.offsetTop - 24) });
          steps.forEach(function (x) { x.setAttribute('aria-selected', x === s ? 'true' : 'false'); });
        } else show(k);
      });
    });
    root.addEventListener('keydown', function (e) {
      if (still) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); show(cur + 1); steps[cur].focus({ preventScroll: true }); }
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); show(cur - 1); steps[cur].focus({ preventScroll: true }); }
    });
    root.addEventListener('mouseenter', function () { paused = true; });
    root.addEventListener('mouseleave', function () { paused = false; });
    root.addEventListener('focusin', function () { paused = true; });
    root.addEventListener('focusout', function () { paused = false; });
    if (still) return;
    var m = /step=(\d)/.exec(location.hash);
    show(m ? Math.min(5, Math.max(1, +m[1])) - 1 : 0);
    if (m) paused = true;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { es.forEach(function (e) { vis = e.isIntersecting; wake(); }); }, { threshold: 0.2 }).observe(root);
    } else { vis = true; wake(); }
  })();

  /* ---------- wide figures: a full-screen view to pan and pinch-zoom; the figure itself moves into the
     dialog (so its own animation code keeps working) and its entry runs again there ---------- */
  (function () {
    var pans = [].slice.call(document.querySelectorAll('.article .pan'));
    if (!pans.length || !window.HTMLDialogElement) return;
    var dlg = document.createElement('dialog');
    dlg.className = 'fs';
    dlg.setAttribute('aria-label', 'Figure, full screen');
    var bar = document.createElement('div'), hint = document.createElement('span'), close = document.createElement('button');
    bar.className = 'fs-bar';
    hint.textContent = 'Scroll or pinch to explore. Esc closes.';
    close.type = 'button'; close.className = 'fs-close'; close.textContent = 'Close';
    bar.appendChild(hint); bar.appendChild(close);
    var body = document.createElement('div');
    body.className = 'fs-body'; body.tabIndex = 0;
    dlg.appendChild(bar); dlg.appendChild(body);
    document.body.appendChild(dlg);
    var cur = null, ph = null, opener = null;

    function open(fig, btn) {
      if (dlg.open) return;
      ph = document.createElement('div');
      ph.className = 'fs-ph';
      ph.style.height = fig.offsetHeight + 'px';
      fig.parentNode.insertBefore(ph, fig);
      cur = fig; opener = btn;
      body.appendChild(fig);
      document.documentElement.classList.add('fs-lock');
      dlg.showModal();
      body.scrollTop = 0; body.scrollLeft = 0;
      if (!(reduce || FINAL)) {
        var again = fig.querySelector(fig.classList.contains('rp') ? '#rp-br' : ':scope > .fig-replay');
        if (again) again.click();
      }
    }
    dlg.addEventListener('close', function () {
      if (!cur) return;
      ph.parentNode.insertBefore(cur, ph);
      ph.parentNode.removeChild(ph);
      document.documentElement.classList.remove('fs-lock');
      var b = opener;
      cur = ph = opener = null;
      if (b) b.focus({ preventScroll: true });
    });
    close.addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });   // the scrim

    /* after figures.js has added its Replay buttons (it sets up on DOMContentLoaded, registered first) */
    function addButtons() {
      pans.forEach(function (pan) {
        var fig = pan.closest('figure');
        if (!fig || fig.querySelector(':scope > .fig-full')) return;
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'fig-full'; b.textContent = 'Full screen';
        b.setAttribute('aria-haspopup', 'dialog');
        b.addEventListener('click', function () { open(fig, b); });
        var after = (!fig.classList.contains('rp') && fig.querySelector(':scope > .fig-replay')) || fig.querySelector(':scope > figcaption');
        if (after) after.parentNode.insertBefore(b, after.nextSibling); else fig.appendChild(b);
      });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addButtons); else addButtons();
  })();
})();

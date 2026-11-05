// assets/charts.js — 学园偶像大进击 玩法介绍文档图表
(function () {
  var style = getComputedStyle(document.documentElement);
  function v(n) { return style.getPropertyValue(n).trim(); }
  var accent = v('--accent'), accent2 = v('--accent2');
  var ink = v('--ink'), muted = v('--muted'), rule = v('--rule'), bg2 = v('--bg2');
  var cEvent = v('--c-event'), cChance = v('--c-chance'), cChallenge = v('--c-challenge');
  var cMusic = v('--c-music'), cDance = v('--c-dance'), cCostume = v('--c-costume');
  var cVenue = v('--c-venue'), cTokyo = v('--c-tokyo'), cStart = v('--c-start');
  var cRest = v('--c-rest'), cTrade = v('--c-trade');

  var hasEcharts = typeof echarts !== 'undefined';

  /* ---------- 图 2 · 地图 28 格构成（环形图） ---------- */
  var elTiles = document.getElementById('chart-tiles');
  if (hasEcharts && elTiles) {
    var donut = echarts.init(elTiles, null, { renderer: 'svg' });
    donut.setOption({
      animation: false,
      tooltip: { trigger: 'item', appendToBody: true, formatter: '{b}：{c} 格（{d}%）' },
      legend: {
        type: 'scroll',
        bottom: 0,
        itemWidth: 12, itemHeight: 12,
        textStyle: { color: muted, fontSize: 12 }
      },
      series: [{
        type: 'pie',
        radius: ['40%', '66%'],
        center: ['50%', '46%'],
        avoidLabelOverlap: true,
        itemStyle: { borderColor: '#ffffff', borderWidth: 2 },
        label: { color: ink, fontSize: 12, formatter: '{b}\n{c} 格' },
        labelLine: { lineStyle: { color: rule } },
        emphasis: { scale: true, scaleSize: 4 },
        data: [
          { name: '素材格·音乐', value: 3, itemStyle: { color: cMusic } },
          { name: '素材格·舞蹈', value: 3, itemStyle: { color: cDance } },
          { name: '素材格·服装', value: 3, itemStyle: { color: cCostume } },
          { name: '事件格', value: 5, itemStyle: { color: cEvent } },
          { name: '机遇格', value: 4, itemStyle: { color: cChance } },
          { name: '挑战格', value: 2, itemStyle: { color: cChallenge } },
          { name: '普通 LIVE 场馆', value: 4, itemStyle: { color: cVenue } },
          { name: '特殊场馆·东京巨蛋', value: 1, itemStyle: { color: cTokyo } },
          { name: '起点·音乃木坂', value: 1, itemStyle: { color: cStart } },
          { name: '休息区·穗村', value: 1, itemStyle: { color: cRest } },
          { name: '交易格', value: 1, itemStyle: { color: cTrade } }
        ]
      }]
    });
    window.addEventListener('resize', function () { donut.resize(); });
  }

  /* ---------- 图 3 · 地图拓扑（环形布局 + 内部支线） ---------- */
  var elMap = document.getElementById('chart-map');
  if (hasEcharts && elMap) {
    // 外圈环线（22 格，按棋盘顺序）
    var RING = [
      ['秋叶原', cEvent], ['步行者天国', cDance], ['女仆咖啡屋', cCostume],
      ['上野公园', cChance], ['穗村', cRest], ['海边', cCostume],
      ['昌平桥', cEvent], ['大赛组委会', cTrade], ['服饰店', cCostume],
      ['万世桥', cChance], ['偶像活动室', cDance], ['神田明神', cEvent],
      ['明神男坂', cChallenge], ['音乐教室', cMusic], ['学校礼堂', cDance],
      ['屋顶', cEvent], ['UTX', cChance], ['Lantis录音室', cMusic],
      ['废弃校舍', cChance], ['理事长室', cEvent], ['广播室', cMusic],
      ['街机厅', cChallenge]
    ];
    var TYPE_NAME = {
      '#3BA272': '事件格', '#E85D5D': '机遇格', '#4A5FC1': '挑战格',
      '#E8B93E': '音乐素材', '#F08C3A': '舞蹈素材', '#5BA8D9': '服装素材',
      '#2F8F8C': 'LIVE场馆', '#D9556B': '特殊场馆', '#F5A623': '起点',
      '#F286B3': '休息区', '#8E6FC1': '交易格'
    };
    function polar(deg, r) {
      var a = deg * Math.PI / 180;
      return [Math.round(Math.cos(a) * r), Math.round(Math.sin(a) * r)];
    }
    function angleOf(i) { return -90 + i * 360 / RING.length; }

    var nodes = [], edges = [];
    var N = RING.length;
    for (var i = 0; i < N; i++) {
      var xy = polar(angleOf(i), 330);
      nodes.push({
        name: RING[i][0],
        x: xy[0], y: xy[1],
        symbolSize: 24,
        itemStyle: { color: RING[i][1], borderColor: '#ffffff', borderWidth: 2 },
        label: { show: true, position: 'bottom', fontSize: 11, color: ink },
        type: TYPE_NAME[RING[i][1]] || ''
      });
      edges.push({ source: RING[i][0], target: RING[(i + 1) % N][0] });
    }
    // 内部支线格
    var inner = [
      { name: '埼玉超级竞技场', deg: -90, r: 190, c: cVenue },
      { name: '东京巨蛋', deg: angleOf(3), r: 195, c: cTokyo },
      { name: '横滨K', deg: (angleOf(6) + angleOf(8)) / 2, r: 190, c: cVenue },
      { name: '名古屋巨蛋', deg: angleOf(19), r: 200, c: cVenue },
      { name: '西武巨蛋', deg: angleOf(10), r: 200, c: cVenue },
      { name: '音乃木坂（起点）', deg: (angleOf(14) + angleOf(16)) / 2, r: 135, c: cStart }
    ];
    inner.forEach(function (n) {
      var xy = polar(n.deg, n.r);
      var isStart = n.name.indexOf('音乃木坂') === 0;
      nodes.push({
        name: n.name,
        x: xy[0], y: xy[1],
        symbolSize: isStart ? 32 : 28,
        itemStyle: {
          color: n.c,
          borderColor: '#ffffff',
          borderWidth: 2,
          borderType: isStart ? 'dashed' : 'solid'
        },
        label: {
          show: true,
          position: isStart ? 'top' : 'bottom',
          fontSize: 11,
          color: isStart ? accent : ink,
          fontWeight: isStart ? 700 : 400
        },
        type: isStart ? '起点 · 仅供出发，不可通行' : (TYPE_NAME[n.c] || '')
      });
    });
    // 支线连接（外圈端点用名称索引）；起点仅供出发，不与任何地块连通
    function ringEdge(nameA, nameB) { edges.push({ source: nameA, target: nameB }); }
    ringEdge('步行者天国', '埼玉超级竞技场');
    ringEdge('街机厅', '埼玉超级竞技场');
    ringEdge('上野公园', '东京巨蛋');
    ringEdge('昌平桥', '横滨K');
    ringEdge('横滨K', '服饰店');
    ringEdge('理事长室', '名古屋巨蛋');
    ringEdge('西武巨蛋', '偶像活动室');
    ringEdge('西武巨蛋', '明神男坂');

    var map = echarts.init(elMap, null, { renderer: 'svg' });
    map.setOption({
      animation: false,
      tooltip: {
        appendToBody: true,
        formatter: function (p) { return p.dataType === 'node' ? (p.name + ' · ' + (p.data.type || '')) : '支线连接'; }
      },
      series: [{
        type: 'graph',
        layout: 'none',
        roam: false,
        zIndex: 2,
        edgeSymbol: ['none', 'arrow'],
        edgeSymbolSize: 7,
        lineStyle: { color: rule, width: 1.6, curveness: 0 },
        emphasis: { scale: 1.15 },
        data: nodes,
        links: edges
      }]
    });
    window.addEventListener('resize', function () { map.resize(); });
  }

  /* ---------- Mermaid 初始化（图 1 核心玩法链） ---------- */
  if (typeof mermaid !== 'undefined') {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'neutral',
      securityLevel: 'loose',
      flowchart: { curve: 'basis', htmlLabels: true }
    });
  }
})();

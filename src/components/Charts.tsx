import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { BRANCH_GEO, PERF_SYSTEM, dimScores } from '../data';

/** 价值评分走势：近6期总分变化 */
export function ScoreTrendChart({ score }: { score: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const chart = echarts.init(el);
    const hist = [score - 8, score - 6, score - 5, score - 3, score - 1, score];
    chart.setOption({
      grid: { left: 34, right: 12, top: 26, bottom: 24 },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: ['Q1', 'Q2', 'Q3', '7月', '9月', '本期'] },
      yAxis: { type: 'value', min: Math.min(...hist) - 3, max: 100, splitLine: { lineStyle: { color: '#eef1f6' } } },
      series: [
        { name: '综合评分', type: 'line', smooth: true, data: hist, lineStyle: { color: '#b01f24', width: 2.5 }, itemStyle: { color: '#b01f24' }, areaStyle: { color: '#b01f24', opacity: 0.1 }, markPoint: { data: [{ type: 'max', name: '本期' }] } },
        { name: 'S线(85)', type: 'line', data: [85, 85, 85, 85, 85, 85], lineStyle: { color: '#c9a45c', type: 'dashed', width: 1.2 }, symbol: 'none' },
      ],
      legend: { top: 0, textStyle: { fontSize: 11 } },
    });
    const onResize = () => chart.resize();
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); chart.dispose(); };
  }, [score]);
  return <div ref={ref} style={{ height: 190 }} />;
}

/** 股权关系图谱：集团—核心主体—家谱成员三层树（ECharts tree，节点/连线均带持股比例） */
export function EquityGraph({ name, homeCount }: { name: string; homeCount: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const chart = echarts.init(el);
    const short = name.replace('集团', '');
    const shares = [100, 100, 82.4, 68.5, 51.0, 44.6, 35.2, 28.7, 62.3];
    const n = Math.min(homeCount, 9);
    const mk = (i: number) => ({ name: `${short}子0${i + 1}\n${shares[i % shares.length]}%`, value: shares[i % shares.length] });
    chart.setOption({
      tooltip: { trigger: 'item', formatter: (p: { name?: string }) => `${(p.name ?? '').replace(/\n/g, ' · 持股 ')}` },
      series: [{
        type: 'tree',
        data: [{
          name: `${short}\n(顶层100%)`,
          children: [
            { name: '上市核心主体\n100%', children: Array.from({ length: Math.ceil(n / 2) }, (_, i) => mk(i)) },
            { name: '财务/销售/研发板块\n100%', children: Array.from({ length: Math.floor(n / 2) }, (_, i) => mk(i + Math.ceil(n / 2))) },
          ],
        }],
        top: 8, bottom: 8, left: 50, right: 110, symbolSize: 9, orient: 'LR',
        label: { fontSize: 10, backgroundColor: '#fff', borderColor: '#e3e8ef', borderWidth: 1, borderRadius: 4, padding: [2, 5] },
        leaves: { label: { fontSize: 10 } },
        lineStyle: { color: '#94a3b8', width: 1.2 },
        edgeLabel: { show: true, fontSize: 9, color: '#b01f24', formatter: (p: { data?: { value?: number } }) => (typeof p.data?.value === 'number' ? `${p.data.value}%` : '') },
        edgeShape: 'polyline',
        expandAndCollapse: true, initialTreeDepth: 3,
      }],
    });
    const onResize = () => chart.resize();
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); chart.dispose(); };
  }, [name, homeCount]);
  return <div ref={ref} style={{ height: 330 }} />;
}

/** 三环两链关系图：中心集团 + 内环家谱 / 中环生态 / 外环团金 */
export function RingsGraph({ name, homeCount, nEnd }: { name: string; homeCount: number; nEnd: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const chart = echarts.init(el);
    const short = name.replace('集团', '');
    const innerN = Math.min(homeCount, 5);
    const nodes = [
      { name: short, category: 0, symbolSize: 58, itemStyle: { color: '#b01f24' } },
      ...Array.from({ length: innerN }, (_, i) => ({ name: `家谱${i + 1}`, category: 1, symbolSize: 26, itemStyle: { color: '#2456a6' } })),
      ...Array.from({ length: 4 }, (_, i) => ({ name: `1端·${['确权', '直贷', '票据', '保理'][i]}`, category: 2, symbolSize: 24, itemStyle: { color: '#17815f' } })),
      ...Array.from({ length: 4 }, (_, i) => ({ name: `N端${nEnd - 3 + i}户`, category: 2, symbolSize: 18, itemStyle: { color: '#7cb08a' } })),
      ...Array.from({ length: 3 }, (_, i) => ({ name: `B端·${['代发', '场景', '理财'][i]}`, category: 3, symbolSize: 22, itemStyle: { color: '#b7791f' } })),
      { name: '产业链·上游', category: 4, symbolSize: 26, itemStyle: { color: '#7c6ff0' } },
      { name: '产业链·下游', category: 4, symbolSize: 26, itemStyle: { color: '#7c6ff0' } },
      { name: '投资链·发债/基金', category: 4, symbolSize: 26, itemStyle: { color: '#0e7490' } },
    ];
    const center = short;
    const links = [
      ...Array.from({ length: innerN }, (_, i) => ({ source: center, target: `家谱${i + 1}`, value: '控股', lineStyle: { color: '#2456a6' } })),
      ...['1端·确权', '1端·直贷', '1端·票据', '1端·保理'].map((t) => ({ source: center, target: t, value: '供应链', lineStyle: { color: '#17815f' } })),
      ...Array.from({ length: 4 }, (_, i) => ({ source: '1端·确权', target: `N端${nEnd - 3 + i}户`, value: '确权', lineStyle: { color: '#7cb08a', type: 'dashed' as const } })),
      ...['B端·代发', 'B端·场景', 'B端·理财'].map((t) => ({ source: center, target: t, value: '团金', lineStyle: { color: '#b7791f' } })),
      { source: '产业链·上游', target: center, value: '采购', lineStyle: { color: '#7c6ff0' } },
      { source: center, target: '产业链·下游', value: '销售', lineStyle: { color: '#7c6ff0' } },
      { source: center, target: '投资链·发债/基金', value: '资本', lineStyle: { color: '#0e7490' } },
    ];
    chart.setOption({
      tooltip: { formatter: (p: { data?: { source?: string; target?: string; value?: string }; name?: string }) => (p.data?.source ? `${p.data.source} → ${p.data.target}：${p.data.value}` : p.name) },
      legend: { top: 0, textStyle: { fontSize: 10 }, data: ['集团', '内环家谱', '中环生态', '外环团金', '两链'] },
      series: [{
        type: 'graph', layout: 'force', roam: true, label: { show: true, fontSize: 10 },
        categories: [{ name: '集团' }, { name: '内环家谱' }, { name: '中环生态' }, { name: '外环团金' }, { name: '两链' }],
        data: nodes, links, force: { repulsion: 160, edgeLength: 85 },
        edgeLabel: { show: true, fontSize: 9, formatter: '{c}' },
        lineStyle: { width: 1.4, opacity: 0.8 },
      }],
    });
    const onResize = () => chart.resize();
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); chart.dispose(); };
  }, [name, homeCount, nEnd]);
  return <div ref={ref} style={{ height: 360 }} />;
}

/** 六维各维度达成率横向条形图：实际/目标折算为达成率，可视化替代纯列表 */
export function DimAchieveChart({ dim }: { dim: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const chart = echarts.init(el);
    const d = PERF_SYSTEM.find((x) => x.dim === dim);
    const ms = (d?.metrics ?? []) as Array<{ name: string; actual: number; target: number; good?: string; unit: string }>;
    const pct = ms.map((m) => Math.min(100, Math.round(((m.good === 'low' ? m.target / m.actual : m.actual / m.target)) * 100)));
    chart.setOption({
      grid: { left: 110, right: 46, top: 8, bottom: 8 },
      tooltip: { formatter: (p: { dataIndex: number }) => `${ms[p.dataIndex].name}<br/>实际 ${ms[p.dataIndex].actual}${ms[p.dataIndex].unit} · 目标 ${ms[p.dataIndex].target}${ms[p.dataIndex].unit} · 达成 ${pct[p.dataIndex]}%` },
      xAxis: { type: 'value', max: 100, splitLine: { lineStyle: { color: '#eef1f6' } } },
      yAxis: { type: 'category', data: ms.map((m) => m.name), axisLabel: { fontSize: 11 } },
      series: [{
        type: 'bar', data: pct, barWidth: 14,
        label: { show: true, position: 'right', fontSize: 11, formatter: (p: { value: number; dataIndex: number }) => `${p.value}%（${ms[p.dataIndex].actual}${ms[p.dataIndex].unit}/${ms[p.dataIndex].target}${ms[p.dataIndex].unit}）` },
        itemStyle: { color: (d as unknown as { color: string })?.color ?? '#2456a6', borderRadius: [0, 4, 4, 0] },
        markLine: { silent: true, symbol: 'none', lineStyle: { color: '#b01f24', type: 'dashed' }, label: { fontSize: 10, formatter: '目标 100%' }, data: [{ xAxis: 100 }] },
      }],
    });
    const onResize = () => chart.resize();
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); chart.dispose(); };
  }, [dim]);
  const n = (PERF_SYSTEM.find((x) => x.dim === dim)?.metrics.length ?? 4);
  return <div ref={ref} style={{ height: n * 38 + 30 }} />;
}

/** 协同地图（示意）：江苏省内全境 + 北京/上海/杭州异地，气泡大小=协同金额，连线=主办→属地 */
export function CoopMapChart() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const chart = echarts.init(el);
    const nj = BRANCH_GEO.find((b) => b.name === '南京分行')!;
    const scatterData = BRANCH_GEO.map((b) => ({ name: b.name, value: [b.x, b.y, b.coop], coop: b.coop, scope: b.scope }));
    const lineData = BRANCH_GEO.filter((b) => b.name !== '南京分行').map((b) => ({ coords: [[nj.x, nj.y], [b.x, b.y]], value: b.coop, name: b.name }));
    chart.setOption({
      grid: { left: 40, right: 16, top: 34, bottom: 26 },
      tooltip: { formatter: (p: { data?: { name?: string }; value?: number | number[]; seriesName?: string }) => {
        if (p.seriesName === '协同机构') { const d = (p.data ?? {}) as { name?: string; coop?: number; scope?: string }; return `${d.name}<br/>${d.scope} · 协同 ${d.coop} 亿`; }
        return `${(p.data as { name?: string })?.name ?? ''}：协同 ${(p.data as { value?: number })?.value ?? ''} 亿`;
      } },
      legend: { top: 0, textStyle: { fontSize: 11 }, data: ['协同机构', '主办→属地协同线'] },
      xAxis: { type: 'value', min: 115.5, max: 122.8, name: '经度（示意）', nameLocation: 'middle', nameGap: 22, splitLine: { lineStyle: { color: '#eef1f6', type: 'dashed' } } },
      yAxis: { type: 'value', min: 29.5, max: 41, name: '纬度（示意）', splitLine: { lineStyle: { color: '#eef1f6', type: 'dashed' } } },
      series: [
        {
          name: '协同机构', type: 'scatter',
          data: scatterData.map((s) => ({ ...s, symbolSize: 14 + s.coop * 4, itemStyle: { color: s.name === '南京分行' ? '#b01f24' : s.scope.startsWith('异地') ? '#b7791f' : '#2456a6', opacity: 0.85 } })),
          label: { show: true, formatter: '{b}', fontSize: 10, position: 'top' },
        },
        {
          name: '主办→属地协同线', type: 'lines', data: lineData,
          effect: { show: true, symbol: 'arrow', symbolSize: 7 },
          lineStyle: { width: 1.6, color: '#2456a6', opacity: 0.55, curveness: 0.15 },
        },
      ],
      graphic: [
        { type: 'text', left: '8%', top: '12%', style: { text: '江苏省内全境（13 家）', fontSize: 11, fill: '#2456a6', fontWeight: 'bold' } },
        { type: 'text', left: '62%', top: '10%', style: { text: '异地：北京 / 上海 / 杭州', fontSize: 11, fill: '#b7791f', fontWeight: 'bold' } },
      ],
    });
    const onResize = () => chart.resize();
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); chart.dispose(); };
  }, []);
  return <div ref={ref} style={{ height: 340 }} />;
}

/** 六维经营实绩总览雷达 */
export function DimRadar() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const chart = echarts.init(el);
    const scores = dimScores();
    chart.setOption({
      tooltip: {},
      radar: { indicator: scores.map((x) => ({ name: x.dim, max: 100 })), radius: '62%' },
      series: [{ type: 'radar', data: [{ value: scores.map((x) => x.score), name: '维度达成率' }], lineStyle: { color: '#2456a6', width: 2 }, itemStyle: { color: '#2456a6' }, areaStyle: { color: '#2456a6', opacity: 0.12 } }],
    });
    const onResize = () => chart.resize();
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); chart.dispose(); };
  }, []);
  return <div ref={ref} style={{ height: 250 }} />;
}

export function TrendChart() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const chart = echarts.init(el);
    chart.setOption({
      grid: { left: 44, right: 12, top: 30, bottom: 26 },
      legend: { top: 0, textStyle: { fontSize: 11 } },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: ['11月', '12月', '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月'] },
      yAxis: { type: 'value', splitLine: { lineStyle: { color: '#eef1f6' } } },
      series: [
        { name: '营收(亿)', type: 'line', smooth: true, data: [42, 45, 47, 50, 52, 55, 58, 61, 64, 68, 72, 76], lineStyle: { color: '#b01f24', width: 2.5 } },
        { name: '存款日均(亿/10)', type: 'line', smooth: true, data: [30, 31, 33, 34, 36, 38, 40, 42, 44, 47, 50, 52], lineStyle: { color: '#2456a6', width: 2.5 } },
        { name: 'EVA(亿)', type: 'bar', data: [3.8, 4, 4.2, 4.5, 4.8, 5, 5.4, 5.7, 6, 6.3, 6.5, 6.8], itemStyle: { color: '#c9a45c', borderRadius: [3, 3, 0, 0] } },
      ],
    });
    const onResize = () => chart.resize();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      chart.dispose();
    };
  }, []);
  return <div ref={ref} style={{ height: 230 }} />;
}

export function StructChart() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const chart = echarts.init(el);
    chart.setOption({
      tooltip: { trigger: 'item' },
      legend: { bottom: 0, textStyle: { fontSize: 11 } },
      series: [
        {
          type: 'pie',
          radius: ['46%', '70%'],
          center: ['50%', '44%'],
          label: { fontSize: 11 },
          data: [
            { value: 32, name: '先进制造', itemStyle: { color: '#b01f24' } },
            { value: 24, name: '信息产业', itemStyle: { color: '#2456a6' } },
            { value: 14, name: '生物医药', itemStyle: { color: '#17815f' } },
            { value: 12, name: '数字基建', itemStyle: { color: '#b7791f' } },
            { value: 18, name: '其他', itemStyle: { color: '#94a3b8' } },
          ],
        },
      ],
    });
    const onResize = () => chart.resize();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      chart.dispose();
    };
  }, []);
  return <div ref={ref} style={{ height: 230 }} />;
}

export function FiveChart() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const chart = echarts.init(el);
    chart.setOption({
      grid: { left: 80, right: 30, top: 12, bottom: 24 },
      tooltip: {},
      xAxis: { type: 'value', splitLine: { lineStyle: { color: '#eef1f6' } } },
      yAxis: { type: 'category', data: ['科技金融', '绿色金融', '普惠金融', '养老金融', '数字金融'] },
      series: [
        {
          type: 'bar',
          data: [38, 26, 22, 9, 31],
          itemStyle: { color: '#2456a6', borderRadius: [0, 4, 4, 0] },
          barWidth: 14,
        },
      ],
    });
    const onResize = () => chart.resize();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      chart.dispose();
    };
  }, []);
  return <div ref={ref} style={{ height: 210 }} />;
}

export function BizChart() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const chart = echarts.init(el);
    chart.setOption({
      grid: { left: 40, right: 12, top: 26, bottom: 26 },
      tooltip: {},
      xAxis: { type: 'category', data: ['EVA', '营收', '存款', '贷款', '发债', '撮合'] },
      yAxis: { type: 'value', splitLine: { lineStyle: { color: '#eef1f6' } } },
      series: [
        {
          type: 'bar',
          data: [68, 52, 35, 29, 19, 14],
          itemStyle: {
            color: (p: { dataIndex: number }) => (p.dataIndex < 2 ? '#b01f24' : '#2456a6'),
            borderRadius: [4, 4, 0, 0],
          },
          barWidth: 26,
        },
      ],
    });
    const onResize = () => chart.resize();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      chart.dispose();
    };
  }, []);
  return <div ref={ref} style={{ height: 210 }} />;
}

/** 前瞻预测：实际实线 + 预测虚线 */
export function ForecastChart() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const chart = echarts.init(el);
    chart.setOption({
      grid: { left: 40, right: 16, top: 30, bottom: 26 },
      legend: { top: 0, textStyle: { fontSize: 11 } },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月E','12月E'] },
      yAxis: { type: 'value', name: '亿', splitLine: { lineStyle: { color: '#eef1f6' } } },
      series: [
        { name: '营收实际', type: 'line', smooth: true, data: [52,55,58,61,64,68,70,72,74,76,null,null], lineStyle: { color: '#b01f24', width: 2.5 } },
        { name: '营收预测', type: 'line', smooth: true, data: [null,null,null,null,null,null,null,null,null,76,81,86], lineStyle: { color: '#b7791f', width: 2.5, type: 'dashed' } },
      ],
    });
    const onResize = () => chart.resize();
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); chart.dispose(); };
  }, []);
  return <div ref={ref} style={{ height: 230 }} />;
}

/** 北极星趋势：FPA综合份额（主线）+ FPA余额（面积）+ EVA（柱），反映渗透现状与价值底线 */
export function NorthStarTrendChart({ branch }: { branch?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const chart = echarts.init(el);
    // 分行口径：整体下调约2pct / 余额按辖内占比演示
    const share = branch
      ? [13.8, 14.2, 14.6, 15.0, 15.4, 15.8, 16.1, 16.4, 16.6, 16.8, 17.0, 17.2]
      : [16.2, 16.6, 17.0, 17.4, 17.8, 18.2, 18.6, 19.0, 19.3, 19.6, 19.8, 20.0];
    const bal = branch
      ? [120, 126, 132, 138, 144, 150, 156, 162, 168, 174, 180, 186]
      : [380, 395, 410, 425, 440, 455, 468, 480, 492, 502, 512, 520];
    const eva = branch
      ? [1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0, 2.1, 2.2]
      : [3.8, 4.0, 4.2, 4.5, 4.8, 5.0, 5.4, 5.7, 6.0, 6.3, 6.5, 6.8];
    chart.setOption({
      grid: { left: 44, right: 44, top: 34, bottom: 26 },
      legend: { top: 0, textStyle: { fontSize: 11 } },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: ['11月', '12月', '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月'] },
      yAxis: [
        { type: 'value', name: '% / 亿', splitLine: { lineStyle: { color: '#eef1f6' } } },
        { type: 'value', name: 'FPA余额(亿)', splitLine: { show: false } },
      ],
      series: [
        { name: 'FPA综合份额%', type: 'line', smooth: true, data: share, lineStyle: { color: '#b01f24', width: 2.8 }, itemStyle: { color: '#b01f24' }, markLine: { silent: true, symbol: 'none', lineStyle: { color: '#b01f24', type: 'dashed' }, label: { fontSize: 10, formatter: '目标 22.5%' }, data: [{ yAxis: 22.5 }] } },
        { name: 'FPA余额(亿)', type: 'line', smooth: true, yAxisIndex: 1, data: bal, lineStyle: { color: '#2456a6', width: 2 }, itemStyle: { color: '#2456a6' }, areaStyle: { color: '#2456a6', opacity: 0.08 } },
        { name: 'EVA(亿)', type: 'bar', data: eva, itemStyle: { color: '#c9a45c', borderRadius: [3, 3, 0, 0], opacity: 0.85 }, barWidth: 10 },
      ],
    });
    const onResize = () => chart.resize();
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); chart.dispose(); };
  }, [branch]);
  return <div ref={ref} style={{ height: 250 }} />;
}

/** 全行协同网络：主办 - 属地合约金额 */
export function CoopChart() {  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const chart = echarts.init(el);
    chart.setOption({
      tooltip: { formatter: (p: any) => (p.data && p.data.source ? p.data.source + ' → ' + p.data.target + '：' + p.data.value + '亿' : '') },
      series: [{ type: 'graph', layout: 'force', roam: true, label: { show: true, fontSize: 11 },
        edgeLabel: { show: true, fontSize: 10, formatter: '{c}亿' },
        data: ['总行战客部','南京分行','苏州分行','无锡分行','常州分行','投资银行部','资金营运中心'].map((n) => ({ name: n, symbolSize: n === '总行战客部' ? 62 : 40 })),
        links: [
          { source: '总行战客部', target: '南京分行', value: 12.6 },
          { source: '总行战客部', target: '苏州分行', value: 4.2 },
          { source: '南京分行', target: '无锡分行', value: 2.1 },
          { source: '南京分行', target: '常州分行', value: 1.4 },
          { source: '总行战客部', target: '投资银行部', value: 10.0 },
          { source: '总行战客部', target: '资金营运中心', value: 8.0 },
        ],
        force: { repulsion: 220, edgeLength: 110 }, lineStyle: { width: 2, color: '#2456a6', opacity: 0.7 } }],
    });
    const onResize = () => chart.resize();
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); chart.dispose(); };
  }, []);
  return <div ref={ref} style={{ height: 250 }} />;
}

import { Button, Card, Col, Input, Progress, Row, Select, Space, Table, Tag, Tooltip, message } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { BRANCH_RANK, GROUPS, MAJOR_PROJECTS, NORTH_DRIVERS, NORTH_STAR, PERF_SYSTEM } from '../data';
import { useApp } from '../store';
import { useMemo, useState } from 'react';
import { DimAchieveChart, FiveChart, ForecastChart, NorthStarTrendChart, StructChart, TrendChart } from '../components/Charts';
import { PerfOverview } from './Supervise';
import CustomerDrawer from '../components/CustomerDrawer';

/**
 * 行长驾驶舱：总行行长 vs 分行行长视角区分
 * - 总行行长：全行 86 户 + 跨省协同 + 重大项目督办入口 + 高层关注
 * - 分行行长：本分行辖内户 + 本行 EVA/存贷 + 本行重大项目 + 属地协同任务
 */
export default function Home() {
  const { user, scopedGroups, nav } = useApp();
  const [q, setQ] = useState('');
  const [lv, setLv] = useState<string>('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [dim, setDim] = useState<string | null>(null);
  const [aiText, setAiText] = useState('');
  const [aiTime, setAiTime] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const genAi = () => {
    setAiLoading(true);
    window.setTimeout(() => {
      const weak = [...NORTH_DRIVERS].sort((a, b) => a.pct - b.pct).slice(0, 2).map((d) => d.key).join('、');
      setAiText(`FPA综合份额 ${ns.share}%（目标 ${ns.shareTarget}%），达成 ${Math.round((ns.share / ns.shareTarget) * 100)}%，FPA余额 ${ns.bal} 亿，EVA ${ns.eva} 亿守住价值底线。\n短板在${weak}（达成率均低于80%），负债与资产投放相对稳健。\n建议优先补投行承销与生态渗透缺口，资源向在途重大项目倾斜。`);
      setAiTime(new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }));
      setAiLoading(false);
    }, 600);
  };

  const isBranch = user?.id === 'branch';
  const branchName = isBranch ? user?.dept ?? '南京分行' : '';
  const branchGroups = useMemo(() => (isBranch ? GROUPS.filter((g) => g.branch === branchName) : scopedGroups), [isBranch, branchName, scopedGroups]);
  const branchProjects = useMemo(() => MAJOR_PROJECTS.filter((p) => (p.lead + p.coop.join('')).includes(branchName.replace('分行', ''))), [branchName]);

  const maskMgrs = (managers: string) =>
    managers.split('/').map((s) => s.trim()).filter(Boolean).map((s) => `${s[0]}经理`).join(' / ');

  const rows = useMemo(
    () => (isBranch ? branchGroups : scopedGroups).filter((g) => (!q || g.name.includes(q) || g.industry.includes(q)) && (!lv || g.level === lv)),
    [isBranch, branchGroups, scopedGroups, q, lv],
  );

  const branchFpa = Math.round(branchGroups.reduce((s, g) => s + g.fpa, 0) * 10) / 10;
  const branchEva = Math.round(branchGroups.reduce((s, g) => s + g.eva, 0) / 100) / 100;
  const branchShare = branchGroups.length
    ? Math.round(branchGroups.reduce((s, g) => s + (g.pocketL + g.pocketA) / 2, 0) / branchGroups.length * 10) / 10
    : 0;
  const ns = isBranch
    ? { share: branchShare, shareTarget: 19.5, bal: branchFpa, balTarget: 220, eva: branchEva, evaTarget: Math.round(branchEva / 0.85 * 10) / 10, nonRate: 27.4, bad: 0.58 }
    : { share: NORTH_STAR.fpaShare.actual, shareTarget: NORTH_STAR.fpaShare.target, bal: NORTH_STAR.fpaBal.actual, balTarget: NORTH_STAR.fpaBal.target, eva: NORTH_STAR.eva.actual, evaTarget: NORTH_STAR.eva.target, nonRate: NORTH_STAR.nonRate.actual, bad: NORTH_STAR.bad.actual };

  return (
    <div>
      <Card size="small" style={{ marginBottom: 10, borderLeft: isBranch ? '4px solid #2456a6' : '4px solid #b01f24' }}>
        <Space>
          <Tag color={isBranch ? 'blue' : 'red'}>{isBranch ? `${branchName} · 分行行长视角` : '总行 · 全行视角'}</Tag>
          {isBranch && (
          <span style={{ fontSize: 12, color: '#555' }}>
            {`只看${branchName}辖内 ${branchGroups.length} 户战客 + ${branchProjects.length} 个本行主办/协同重大项目，逾期事项直达责任人；跨行协同由总行战客部牵头。`}
          </span>
          )}
        </Space>
      </Card>

      {/* 北极星英雄区：FPA综合份额挂帅 + EVA/RAROC守底线 + 四大驱动分解 */}
      <Card
        size="small"
        style={{ borderTop: `3px solid ${isBranch ? '#2456a6' : '#b01f24'}` }}
        title={
          <span>
            北极星 · 战客综合金融渗透度（FPA口径）
            <Tooltip title="招行《一户一策指引》8项核心经营数据：营收/净利息/非息/FPA/存款/负债口袋/贷款/资产口袋。FPA综合份额=（负债口袋+资产口袋）/2，负债=我行自营存款日均/客户货币资金，资产=我行FPA/客户有息负债。主指标看份额渗透（综合化），EVA+RAROC守价值底线。"><QuestionCircleOutlined style={{ marginLeft: 6, color: '#888' }} /></Tooltip>
          </span>
        }
        extra={<span style={{ display: 'flex', gap: 8 }}><Tag color="blue">全行 {isBranch ? branchGroups.length : 86} 户</Tag><Button size="small" type="primary" onClick={() => nav('rep-rpt')}>更多 → 完整经营看板</Button></span>}
      >
        <Row gutter={12}>
          <Col span={7}>
            <div style={{ textAlign: 'center', padding: '6px 0' }}>
              <div style={{ fontSize: 12, color: '#888' }}>FPA综合份额 · 实际 / 目标</div>
              <div style={{ fontSize: 34, fontWeight: 800, color: '#b01f24', lineHeight: 1.1 }}>{ns.share}<span style={{ fontSize: 16 }}>%</span><span style={{ fontSize: 13, color: '#888', fontWeight: 400 }}> / {ns.shareTarget}%</span></div>
              <Progress percent={Math.round((ns.share / ns.shareTarget) * 100)} strokeColor="#b01f24" style={{ maxWidth: 260, margin: '6px auto' }} />
              <div style={{ fontSize: 12, color: '#555' }}>达成 {Math.round((ns.share / ns.shareTarget) * 100)}% · 同比 +1.1pct · 缺口 {(ns.shareTarget - ns.share).toFixed(1)}pct</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10, textAlign: 'left' }}>
                <div style={{ flex: 1, background: '#f7f9fc', borderRadius: 8, padding: 8 }}>
                  <div style={{ fontSize: 11, color: '#888' }}>FPA余额</div><b>{ns.bal} 亿</b><div style={{ fontSize: 11, color: '#888' }}>目标 {ns.balTarget} 亿</div>
                </div>
                <div style={{ flex: 1, background: '#f7f9fc', borderRadius: 8, padding: 8 }}>
                  <div style={{ fontSize: 11, color: '#888' }}>EVA（价值底线）</div><b>{ns.eva} 亿</b><div style={{ fontSize: 11, color: '#888' }}>目标 {ns.evaTarget} 亿</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8, textAlign: 'left' }}>
                <div style={{ flex: 1, background: '#f7f9fc', borderRadius: 8, padding: 8 }}>
                  <div style={{ fontSize: 11, color: '#888' }}>负债 / 资产口袋</div><b>{isBranch ? `${Math.round(branchGroups.reduce((s, g) => s + g.pocketL, 0) / Math.max(1, branchGroups.length))}% / ${Math.round(branchGroups.reduce((s, g) => s + g.pocketA, 0) / Math.max(1, branchGroups.length))}%` : '18% / 22%'}</b><div style={{ fontSize: 11, color: '#888' }}>目标 20% / 25%</div>
                </div>
                <div style={{ flex: 1, background: '#f7f9fc', borderRadius: 8, padding: 8 }}>
                  <div style={{ fontSize: 11, color: '#888' }}>非息占比 · 不良率</div><b>{ns.nonRate}% · {ns.bad}%</b><div style={{ fontSize: 11, color: '#888' }}>目标 32% · ≤0.8%</div>
                </div>
              </div>
            </div>
          </Col>
          <Col span={10}>
            <NorthStarTrendChart branch={isBranch} />
            <div style={{ fontSize: 11.5, color: '#888', textAlign: 'center' }}>红线=FPA综合份额（左轴）· 蓝区=FPA余额（右轴）· 金柱=EVA · 虚线=年度目标，反映渗透现状与价值底线是否同步上行</div>
          </Col>
          <Col span={7}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <b style={{ fontSize: 12 }}>四大驱动 · 指标状态</b>
              <Button size="small" loading={aiLoading} onClick={genAi}>AI解读</Button>
            </div>
            <Table
              size="small" pagination={false} rowKey="key" dataSource={NORTH_DRIVERS}
              columns={[
                { title: '驱动', dataIndex: 'key', width: 82, render: (v: string) => <b style={{ fontSize: 12 }}>{v}</b> },
                { title: '达成', dataIndex: 'pct', width: 76, render: (v: number, r) => <span><Progress percent={v} size="small" showInfo={false} /><span style={{ fontSize: 11 }}>{v}% · {(r as { yoy: string }).yoy}</span></span> },
                { title: '状态', dataIndex: 'level', width: 56, render: (v: string) => <Tag color={v === '偏弱' ? 'orange' : 'green'}>{v}</Tag> },
              ]}
            />
            <div style={{ fontSize: 11, color: '#888', marginTop: 6 }}>实际 / 目标见完整看板；状态按达成率与目标偏离自动标注。</div>
            {aiText && (
              <div style={{ marginTop: 8, border: '1px dashed #b7791f', borderRadius: 8, padding: 8, background: '#fffdf5' }}>
                <div style={{ fontSize: 11, color: '#b7791f' }}>AI解读 · {aiTime} <a onClick={() => setAiText('')} style={{ marginLeft: 6 }}>收起</a></div>
                <div style={{ fontSize: 12, marginTop: 4, whiteSpace: 'pre-line' }}>{aiText}</div>
              </div>
            )}
            <Button size="small" type="primary" block style={{ marginTop: 8 }} onClick={() => nav('rep-rpt')}>进入完整经营看板（含六维/五篇大文章/预测） →</Button>
          </Col>
        </Row>
      </Card>

      <div style={{ marginTop: 10 }}><PerfOverview onPick={(d) => setDim(dim === d ? null : d)} picked={dim} /></div>
      {dim && (() => {
        const d = PERF_SYSTEM.find((x) => x.dim === dim)!;
        type M = { name: string; actual: number; target: number; unit: string; yoy: string; src: string; good?: string };
        const ms = d.metrics as unknown as M[];
        return (
          <Card size="small" title={`${dim} · 指标明细（可视化）${isBranch ? `（${branchName}口径）` : '（全行口径）'}`} style={{ marginTop: 10 }} extra={<span style={{ display: 'flex', gap: 8 }}><Button size="small" onClick={() => setDim(null)}>收起</Button><Button size="small" type="primary" onClick={() => nav('perf')}>进入六维明细页 →</Button></span>}>
            <Row gutter={12}>
              <Col span={14}><DimAchieveChart dim={dim} /></Col>
              <Col span={10}>
                <Table
                  size="small" pagination={false} rowKey="name" dataSource={ms}
                  columns={[
                    { title: '指标', dataIndex: 'name', render: (v: string, r) => <span>{v} <Tag style={{ fontSize: 10 }}>{(r as M).src}</Tag></span> },
                    { title: '实际/目标', width: 130, render: (_, r) => { const m = r as M; return `${m.actual}${m.unit} / ${m.target}${m.unit}`; } },
                    { title: '同比', dataIndex: 'yoy', width: 90 },
                  ]}
                />
                <div style={{ fontSize: 11.5, color: '#888', marginTop: 6 }}>左侧条形=达成率（虚线=目标线100%）；低优指标（不良率等）按 目标/实际 折算。口径：Z=招行指引/评分卡 · X=行方需求13-18。</div>
              </Col>
            </Row>
          </Card>
        );
      })()}

      {/* 分行行长：本行重大项目督办前置；总行行长：经营趋势+结构 */}
      {isBranch ? (
        <Card size="small" title={`${branchName}重大项目督办（${branchProjects.length}）`} style={{ marginTop: 10 }} extra={<Button size="small" type="primary" onClick={() => nav('sup-task')}>全部重大项目督办 →</Button>}>
          <Table
            size="small" pagination={false} rowKey="id" dataSource={branchProjects}
            columns={[
              { title: '项目', dataIndex: 'proj', render: (v: string, r) => <span><b>{v}</b><br /><span style={{ fontSize: 11, color: '#888' }}>{(r as { group: string }).group} · {(r as { amount: string }).amount}</span></span> },
              { title: '关注', dataIndex: 'attention', width: 130, render: (v: string) => <Tag color={v.includes('行长') || v.includes('董事长') ? 'red' : 'default'}>{v}</Tag> },
              { title: '进度', dataIndex: 'progress', width: 150, render: (v: number) => <Progress percent={v} size="small" /> },
              { title: '未决', width: 90, render: (_, r) => { const m = r as unknown as { pendings: Array<{ st: string }> }; const n = m.pendings.filter((x) => x.st !== '已办结').length; return <Tag color={n ? 'orange' : 'green'}>{n ? `${n}项待办` : '已清零'}</Tag>; } },
              { title: '操作', width: 100, render: (_, r) => <Button size="small" onClick={() => setOpenId((r as { groupId: string }).groupId)}>穿透360</Button> },
            ]}
          />
        </Card>
      ) : (
        <Row gutter={10} style={{ marginTop: 10 }}>
          <Col span={15}><Card size="small" title="经营趋势" extra={<a onClick={() => message.info('明细分析在决策分析页')}>明细分析</a>}><TrendChart /></Card></Col>
          <Col span={9}><Card size="small" title="客户结构" extra={<a onClick={() => nav('cust')}>名单管理</a>}><StructChart /><div style={{ fontSize: 11, color: '#888' }}>总行级 38 户 · 分行级 48 户</div></Card></Col>
        </Row>
      )}
      <Row gutter={10} style={{ marginTop: 10 }}>
        <Col span={12}>
          <Card size="small" title={isBranch ? `${branchName}经营排名（本行内）` : '机构经营排名'}>
            {(isBranch ? [...BRANCH_RANK].sort((a, b) => (a.name === branchName ? -1 : b.name === branchName ? 1 : 0)).slice(0, 5) : BRANCH_RANK).map((r) => (
              <div key={r.name} style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '7px 0', fontWeight: isBranch && r.name === branchName ? 700 : 400 }}>
                <span style={{ width: 64 }}>{r.name}</span><Progress percent={r.score} showInfo={false} style={{ flex: 1 }} /><b>{r.score}</b>
              </div>
            ))}
            {isBranch && <div style={{ fontSize: 11, color: '#888' }}>本行排第 1（辖内视角置顶）· 全行排名见实绩总览</div>}
          </Card>
        </Col>
        <Col span={12}>
          <Card size="small" title={isBranch ? '本行三环两链（辖内）' : '三环两链概览'} extra={<Button size="small" onClick={() => nav('mkt-opp')}>商机穿透 →</Button>}>
            <Row gutter={8}>
              {[
                ['内环 · 家谱', isBranch ? `开户 ${branchGroups.reduce((s, g) => s + g.homeCount, 0)} 户 · 建额 81%` : '开户 94% · 建额 81% · 产品 3.2 个'],
                ['中环 · 生态', isBranch ? `N端 ${branchGroups.reduce((s, g) => s + g.nEnd, 0)} 户 · 属地转介` : '战新 58% · 1端41 · N端326'],
                ['外环 · 团金', isBranch ? branchGroups[0]?.bEnd ?? '代发覆盖' : 'B端 71% · 代发 12.4 万人'],
              ].map((r) => (
                <Col span={8} key={r[0]}><Card size="small" type="inner" title={r[0]}><span style={{ fontSize: 12 }}>{r[1]}</span></Card></Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>
      <Card size="small" title={isBranch ? `${branchName}重点集团（${branchGroups.length}）` : '重点集团列表'} style={{ marginTop: 10 }} extra={<Button size="small" onClick={() => nav('cust')}>全部名单 →</Button>}>
        <Space style={{ marginBottom: 10 }}>
          <Input placeholder="集团 / 行业" value={q} onChange={(e) => setQ(e.target.value)} style={{ width: 240 }} />
          <Select value={lv} onChange={setLv} style={{ width: 130 }} allowClear placeholder="全部层级" options={[{ value: '总行级', label: '总行级' }, { value: '分行级', label: '分行级' }]} />
          <Button type="primary" onClick={() => undefined}>查询</Button>
        </Space>
        <Table
          size="small" rowKey="id" pagination={{ pageSize: 8, showTotal: (t) => `共 ${t} 户` }} dataSource={rows}
          columns={[
            { title: '集团名称', dataIndex: 'name', render: (v: string, r) => (<span><a onClick={() => setOpenId(r.id)}>{v}</a><br /><span style={{ color: '#888', fontSize: 11 }}>{r.industry}</span></span>) },
            { title: '层级', dataIndex: 'level', render: (v: string) => <Tag color={v === '总行级' ? 'red' : 'blue'}>{v}</Tag> },
            { title: '主办', dataIndex: 'branch', render: (v: string, r) => (<span>{v}<br /><span style={{ color: '#888' }}>{maskMgrs((r as { managers: string }).managers)}</span></span>) },
            { title: 'EVA(万)', dataIndex: 'eva' },
            { title: '营收(万)', dataIndex: 'revenue' },
            { title: '存款日均(亿)', dataIndex: 'deposit' },
            { title: '价值', dataIndex: 'tag', render: (v: string, r) => <Tag color={v === 'S' ? 'red' : v === 'A' ? 'blue' : 'green'}>{v} · {(r as { score: number }).score}</Tag> },
            { title: '操作', render: (_, r) => <Button size="small" onClick={() => setOpenId(r.id)}>客户 360</Button> },
          ]}
        />
      </Card>
      <Row gutter={10} style={{ marginTop: 10 }}>
        <Col span={12}>
          <Card
            size="small"
            title={isBranch ? `${branchName}待办与预警` : '前瞻预测 · 营收达成（实际+预测）'}
            extra={isBranch ? <Button size="small" onClick={() => nav('appr')}>审批中心 →</Button> : <Button size="small" onClick={() => nav('sup-task')}>重大项目督办 →</Button>}
          >
            {isBranch ? (
              <div>
                {[['审批', '南钢流贷定价待审批', '2 天'], ['评审', '经营规划书 2 份待评审', '4 月底'], ['纪要', '康尼拜访纪要距 48h 剩 6 小时', '6 小时'], ['结项', '先声司库诉求 2.6 个月未结项', '8 天']].map((t) => (
                  <div key={t[1]} style={{ padding: 8, border: '1px solid #eef1f6', borderRadius: 8, marginBottom: 7 }}><Tag color="blue">{t[0]}</Tag> {t[1]} <span style={{ float: 'right', color: '#888' }}>{t[2]}</span></div>
                ))}
              </div>
            ) : (
              <div><ForecastChart /><div style={{ fontSize: 11.5, color: '#888' }}>11-12 月预测营收 81/86 亿，缺口 4 亿→已纳入重大项目督办（南瑞中票+南钢银团+先声司库）。预警下沉至督办/客户360不再挤占总览。</div></div>
            )}
          </Card>
        </Col>
        <Col span={12}><Card size="small" title="五篇大文章投向"><FiveChart /></Card></Col>
      </Row>
      <CustomerDrawer openId={openId} onClose={() => setOpenId(null)} />
    </div>
  );
}

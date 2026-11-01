import { Button, Card, Col, Input, Progress, Row, Select, Space, Statistic, Table, Tag, Tooltip, message } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { BRANCH_RANK, GROUPS, MAJOR_PROJECTS, PERF_SYSTEM } from '../data';
import { useApp } from '../store';
import { useMemo, useState } from 'react';
import { DimAchieveChart, FiveChart, ForecastChart, StructChart, TrendChart } from '../components/Charts';
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

  const branchEva = Math.round(branchGroups.reduce((s, g) => s + g.eva, 0) / 100) / 100;
  const branchDep = Math.round(branchGroups.reduce((s, g) => s + g.deposit, 0) * 10) / 10;

  const kpis = isBranch
    ? [
        [`${branchName}战客`, `${branchGroups.length} 户`, `总行级 ${branchGroups.filter((g) => g.level === '总行级').length} · 分行级 ${branchGroups.filter((g) => g.level === '分行级').length}`],
        ['本行EVA', `${branchEva} 亿`, '+8.4% · 序时 86%'], ['存款日均', `${branchDep} 亿`, '+5.1%'],
        ['本行重大项目', `${branchProjects.length} 个`, `${branchProjects.filter((p) => p.pendings.some((x) => x.st === '逾期')).length} 项逾期`],
        ['协同落地率', '64%', '待提升 · 2项待承接'], ['预警户', `${branchGroups.filter((g) => g.risk === '预警').length} 户`, '压降中'],
      ]
    : [['战略集团', '86 户', '总行级 38 · 分行级 48'], ['EVA', '6.80 亿', '目标 8 亿 · 85%'], ['非息占比', '28.6%', '目标 32%'], ['口袋份额', '18% · 22%', '+1.2pct'], ['商机转化率', '34%', '目标 40%'], ['不良率', '0.62%', '优于目标']];

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
      <Row gutter={10} align="stretch">
        {kpis.map((k) => (
          <Col span={4} key={k[0]} style={{ display: 'flex' }}>
            <Card size="small" style={{ borderTop: `3px solid ${isBranch ? '#2456a6' : '#b01f24'}`, flex: 1 }}>
              <Statistic
                title={k[0] === '口袋份额' ? (<span>口袋份额 <Tooltip title="招行《一户一策指引》：负债=我行自营存款日均/客户货币资金；资产=我行FPA/客户有息负债。"><QuestionCircleOutlined /></Tooltip></span>) : k[0]}
                value={k[1]} valueStyle={{ fontSize: 20, whiteSpace: 'nowrap' }} suffix={<span style={{ fontSize: 11 }}>{k[2]}</span>}
              />
            </Card>
          </Col>
        ))}
      </Row>

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

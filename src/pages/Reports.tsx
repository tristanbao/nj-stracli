import { Button, Card, Col, Progress, Row, Table, Tabs, Tag, Tooltip, message } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { BRANCH_RANK, GROUPS, NORTH_DRIVERS, NORTH_STAR, PERF_SYSTEM, dimScores } from '../data';
import { BizChart, DimAchieveChart, DimRadar, FiveChart, ForecastChart, NorthStarTrendChart } from '../components/Charts';
import { useApp } from '../store';

export default function Reports({ anchor }: { anchor?: string }) {
  const { route, user, scopedGroups, nav } = useApp();
  const [tab, setTab] = useState('north');
  if (anchor === 'price' || route.startsWith('price')) {
    return (
      <div>
        <Card size="small" title="定价审批">
          <Table size="small" pagination={false} dataSource={[
            { k: '南钢 12 亿流贷 LPR-15bp', p: '3.90%', d: '授信审批部 · 风险管理部', s: '审批中' },
            { k: '南瑞 10 亿中票承销费率', p: '0.18%', d: '投资银行部 · 资金营运中心', s: '已通过' },
          ]} columns={[{ title: '业务', dataIndex: 'k' }, { title: '申请价', dataIndex: 'p' }, { title: '联动部门', dataIndex: 'd' }, { title: '状态', dataIndex: 's', render: (v: string) => <Tag color={v === '审批中' ? 'orange' : 'green'}>{v}</Tag> }, { title: '操作', render: () => <Button size="small" onClick={() => message.success('已提交')}>审批 / 回溯</Button> }]} />
        </Card>
        <Row gutter={10} style={{ marginTop: 10 }}>
          <Col span={12}><Card size="small" title="分润管理">转介开户按 5:5 连续 2 年；授信协同按份额分配，属地行承担相应贷后。 <Button size="small" type="primary" style={{ marginLeft: 8 }} onClick={() => message.success('分润参数已发布')}>发布规则</Button></Card></Col>
          <Col span={12}><Card size="small" title="经营团队">南钢服务团队：张经理(A) / 李经理(B) + 分行 3 人 + 投行 1 人 <Tag color="green">触达 100%</Tag></Card></Col>
        </Row>
      </div>
    );
  }

  // 完整经营看板（首页北极星 → 更多）：FPA牵引 + 六维 + 集团分层 + 预测
  if (route === 'rep-rpt') {
    const isBranch = user?.id === 'branch';
    const groups = isBranch ? scopedGroups : GROUPS;
    const fpaBal = Math.round(groups.reduce((s, g) => s + g.fpa, 0) * 10) / 10;
    const share = groups.length ? Math.round(groups.reduce((s, g) => s + (g.pocketL + g.pocketA) / 2, 0) / groups.length * 10) / 10 : 0;
    const eva = Math.round(groups.reduce((s, g) => s + g.eva, 0) / 100) / 100;
    const scores = dimScores();
    return (
      <div>
        <Card
          size="small"
          title={<span>战客经营分析看板 · 完整指标体系 <Tooltip title="口径：招行《一户一策指引》8项核心经营数据（营业净收入/净利息/非息/FPA/存款/负债口袋/贷款/资产口袋）+ 行方需求13-18（EVA/营收/存贷/投行/五篇大文章/商机）。主线=FPA综合份额（综合化渗透），底线=EVA+RAROC+不良率（价值与质量）。"><QuestionCircleOutlined style={{ marginLeft: 6, color: '#888' }} /></Tooltip></span>}
          extra={<span style={{ display: 'flex', gap: 8 }}><Button size="small" onClick={() => nav('home')}>回首页北极星</Button><Button size="small" type="primary" onClick={() => message.success('看板已导出（含集团分层明细）')}>导出</Button></span>}
        >
          <Row gutter={10}>
            {[
              { k: 'FPA综合份额（北极星）', v: isBranch ? `${share}%` : `${NORTH_STAR.fpaShare.actual}%`, s: isBranch ? '目标 19.5% · 口径=(负债+资产)/2' : `目标 ${NORTH_STAR.fpaShare.target}% · 缺口 ${(NORTH_STAR.fpaShare.target - NORTH_STAR.fpaShare.actual).toFixed(1)}pct`, pct: isBranch ? Math.round((share / 19.5) * 100) : Math.round((NORTH_STAR.fpaShare.actual / NORTH_STAR.fpaShare.target) * 100), c: '#b01f24' },
              { k: 'FPA余额（规模底座）', v: isBranch ? `${fpaBal} 亿` : `${NORTH_STAR.fpaBal.actual} 亿`, s: isBranch ? '辖内余额 · 目标 220 亿' : `目标 ${NORTH_STAR.fpaBal.target} 亿 · 同比 +8.8%`, pct: isBranch ? Math.round((fpaBal / 220) * 100) : Math.round((NORTH_STAR.fpaBal.actual / NORTH_STAR.fpaBal.target) * 100), c: '#2456a6' },
              { k: 'EVA（价值底线）', v: isBranch ? `${eva} 亿` : `${NORTH_STAR.eva.actual} 亿`, s: isBranch ? '辖内价值 · 序时 86%' : `目标 ${NORTH_STAR.eva.target} 亿 · 同比 +11.2%`, pct: isBranch ? 86 : Math.round((NORTH_STAR.eva.actual / NORTH_STAR.eva.target) * 100), c: '#b7791f' },
              { k: '非息占比（综合化）', v: `${NORTH_STAR.nonRate.actual}%`, s: `目标 ${NORTH_STAR.nonRate.target}% · 发债/撮合驱动`, pct: Math.round((NORTH_STAR.nonRate.actual / NORTH_STAR.nonRate.target) * 100), c: '#17815f' },
            ].map((x) => (
              <Col span={6} key={x.k}>
                <Card size="small" type="inner" style={{ borderTop: `3px solid ${x.c}`, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#888' }}>{x.k}</div>
                  <div style={{ fontSize: 22, fontWeight: 800 }}>{x.v}</div>
                  <Progress percent={Math.min(x.pct, 100)} size="small" strokeColor={x.c} />
                  <div style={{ fontSize: 11, color: '#888' }}>{x.s}</div>
                </Card>
              </Col>
            ))}
          </Row>
          <Tabs
            activeKey={tab}
            onChange={setTab}
            style={{ marginTop: 8 }}
            items={[
              { key: 'north', label: '北极星分解（缺口→动作→资源）' },
              { key: 'six', label: '六维指标体系' },
              { key: 'groups', label: '集团分层（86户）' },
              { key: 'forward', label: '预测与投向' },
            ]}
          />
          {tab === 'north' && (
            <Row gutter={10}>
              <Col span={14}>
                <Card size="small" type="inner" title="北极星趋势 · 份额（主线）+ 余额（底座）+ EVA（底线）">
                  <NorthStarTrendChart branch={isBranch} />
                  <div style={{ fontSize: 11.5, color: '#888' }}>解读：份额上行但未达目标 → 缺口在投行综合化（78%）与生态渗透（77%），资源向承销与N端/B端倾斜；EVA同步上行说明渗透未牺牲价值（RAROC 14.2%守住15%目标86%分位）。分行视角自动切换为辖内口径。</div>
                </Card>
              </Col>
              <Col span={10}>
                <Table
                  size="small" pagination={false} rowKey="key" dataSource={NORTH_DRIVERS}
                  columns={[
                    { title: '驱动', dataIndex: 'key', width: 90, render: (v: string) => <b>{v}</b> },
                    { title: '达成', dataIndex: 'pct', width: 90, render: (v: number) => <span><Progress percent={v} size="small" style={{ width: 60 }} /> {v}%</span> },
                    { title: '缺口→动作→资源', render: (_, r) => { const m = r as unknown as { gap: string; action: string; resource: string; owner: string }; return <span style={{ fontSize: 12 }}><span style={{ color: '#b01f24' }}>{m.gap}</span><br />{m.action}<br /><span style={{ color: '#888' }}>资源：{m.resource} · {m.owner}</span></span>; } },
                  ]}
                />
                <div style={{ fontSize: 11.5, color: '#888', marginTop: 6 }}>调整逻辑：哪个驱动达成率最低 → 下月资源与督办就压向哪里（如生态77% → 属地协同5:5分润 + 团金进场排期）。点击驱动行可穿透到商机/督办（演示：消息提示）。</div>
              </Col>
            </Row>
          )}
          {tab === 'six' && (
            <div>
              <Row gutter={10}>
                <Col span={8}><Card size="small" type="inner" title="六维达成率雷达"><DimRadar /></Card></Col>
                <Col span={16}>
                  <Table
                    size="small" pagination={false} rowKey="dim" dataSource={scores}
                    columns={[
                      { title: '维度', dataIndex: 'dim', width: 130 },
                      { title: '达成率', dataIndex: 'score', width: 220, render: (v: number, r) => <Progress percent={v} size="small" strokeColor={(r as { color: string }).color} /> },
                      { title: '短板 → 调整', render: (_, r) => { const d = (r as { dim: string }).dim; const m = PERF_SYSTEM.find((x) => x.dim === d)!; const weak = [...(m.metrics as Array<{ name: string; actual: number; target: number; good?: string }>)].sort((a, b) => (a.good === 'low' ? a.target / a.actual : a.actual / a.target) - (b.good === 'low' ? b.target / b.actual : b.actual / b.target))[0]; return <span style={{ fontSize: 12 }}>{weak.name}（{Math.round(Math.min(1, weak.good === 'low' ? weak.target / weak.actual : weak.actual / weak.target) * 100)}%）→ {d === '投行与综合化' ? '压中票/ABS发行窗口' : d === '客群与生态' ? '压N端开户与团金进场' : d === '价值创造' ? '压非息中收' : d === '规模与份额' ? '压司库归行与银团提款' : d === '协同与效率' ? '压协同合约落地' : '压预警闭环'}</span>; } },
                    ]}
                  />
                </Col>
              </Row>
              <Row gutter={10} style={{ marginTop: 10 }}>
                {PERF_SYSTEM.map((d) => (
                  <Col span={12} key={d.dim} style={{ marginBottom: 10 }}>
                    <Card size="small" type="inner" title={<span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 4, background: (d as { color: string }).color, marginRight: 6 }} />{d.dim}</span>}>
                      <DimAchieveChart dim={d.dim} />
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          )}
          {tab === 'groups' && (
            <Table
              size="small" rowKey="id" pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 户（演示20户全量86户）` }} dataSource={groups}
              columns={[
                { title: '集团', dataIndex: 'name', width: 170, render: (v: string, r) => { const m = r as unknown as { industry: string }; return <span><b>{v}</b><br /><span style={{ fontSize: 11, color: '#888' }}>{m.industry}</span></span>; } },
                { title: 'FPA份额%', width: 90, sorter: (a, b) => ((a as unknown as { pocketL: number; pocketA: number }).pocketL + (a as unknown as { pocketA: number }).pocketA) / 2 - (((b as unknown as { pocketL: number; pocketA: number }).pocketL + (b as unknown as { pocketA: number }).pocketA) / 2), render: (_, r) => { const m = r as unknown as { pocketL: number; pocketA: number }; return <b>{((m.pocketL + m.pocketA) / 2).toFixed(1)}%</b>; } },
                { title: 'FPA(亿)', dataIndex: 'fpa', width: 70, sorter: (a, b) => (a as { fpa: number }).fpa - (b as { fpa: number }).fpa },
                { title: 'EVA(万)', dataIndex: 'eva', width: 90, sorter: (a, b) => (a as { eva: number }).eva - (b as { eva: number }).eva },
                { title: '营收(万)', dataIndex: 'revenue', width: 90 },
                { title: '存款(亿)', dataIndex: 'deposit', width: 80 },
                { title: '非息%', dataIndex: 'nonRate', width: 70 },
                { title: '价值', dataIndex: 'tag', width: 90, render: (v: string, r) => <Tag color={v === 'S' ? 'red' : v === 'A' ? 'blue' : 'green'}>{v} · {(r as { score: number }).score}</Tag> },
                { title: '操作', width: 90, render: (_, r) => <Button size="small" onClick={() => message.success(`已穿透 ${(r as { name: string }).name} 客户360（演示）`)}>客户360</Button> },
              ]}
            />
          )}
          {tab === 'forward' && (
            <Row gutter={10}>
              <Col span={12}>
                <Card size="small" type="inner" title="前瞻预测 · 营收达成（实际+预测）"><ForecastChart /><div style={{ fontSize: 11.5, color: '#888' }}>11-12月预测 81/86 亿，缺口 4 亿 → 已纳入重大项目督办（南瑞中票 + 南钢银团 + 先声司库）。</div></Card>
              </Col>
              <Col span={12}>
                <Card size="small" type="inner" title="五篇大文章投向"><FiveChart /></Card>
              </Col>
              <Col span={24} style={{ marginTop: 10 }}>
                <Card size="small" type="inner" title="机构经营排名（FPA份额视角）">
                  {BRANCH_RANK.map((r) => (
                    <div key={r.name} style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '6px 0' }}>
                      <span style={{ width: 70 }}>{r.name}</span><Progress percent={r.score} showInfo={false} style={{ flex: 1 }} /><b>{r.score}</b>
                    </div>
                  ))}
                </Card>
              </Col>
            </Row>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div>
      <Card size="small" title="集团经营合作分析" extra={<span style={{ display: 'flex', gap: 8 }}><Button size="small" type="primary" onClick={() => nav('rep-rpt')}>更多 → 完整经营看板</Button><Button size="small" onClick={() => message.success('已按统一模板导出')}>导出模板</Button></span>}>
        <Row gutter={10}>
          <Col span={12}><BizChart /></Col>
          <Col span={12}>
            <Table size="small" pagination={false} dataSource={GROUPS.slice(0, 5)} rowKey="id"
              columns={[{ title: '集团', dataIndex: 'name' }, { title: '到期', render: (_, __, i) => `2026-0${4 + i}` }, { title: '敞口(亿)', dataIndex: 'loan', render: (v: number) => (v * 0.4).toFixed(1) }, { title: '余额(亿)', dataIndex: 'loan', render: (v: number) => (v * 0.3).toFixed(1) }]} />
          </Col>
        </Row>
      </Card>
      <Row gutter={10} style={{ marginTop: 10 }}>
        <Col span={12}>
          <Card size="small" title="决策分析报表">
            <Tabs items={[{ key: 'a', label: '业务分析' }, { key: 'b', label: '营销分析' }, { key: 'c', label: '结构分析' }, { key: 'd', label: '经营分析' }]} />
            <p style={{ fontSize: 12, color: '#666' }}>价值贡献 / 存贷 / 表外 / 资产质量 / 评级 · 支持图、表、明细导出</p>
            <Button size="small" onClick={() => message.success('报表明细已导出')}>明细 / 导出</Button>
          </Card>
        </Col>
        <Col span={12}>
          <Card size="small" title="画像标签与价值分层">
            {['总行级 / 分行级', '先进制造', '司库意向', '发债潜力', '团金已覆盖'].map((t) => <Tag key={t} color="blue" style={{ margin: 2 }}>{t}</Tag>)}
            <p style={{ fontSize: 12, color: '#666', marginTop: 8 }}>当期 35 / 潜在 30 / 粘性 20 / 风险 15 → S(≥90) / A(80–90) / B(65–80) / C(&lt;65)</p>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

import { Button, Card, Col, Descriptions, Drawer, Progress, Row, Space, Table, Tabs, Tag, Timeline, message } from 'antd';
import { useMemo, useState } from 'react';
import { GROUPS, OPPORTUNITIES, bizActionsOf, equityOf, keyPersonsOf, planTasksOf, riskRowsOf, scorePartsOf, scoreTrendOf, visitLogsOf } from '../data';
import { EquityGraph, RingsGraph, ScoreTrendChart } from './Charts';

function tagColor(t: string) {
  if (['上市公司', '产业链链主', '主办行', '发债主体'].includes(t)) return 'red';
  if (['央企二级', '省属国企', '民营龙头', '司库客户', '1端核心'].includes(t)) return 'blue';
  if (t.includes('N端') || t.includes('团金') || t.includes('代发') || t.includes('跨境')) return 'green';
  if (t.includes('风险') || t.includes('压降') || t.includes('续作')) return 'orange';
  return 'default';
}

export default function CustomerDrawer({ openId, onClose }: { openId: string | null; onClose: () => void }) {
  const [oppFilter, setOppFilter] = useState<string>('all');
  const g = GROUPS.find((x) => x.id === openId);
  const opps = useMemo(() => (g ? OPPORTUNITIES.filter((o) => o.groupId === g.id) : []), [g?.id]);
  const trend = useMemo(() => scoreTrendOf(g?.score ?? 80), [g?.score]);
  const delta = (g?.score ?? 80) - trend[trend.length - 2];
  const parts = useMemo(() => scorePartsOf(g?.score ?? 80, g?.tag ?? 'B'), [g?.score, g?.tag]);
  const persons = useMemo(() => (g ? keyPersonsOf(g.id, g.name) : []), [g?.id]);
  const eqRows = useMemo(() => (g ? equityOf(g) : []), [g?.id]);
  const bizRows = useMemo(() => (g ? bizActionsOf(g) : []), [g?.id]);
  const planRows = useMemo(() => (g ? planTasksOf(g) : []), [g?.id]);
  const logRows = useMemo(() => (g ? visitLogsOf(g) : []), [g?.id]);
  const riskRows = useMemo(() => (g ? riskRowsOf(g) : []), [g?.id]);
  const homes = useMemo(() => eqRows.slice(0, 8).map((e) => ({ name: `${e.name.split('\n')[0] ?? e.name}（${e.share}%）`, open: e.open, credit: e.credit, loan: e.loan })), [eqRows]);

  const newCount = opps.filter((o) => o.isNew).length;
  const highCount = opps.filter((o) => o.priority === '高').length;
  const activeCount = opps.filter((o) => !['已达成', '已失败', '已落地', '已关闭'].includes(o.stage)).length;

  const oppRows = useMemo(() => {
    if (oppFilter === 'new') return opps.filter((o) => o.isNew);
    if (oppFilter === 'high') return opps.filter((o) => o.priority === '高');
    if (oppFilter === 'cros') return opps.filter((o) => o.category === '公私联动');
    if (oppFilter === 'active') return opps.filter((o) => (o.progress ?? 0) < 100 && !['已达成', '已落地'].includes(o.stage));
    if (oppFilter === 'risk') return opps.filter((o) => (o.daysLeft ?? 99) <= 20 && (o.progress ?? 0) < 60 && !['已达成', '已失败'].includes(o.stage));
    return opps;
  }, [opps, oppFilter]);

  if (!g) return <Drawer title="客户 360" width={1020} open={!!openId} onClose={onClose} />;

  return (
    <Drawer title={`${g.name} · 客户 360全景`} width={1060} open={!!g} onClose={onClose}>
      <Card size="small" style={{ marginBottom: 10, borderTop: '3px solid #b01f24' }}>
        <Space wrap>
          <Tag color={g.level === '总行级' ? 'red' : 'blue'}>{g.level}</Tag>
          <Tag color={g.tag === 'S' ? 'red' : g.tag === 'A' ? 'blue' : g.tag === 'B' ? 'green' : 'orange'}>{g.tag} · {g.score} 分</Tag>
          <Tag color={delta >= 0 ? 'green' : 'red'}>{delta >= 0 ? `较上期 +${delta}` : `较上期 ${delta}`}</Tag>
          <Tag color={g.risk === '预警' ? 'red' : 'green'}>{g.risk}</Tag>
          <span style={{ fontSize: 12, color: '#555' }}>{g.industry} · 主办 {g.branch} · 管户 {g.managers}</span>
        </Space>
        <div style={{ marginTop: 8 }}>
          {(g.tags ?? []).map((t) => <Tag key={t} color={tagColor(t)} style={{ marginBottom: 4 }}>{t}</Tag>)}
        </div>
        <Row gutter={10} style={{ marginTop: 8 }}>
          {[['EVA', `${g.eva} 万`], ['营收', `${g.revenue} 万`], ['存款日均 / FPA', `${g.deposit} 亿 / ${g.fpa} 亿`], ['口袋负债 / 资产', `${g.pocketL}% / ${g.pocketA}%`], ['在跟商机', `${opps.length} 个`], ['1+10 进展', `${g.rate}%`]].map((k) => (
            <Col span={4} key={k[0]}>
              <Card size="small" type="inner" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#888' }}>{k[0]}</div>
                <b style={{ fontSize: 15 }}>{k[1]}</b>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
      <Tabs
        items={[
          {
            key: 'value', label: '价值评分', children: (
              <div>
                <Row gutter={10}>
                  <Col span={9}>
                    <Card size="small" type="inner" title="综合评分 · 等级">
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                        <span style={{ fontSize: 40, fontWeight: 800, color: g.tag === 'S' ? '#b01f24' : '#2456a6' }}>{g.score}</span>
                        <Tag color={g.tag === 'S' ? 'red' : g.tag === 'A' ? 'blue' : 'green'} style={{ fontSize: 14 }}>{g.tag} 类</Tag>
                        <Tag color={delta >= 0 ? 'green' : 'red'}>{delta >= 0 ? `+${delta} 分` : `${delta} 分`} vs 上期 {trend[trend.length - 2]} 分</Tag>
                      </div>
                      <div style={{ fontSize: 12, color: '#555' }}>S线 85 分 · {g.score >= 85 ? `已达 S（超 ${g.score - 85} 分）` : `距 S 还差 ${85 - g.score} 分，主要卡在综合化与生态`} · C线 60 分</div>
                      <ScoreTrendChart score={g.score} />
                    </Card>
                  </Col>
                  <Col span={15}>
                    <Card size="small" type="inner" title="维度得分明细" extra={<Button size="small" onClick={() => message.success('评分明细已导出')}>导出</Button>}>
                      <Table
                        size="small" pagination={false} rowKey="item" dataSource={parts}
                        columns={[
                          { title: '维度', dataIndex: 'item' },
                          { title: '权重', dataIndex: 'w', width: 70 },
                          { title: '维度得分', dataIndex: 'v', width: 130, render: (v: number) => <span><Progress percent={v} size="small" style={{ width: 80 }} /> <b>{v}</b></span> },
                          { title: '折算', dataIndex: 'got', width: 80 },
                        ]}
                      />
                      <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                        <Button size="small" type="primary" onClick={() => message.success('调层申请已提交评审')}>发起调层</Button>
                        <Button size="small" onClick={() => message.success('已提请复核（盈利/规模口径）')}>口径复核</Button>
                      </div>
                    </Card>
                  </Col>
                </Row>
              </div>
            ),
          },
          {
            key: 'base', label: '基本信息 · 股权图谱', children: (
              <div>
                <Descriptions column={2} size="small" bordered>
                  <Descriptions.Item label="工商注册">{g.founded} · 主营{g.industry}</Descriptions.Item>
                  <Descriptions.Item label="授信同业">{g.credit}</Descriptions.Item>
                  <Descriptions.Item label="股权家谱">顶点下穿 · {g.homeCount} 家家谱成员 · 开户率 90%+</Descriptions.Item>
                  <Descriptions.Item label="管户团队">{g.managers} · 主办 {g.branch} · 投行/交易银行双线</Descriptions.Item>
                </Descriptions>
                <Row gutter={10} style={{ marginTop: 10 }}>
                  <Col span={14}>
                    <Card size="small" type="inner" title="股权关系图谱" extra={<span style={{ fontSize: 11, color: '#888' }}>可缩放 · 点击节点收起/展开</span>}>
                      <EquityGraph name={g.name} homeCount={g.homeCount} />
                    </Card>
                  </Col>
                  <Col span={10}>
                    <Card size="small" type="inner" title={`家谱成员持股明细（前 ${homes.length} 户）`} extra={<Button size="small" onClick={() => message.success('股权穿透报告已导出')}>导出</Button>}>
                      <Table
                        size="small" pagination={false} dataSource={eqRows.slice(0, 8)} rowKey="name"
                        columns={[
                          { title: '成员', dataIndex: 'name' },
                          { title: '持股', dataIndex: 'share', width: 80, render: (v: number) => <b style={{ color: v >= 51 ? '#b01f24' : '#2456a6' }}>{v}%</b> },
                          { title: '层级', dataIndex: 'tier', width: 100, render: (v: string) => <Tag color={v === '核心上市主体' ? 'red' : v === '一级控股' ? 'blue' : 'default'}>{v}</Tag> },
                          { title: '开户/授信', width: 110, render: (_, r) => <span>{(r as { open: string }).open} · {(r as { credit: string }).credit}</span> },
                          { title: '用信', dataIndex: 'loan', width: 70 },
                        ]}
                      />
                      <div style={{ fontSize: 12, color: '#555', marginTop: 6 }}>绝对控股（≥51%）红色标注 · 与左侧图谱持股比例一致 · 未开户成员一键转线索。</div>
                      <Button size="small" style={{ marginTop: 6 }} onClick={() => message.success('未开户成员已转商机线索')}>未开户转线索</Button>
                    </Card>
                  </Col>
                </Row>
              </div>
            ),
          },
          {
            key: 'opp', label: `商机线索（${opps.length}）`, children: (
              <div>
                <Row gutter={10} style={{ marginBottom: 8 }}>
                  {[
                    ['累计商机', `${opps.length} 个`, 'all'],
                    [`本月新增`, `${newCount} 个`, 'new'],
                    ['高优先级', `${highCount} 个`, 'high'],
                    ['跟进中', `${activeCount} 个`, 'active'],
                  ].map((s) => (
                    <Col span={6} key={s[0]}>
                      <Card size="small" type="inner" style={{ textAlign: 'center', borderColor: oppFilter === s[2] ? '#2456a6' : undefined, cursor: 'pointer' }} onClick={() => setOppFilter(s[2])}>
                        <div style={{ fontSize: 11, color: '#888' }}>{s[0]}</div>
                        <b style={{ fontSize: 16 }}>{s[1]}</b>
                      </Card>
                    </Col>
                  ))}
                </Row>
                <Space style={{ marginBottom: 8 }}>
                  <Button size={oppFilter === 'all' ? 'small' : 'small'} type={oppFilter === 'all' ? 'primary' : 'default'} onClick={() => setOppFilter('all')}>全部</Button>
                  <Button size="small" type={oppFilter === 'new' ? 'primary' : 'default'} onClick={() => setOppFilter('new')}>新增</Button>
                  <Button size="small" type={oppFilter === 'high' ? 'primary' : 'default'} onClick={() => setOppFilter('high')}>高优先级</Button>
                  <Button size="small" type={oppFilter === 'active' ? 'primary' : 'default'} onClick={() => setOppFilter('active')}>跟进中</Button>
                  <Button size="small" type={oppFilter === 'risk' ? 'primary' : 'default'} danger={oppFilter === 'risk'} onClick={() => setOppFilter('risk')}>临期预警</Button>
                  <Button size="small" type={oppFilter === 'cros' ? 'primary' : 'default'} style={oppFilter === 'cros' ? { background: '#722ed1', borderColor: '#722ed1', color: '#fff' } : { color: '#722ed1', borderColor: '#d3adf7' }} onClick={() => setOppFilter('cros')}>公私联动</Button>
                  <Button size="small" onClick={() => message.success('商机线索已新建进入待营销')}>+ 新建线索</Button>
                </Space>
                <Table
                  size="small" rowKey="id" pagination={false} dataSource={oppRows}
                  columns={[
                    {
                      title: '商机', dataIndex: 'title', width: 240,
                      render: (v: string, r) => { const m = r as unknown as { update: string; owner: string; isNew?: boolean; created?: string }; return <span><b>{v}</b> {m.isNew && <Tag color="red">新增</Tag>}<br /><span style={{ fontSize: 11, color: '#888' }}>{m.update} · {m.owner} · 创建 {m.created}</span></span>; },
                    },
                    { title: '类别', dataIndex: 'category', width: 80, render: (v: string) => <Tag color={v === '公私联动' ? 'purple' : 'blue'}>{v}</Tag> },
                    { title: '金额', dataIndex: 'amount', width: 80 },
                    { title: '优先级', dataIndex: 'priority', width: 70, render: (v: string) => <Tag color={v === '高' ? 'red' : 'default'}>{v}</Tag> },
                    { title: '阶段', dataIndex: 'stage', width: 85, render: (v: string) => <Tag color={v === '签约落地' || v === '已达成' || v === '协同中' || v === '执行中' || v === '已落地' ? 'green' : v === '已失败' ? 'red' : v === '方案制定' || v === '陪标中' ? 'purple' : v.includes('待') || v === '线索' ? 'orange' : 'blue'}>{v}</Tag> },
                    {
                      title: '预计完成', width: 130,
                      render: (_, r) => { const m = r as unknown as { due?: string; daysLeft?: number; progress?: number }; const risk = (m.daysLeft ?? 99) <= 20 && (m.progress ?? 0) < 60; return <span>{m.due}<br /><Tag color={risk ? 'red' : (m.daysLeft ?? 99) <= 30 ? 'orange' : 'green'}>剩 {m.daysLeft} 天</Tag></span>; },
                    },
                    { title: '跟进进度', width: 140, render: (_, r) => { const m = r as unknown as { progress?: number }; return <Progress percent={m.progress ?? 0} size="small" />; } },
                    { title: '操作', width: 190, render: () => <span><Button size="small" type="primary" onClick={() => message.success('跟进记录已更新进度+5%')}>跟进</Button><Button size="small" style={{ marginLeft: 6 }} onClick={() => message.success('已转成交进入放款/落地流程')}>转成交</Button><Button size="small" danger style={{ marginLeft: 6 }} onClick={() => message.success('异常已上报纳入督办')}>异常</Button></span> },
                  ]}
                  locale={{ emptyText: '该筛选下暂无商机' }}
                />
              </div>
            ),
          },
          {
            key: 'rings', label: '三环两链', children: (
              <div>
                <Card size="small" type="inner" title="战略关系全图" extra={<span style={{ fontSize: 11, color: '#888' }}>红=集团 · 蓝=内环 · 绿=中环 · 黄=外环 · 紫=两链</span>}>
                  <RingsGraph name={g.name} homeCount={g.homeCount} nEnd={g.nEnd} />
                </Card>
                <Row gutter={10} style={{ marginTop: 10 }}>
                  <Col span={8}>
                    <Card size="small" type="inner" title={`内环 · 家谱 ${g.homeCount} 户`} extra={<a onClick={() => message.success('家谱穿透图谱已打开')}>穿透</a>}>
                      <Progress percent={94} size="small" /><div style={{ fontSize: 12 }}>开户 {Math.ceil(g.homeCount * 0.9)}/{g.homeCount} · 建额 {Math.ceil(g.homeCount * 0.75)} · 提用 {Math.ceil(g.homeCount * 0.6)}</div>
                      <Table size="small" pagination={false} showHeader={false} style={{ marginTop: 6 }} dataSource={[{ k: '核心主体', v: '全覆盖 · 授信/发债' }, { k: '子公司', v: `逐户建额 · 产品 ${(2 + g.score % 3).toFixed(1)} 个/户` }, { k: '孙公司', v: '确权开户 · 归集现金' }]} columns={[{ dataIndex: 'k', width: 80 }, { dataIndex: 'v' }]} />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card size="small" type="inner" title={`中环 · 生态 N端 ${g.nEnd} 户`} extra={<a onClick={() => message.success('N端白名单已下发属地行')}>转介</a>}>
                      <Progress percent={64} size="small" /><div style={{ fontSize: 12 }}>1端 3 户 · N端 {g.nEnd} 户 · 已投 {(g.nEnd * 0.04).toFixed(1)} 亿</div>
                      <Table size="small" pagination={false} showHeader={false} style={{ marginTop: 6 }} dataSource={[{ k: '1端链主', v: '确权/直贷/票据/保理' }, { k: 'N端', v: `白名单 ${Math.ceil(g.nEnd * 0.4)} 户已转介` }, { k: '战新', v: '专精特新优先 · 批量授信' }]} columns={[{ dataIndex: 'k', width: 80 }, { dataIndex: 'v' }]} />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card size="small" type="inner" title="外环 · 团金 + 两链" extra={<a onClick={() => message.success('团金场景方案已推送')}>方案</a>}>
                      <Progress percent={71} size="small" /><div style={{ fontSize: 12 }}>{g.bEnd}</div>
                      <Table size="small" pagination={false} showHeader={false} style={{ marginTop: 6 }} dataSource={[{ k: 'B端', v: '代发/场景/理财渗透' }, { k: '产业链', v: '上游采购 · 下游销售' }, { k: '投资链', v: '发债/基金/撮合联动' }]} columns={[{ dataIndex: 'k', width: 80 }, { dataIndex: 'v' }]} />
                    </Card>
                  </Col>
                </Row>
              </div>
            ),
          },
          {
            key: 'key', label: '关键人 · 联系方式', children: (
              <div>
                <Card size="small" type="inner" title="联系方式管理" extra={<span style={{ display: 'flex', gap: 8 }}><Button size="small" onClick={() => message.success('补充联系人已提交加分待审')}>+ 补充联系人</Button><Button size="small" type="primary" onClick={() => message.success('查看申请已提交关键人审批')}>申请查看</Button></span>}>
                  <Table
                    size="small" rowKey="id" pagination={false} dataSource={persons}
                    columns={[
                      { title: '姓名', dataIndex: 'name', width: 90 },
                      { title: '职务/部门', width: 130, render: (_, r) => { const m = r as unknown as { post: string; dept: string }; return `${m.post} · ${m.dept}`; } },
                      { title: '联系方式', dataIndex: 'masked', width: 120, render: (v: string, r) => <span>{v} <Tag style={{ fontSize: 10 }} color={(r as unknown as { approved: string }).approved === '已公开' ? 'green' : (r as unknown as { approved: string }).approved === '待审批' ? 'orange' : 'default'}>{(r as unknown as { approved: string }).approved}</Tag></span> },
                      { title: '覆盖', dataIndex: 'coverage' },
                      { title: '提供人贡献', width: 150, render: (_, r) => { const m = r as unknown as { contributor: string; points: number }; return <span>{m.contributor} <Tag color="gold">+{m.points}</Tag></span>; } },
                      { title: '操作', width: 170, render: (_, r) => { const m = r as unknown as { approved: string }; return m.approved === '已公开' ? <Button size="small" onClick={() => message.success('号码查看已记录（脱敏审计）')}>查看号码</Button> : m.approved === '待审批' ? <Button size="small" onClick={() => message.success('审批进度：分管行长待签')}>催审批</Button> : <Button size="small" type="primary" onClick={() => message.success('补充后经审批公开并加分')}>补充</Button>; } },
                    ]}
                  />
                  <div style={{ fontSize: 12, color: '#555', marginTop: 6 }}>补充有效联系人经审批公开后按职级加分（董事长 +20 / 财务总监 +25 / 董秘 +18）纳入客户经理贡献；查看完整号码需审批并留痕审计。</div>
                </Card>
              </div>
            ),
          },
          {
            key: 'biz', label: '经营合作 · 动作台账', children: (
              <Table
                size="small" pagination={false} rowKey="act" dataSource={bizRows}
                columns={[
                  { title: '日期', dataIndex: 'date', width: 60 },
                  { title: '经营动作', dataIndex: 'act', width: 210 },
                  { title: '实绩结果', dataIndex: 'result' },
                  { title: '商机关联', dataIndex: 'opp', width: 190 },
                  { title: '操作', width: 90, render: () => <Button size="small" onClick={() => message.success('动作凭证/放款回单已调阅')}>凭证</Button> },
                ]}
              />
            ),
          },
          {
            key: 'plan', label: '规划执行 · 一户一策', children: (
              <Table
                size="small" pagination={false} rowKey="task" dataSource={planRows}
                columns={[
                  { title: '规划任务/目标', dataIndex: 'task', width: 170 },
                  { title: '责任人', dataIndex: 'owner', width: 120 },
                  { title: '关键动作', dataIndex: 'act' },
                  { title: '已落地实绩', dataIndex: 'done' },
                  { title: '进展/下一步', dataIndex: 'p', width: 150 },
                  { title: '操作', width: 80, render: () => <Button size="small" type="primary" onClick={() => message.success('任务进度已更新并同步督办')}>推进</Button> },
                ]}
              />
            ),
          },
          {
            key: 'log', label: '往来与风险', children: (
              <Row gutter={10}>
                <Col span={12}>
                  <Card size="small" type="inner" title="经营活动往来（动作 → 结果）">
                    <Timeline items={logRows.map((l) => ({ children: l.act }))} />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small" type="inner" title="风险处置（点 → 动作 → 结果）" extra={<Button size="small" danger onClick={() => message.success('风险缓释动作已派发责任人')}>派发</Button>}>
                    <Table size="small" pagination={false} rowKey="k" dataSource={riskRows} columns={[{ title: '风险点', dataIndex: 'k', width: 110 }, { title: '处置动作/进展结果', dataIndex: 'act' }, { title: '进度', dataIndex: 'p', width: 90 }]} />
                  </Card>
                </Col>
              </Row>
            ),
          },
        ]}
      />
    </Drawer>
  );
}

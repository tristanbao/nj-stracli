import { Button, Card, Col, Progress, Row, Select, Space, Table, Tabs, Tag, message } from 'antd';
import { useMemo, useState } from 'react';
import { COOP_PROJECTS, MAJOR_PROJECTS, PERF_SYSTEM, dimScores, dimWeak } from '../data';
import { useApp } from '../store';
import { CoopMapChart, DimAchieveChart, DimRadar } from '../components/Charts';
import CustomerDrawer from '../components/CustomerDrawer';

function PerfOverview({ onPick, picked }: { onPick: (d: string) => void; picked?: string | null }) {
  const { nav } = useApp();
  const scores = dimScores();
  return (
    <Card size="small" title="实绩总览 · 六维达成率" extra={<Button size="small" type="primary" onClick={() => nav('perf')}>查看六维明细 →</Button>}>
      <Row gutter={10}>
        <Col span={9}><DimRadar /></Col>
        <Col span={15}>
          <Table
            size="small" pagination={false} rowKey="dim" dataSource={scores}
            rowClassName={(r) => (r as { dim: string }).dim === picked ? 'ant-table-row-selected' : ''}
            onRow={(r) => ({ onClick: () => onPick(r.dim), style: { cursor: 'pointer', background: (r as { dim: string }).dim === picked ? '#eef4ff' : undefined } })}
            columns={[
              { title: '维度', dataIndex: 'dim' },
              { title: '达成率', dataIndex: 'score', width: 180, render: (v: number, r) => <Progress percent={v} size="small" strokeColor={(r as { color: string }).color} /> },
              { title: '短板指标', render: (_, r) => { const w = dimWeak((r as unknown as { dim: string }).dim); return <span style={{ fontSize: 12 }}>{w.name}（{w.pct}%）</span>; } },
            ]}
          />
        </Col>
      </Row>
    </Card>
  );
}

export { PerfOverview };

export default function Supervise({ anchor }: { anchor?: string }) {
  const { nav } = useApp();
  const [lv, setLv] = useState<string>('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>('mp1');
  const projects = useMemo(() => MAJOR_PROJECTS.filter((p) => !lv || p.level === lv), [lv]);
  const pendingAll = useMemo(() => projects.flatMap((p) => p.pendings.filter((x) => x.st !== '已办结').map((x) => ({ ...x, proj: p.proj, group: p.group, groupId: p.groupId, attention: p.attention }))), [projects]);
  const tab: string =
    anchor === 'sup-coop' ? 'coop'
    : anchor === 'sup-task' ? 'task'
    : anchor === 'perf' ? 'perf' : 'task';
  const go = (k: string) => nav(k === 'perf' ? 'perf' : k === 'task' ? 'sup-task' : 'sup-coop');
  return (
    <Card
      size="small"
      title={tab === 'perf' ? '经营实绩 · 六维指标体系' : '战略督办'}
      extra={tab !== 'perf' ? <span style={{ display: 'flex', gap: 8 }}><Button size="small" onClick={() => message.success('已导出（含承接确认状态）')}>导出</Button><Button size="small" type="primary" onClick={() => message.success('督办提醒已发送至未达序时机构')}>一键督办</Button></span> : undefined}
    >
      <Tabs
        activeKey={tab}
        onChange={go}
        items={[
          ...(tab === 'perf' ? [{ key: 'perf', label: '六维明细' }] : []),
          { key: 'task', label: '重大项目督办' },
          { key: 'coop', label: '协同调度' },
        ]}
      />
      {(tab === 'task') && (
        <div>
          <Row gutter={10} style={{ marginBottom: 10 }}>
            {[
              ['在督项目', `${projects.length} 个 · 总规模 ${(projects.reduce((s, p) => s + parseFloat(p.amount), 0)).toFixed(1).replace(/\.0$/, '')} 级`],
              ['行长/董事长关注', `${projects.filter((p) => p.attention.includes('行长') || p.attention.includes('董事长')).length} 个`],
              ['未决事项', `${pendingAll.length} 项 · 逾期 ${pendingAll.filter((x) => x.st === '逾期').length} 项`],
              ['平均进度', `${Math.round(projects.reduce((s, p) => s + p.progress, 0) / Math.max(1, projects.length))}%`],
            ].map((k) => (
              <Col span={6} key={k[0]}>
                <Card size="small" type="inner" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#888' }}>{k[0]}</div>
                  <b style={{ fontSize: 15 }}>{k[1]}</b>
                </Card>
              </Col>
            ))}
          </Row>
          <Space style={{ marginBottom: 10 }}>
            <Select value={lv} onChange={setLv} style={{ width: 150 }} allowClear placeholder="全部层级" options={[{ value: '总行级', label: '总行级重大项目' }, { value: '分行级', label: '分行级重大项目' }]} />
            <Button size="small" onClick={() => message.success('督办清单已导出（含未决事项）')}>导出督办清单</Button>
            <Button size="small" type="primary" onClick={() => message.success('逾期事项已一键催办至责任部门')}>逾期一键催办</Button>
            <Button size="small" onClick={() => message.success('已发起新增重大项目立项')}>+ 立项</Button>
          </Space>
          <Row gutter={10}>
            <Col span={15}>
              <Table
                size="small" pagination={false} rowKey="id" dataSource={projects}
                rowClassName={(r) => ((r as { id: string }).id === expanded ? 'ant-table-row-selected' : '')}
                onRow={(r) => ({ onClick: () => setExpanded(expanded === (r as { id: string }).id ? null : (r as { id: string }).id), style: { cursor: 'pointer' } })}
                expandable={{
                  expandedRowKeys: expanded ? [expanded] : [],
                  onExpand: (e, r) => setExpanded(e ? (r as { id: string }).id : null),
                  expandedRowRender: (r) => {
                    const p = r as unknown as { miles: Array<{ n: string; done: boolean }>; pendings: Array<{ item: string; owner: string; ddl: string; st: string }>; coop: string[]; lead: string; id: string; groupId: string };
                    return (
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>里程碑（随清随结）</div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                          {p.miles.map((m) => <Tag key={m.n} color={m.done ? 'green' : 'orange'}>{m.done ? '✓ ' : '○ '}{m.n}</Tag>)}
                        </div>
                        <Table
                          size="small" pagination={false} rowKey="item" dataSource={p.pendings}
                          columns={[
                            { title: '未决事项', dataIndex: 'item' },
                            { title: '责任部门/人', dataIndex: 'owner', width: 170 },
                            { title: '期限', dataIndex: 'ddl', width: 80 },
                            {
                              title: '状态', dataIndex: 'st', width: 90,
                              render: (v: string) => <Tag color={v === '已办结' ? 'green' : v === '逾期' ? 'red' : 'blue'}>{v}</Tag>,
                            },
                            {
                              title: '督办', width: 150,
                              render: (_, rr) => ((rr as { st: string }).st === '已办结'
                                ? <span style={{ color: '#17815f', fontSize: 12 }}>已办结归档</span>
                                : <Space><Button size="small" onClick={(e) => { e.stopPropagation(); message.success('已催办责任人'); }}>催办</Button><Button size="small" onClick={(e) => { e.stopPropagation(); message.success('事项已办结归档，随清随结'); }}>办结</Button></Space>),
                            },
                          ]}
                        />
                        <div style={{ fontSize: 12, color: '#555', marginTop: 6 }}>协同：主办 {p.lead} · {p.coop.join(' · ')}</div>
                        <div style={{ marginTop: 6 }}><Button size="small" type="primary" onClick={(e) => { e.stopPropagation(); setOpenId(p.groupId); }}>穿透客户360 →</Button></div>
                      </div>
                    );
                  },
                }}
                columns={[
                  {
                    title: '重大项目', dataIndex: 'proj', width: 220,
                    render: (v: string, r) => { const m = r as unknown as { group: string; amount: string; field: string; attention: string; level: string }; return <span><b>{v}</b> <Tag color={m.level === '总行级' ? 'red' : 'blue'} style={{ fontSize: 10 }}>{m.level}</Tag><br /><span style={{ fontSize: 11, color: '#888' }}>{m.group} · {m.amount} · {m.field}</span><br /><Tag color={m.attention.includes('董事长') || m.attention.includes('行长') ? 'red' : 'default'} style={{ fontSize: 10 }}>{m.attention}</Tag></span>; },
                  },
                  { title: '主办', dataIndex: 'lead', width: 150 },
                  { title: '协同部门', dataIndex: 'coop', render: (v: string[]) => <span style={{ fontSize: 12 }}>{v.slice(0, 2).join(' · ')}{v.length > 2 ? ` 等${v.length}方` : ''}</span> },
                  { title: '进度', dataIndex: 'progress', width: 130, render: (v: number, r) => <span><Progress percent={v} size="small" /><br /><span style={{ fontSize: 11, color: '#888' }}>{(r as { ddl: string }).ddl}到期 · 剩{(r as { daysLeft: number }).daysLeft}天</span></span> },
                  { title: '未决', width: 80, render: (_, r) => { const m = r as unknown as { pendings: Array<{ st: string }> }; const n = m.pendings.filter((x) => x.st !== '已办结').length; const ov = m.pendings.filter((x) => x.st === '逾期').length; return <Tag color={ov ? 'red' : n ? 'orange' : 'green'}>{ov ? `逾期${ov}` : n ? `${n}项待办` : '已清零'}</Tag>; } },
                  { title: '状态', dataIndex: 'state', width: 80, render: (v: string) => <Tag color={v === '执行中' ? 'green' : 'blue'}>{v}</Tag> },
                ]}
              />
            </Col>
            <Col span={9}>
              <Card size="small" type="inner" title={`未决事项督办（${pendingAll.length}）随清随结`} extra={<Button size="small" onClick={() => message.success('逾期事项已升级至分管行长')}>升级</Button>}>
                <Table
                  size="small" pagination={{ pageSize: 8 }} rowKey={(r) => `${(r as { proj: string }).proj}-${(r as { item: string }).item}`} dataSource={pendingAll}
                  columns={[
                    { title: '事项', dataIndex: 'item', render: (v: string, r) => <span>{v}<br /><span style={{ fontSize: 11, color: '#888' }}>{(r as { proj: string }).proj} · {(r as { attention: string }).attention}</span></span> },
                    { title: '责任/期限', width: 130, render: (_, r) => { const m = r as unknown as { owner: string; ddl: string }; return <span style={{ fontSize: 12 }}>{m.owner}<br />{m.ddl}</span>; } },
                    { title: '状态', dataIndex: 'st', width: 80, render: (v: string) => <Tag color={v === '逾期' ? 'red' : 'blue'}>{v}</Tag> },
                    { title: '操作', width: 110, render: (_, r) => <Space><Button size="small" onClick={() => message.success('已催办')}>催办</Button><Button size="small" onClick={() => { setOpenId((r as { groupId: string }).groupId); }}>穿透</Button></Space> },
                  ]}
                />
              </Card>
            </Col>
          </Row>
          <CustomerDrawer openId={openId} onClose={() => setOpenId(null)} />
        </div>
      )}
      {tab === 'coop' && (
        <div>
          <Row gutter={10}>
            <Col span={14}>
              <Card size="small" type="inner" title="协同地图 · 江苏省内全境 + 北京 / 上海 / 杭州">
                <CoopMapChart />
              </Card>
            </Col>
            <Col span={10}>
              <Card size="small" type="inner" title="协同态势">
                {[['在途协同项目', '5 个 · 3 个跨省'], ['本月跨区转介', '6 笔 · 落地 4 笔'], ['CoE 方案支撑', '投行/交易银行 4 单'], ['SDC 交付', '授信绿色通道 2 单']].map((r) => (
                  <div key={r[0]} style={{ padding: 9, border: '1px solid #eef1f6', borderRadius: 8, marginBottom: 8 }}>
                    <span style={{ color: '#888', fontSize: 12 }}>{r[0]}</span><b style={{ float: 'right' }}>{r[1]}</b>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 8 }}><Button size="small" type="primary" onClick={() => message.success('协同合约已发起（主办→属地 5:5）')}>发起协同</Button><Button size="small" onClick={() => message.success('分润仲裁已提交战投委')}>分润仲裁</Button></div>
              </Card>
            </Col>
          </Row>
          <Card size="small" type="inner" title="商机项目制协同台账" style={{ marginTop: 10 }}>
            <Table
              size="small" pagination={false} rowKey="proj" dataSource={COOP_PROJECTS}
              columns={[
                { title: '商机项目', dataIndex: 'proj', width: 190, render: (v: string, r) => <span><b>{v}</b><br /><span style={{ color: '#888', fontSize: 11 }}>{(r as { group: string }).group} · {(r as { state: string }).state}</span></span> },
                { title: '主办', dataIndex: 'lead', width: 180 },
                { title: '属地协同', dataIndex: 'coop', width: 190 },
                { title: '总行方案', dataIndex: 'coe', width: 200 },
                { title: '审批交付', dataIndex: 'sdc', width: 200 },
                { title: '进度', dataIndex: 'progress', width: 130, render: (v: number) => <Progress percent={v} size="small" /> },
              ]}
            />
          </Card>
        </div>
      )}
      {tab === 'perf' && (
        <div>
          <Row gutter={10}>
            <Col span={8}>
              <Card size="small" type="inner" title="六维达成率雷达"><DimRadar /></Card>
            </Col>
            <Col span={16}>
              <Card size="small" type="inner" title="六维达成率总览">
                <Table
                  size="small" pagination={false} rowKey="dim" dataSource={dimScores()}
                  columns={[
                    { title: '维度', dataIndex: 'dim' },
                    { title: '达成率', dataIndex: 'score', width: 200, render: (v: number, r) => <Progress percent={v} size="small" strokeColor={(r as { color: string }).color} /> },
                    { title: '短板指标', render: (_, r) => { const w = dimWeak((r as unknown as { dim: string }).dim); return <span style={{ fontSize: 12 }}>{w.name}（{w.pct}%）</span>; } },
                  ]}
                />
              </Card>
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
    </Card>
  );
}

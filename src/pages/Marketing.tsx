import { Button, Card, Col, Descriptions, Drawer, Input, Progress, Row, Select, Space, Steps, Table, Tag, Timeline, message } from 'antd';
import { useMemo, useState } from 'react';
import { GROUPS, OPPORTUNITIES } from '../data';
import type { Opportunity } from '../types';
import { useApp } from '../store';
import CustomerDrawer from '../components/CustomerDrawer';

/** Salesforce 式 Opportunity → Engagement：线索到赢单/丢单全链路 */
const STAGES = ['线索', '初筛', '需求确认', '方案制定', '审批定价', '签约落地', '已达成', '已失败'];
const STAGE_P: Record<string, number> = { '线索': 10, '初筛': 20, '需求确认': 40, '方案制定': 60, '审批定价': 80, '签约落地': 90, '已达成': 100, '已失败': 0 };
const STAGE_C: Record<string, string> = { '线索': 'default', '初筛': 'blue', '需求确认': 'cyan', '方案制定': 'geekblue', '审批定价': 'purple', '签约落地': 'green', '已达成': 'green', '已失败': 'red' };

/** 老口径 → 新赢单链路口径（兼容历史数据） */
function normStage(s: string): string {
  if (STAGES.includes(s)) return s;
  if (s === '待营销' || s === '待转介') return '线索';
  if (s === '已触达') return '初筛';
  if (s === '尽调中') return '需求确认';
  if (s === '陪标中' || s === '协同中') return '方案制定';
  if (s === '执行中') return '签约落地';
  if (s === '已落地') return '已达成';
  if (s === '已关闭') return '已失败';
  return s;
}
function stageOf(o: Opportunity): string { return normStage(o.stage); }
function probOf(o: Opportunity): number { return STAGE_P[stageOf(o)] ?? 20; }
function parseAmt(a: string): number {
  if (!a || a === '—') return 0;
  const m = a.match(/([\d.]+)/);
  return m ? parseFloat(m[1]) : 0;
}
function sourceOf(o: Opportunity): string {
  if (o.source) return o.source;
  if (o.category === '产业链') return 'N端转介';
  if (o.category === '公开市场') return '总行推送';
  if (o.category === '公私联动') return '对公转介私行';
  if (o.title.includes('到期') || o.title.includes('续作')) return '存量到期';
  return '拜访挖掘';
}
function contactOf(o: Opportunity): string {
  if (o.contact) return o.contact;
  if (o.title.includes('董秘') || o.update.includes('董秘')) return '董秘';
  if (o.title.includes('财务') || o.update.includes('财务')) return '财务总监';
  if (o.title.includes('代发') || o.title.includes('私行')) return '人力资源总监 / 私行客户';
  return '财务总监';
}
function nextOf(o: Opportunity): string {
  if (o.nextStep) return o.nextStep;
  const s = stageOf(o);
  if (s === '线索') return '上门拜访 · 确认决策链与需求真伪';
  if (s === '初筛') return '拜访关键人 · 锁定金额与窗口';
  if (s === '需求确认') return '尽调 + 方案初稿 · 发起跨部门预审';
  if (s === '方案制定') return '方案上会 · 确认定价与协同分工';
  if (s === '审批定价') return '授信/定价审批 · 落定放款条件';
  if (s === '签约落地') return '签约放款/资金归行 · 归行率跟踪';
  return '—';
}
function resultOf(o: Opportunity): string {
  const s = stageOf(o);
  if (s === '已达成') return o.winReason ?? '已放款/资金归行 · 计入实绩';
  if (s === '已失败') return o.lossReason ?? '客户选择他行 · 已复盘';
  return '—';
}
/** 跟进过程：拜访 → 方案 → 协同 → 审批 → 结果（关联事项可追溯） */
function actsOf(o: Opportunity): Array<{ t: string; type: string; title: string; detail: string }> {
  const c = contactOf(o);
  const acts = [
    { t: o.created ?? '—', type: '线索', title: `线索创建 · ${sourceOf(o)}`, detail: `来源：${sourceOf(o)} · 决策人：${c}` },
    { t: o.created ?? '—', type: '拜访', title: `拜访${c} · 需求确认`, detail: o.title.includes('N端') ? '属地陪访N端 · 确权资料回收' : '确认金额 / 窗口 / 决策链 · 纪要48h已上传' },
    { t: o.update?.slice(0, 5) ?? '—', type: '方案', title: stageOf(o) === '线索' || stageOf(o) === '初筛' ? '方案编制中' : `方案制定 · ${o.update}`, detail: o.owner.includes('/') ? `协同方：${o.owner} · 已分工` : `跟进人：${o.owner}` },
  ];
  if (['方案制定', '审批定价', '签约落地', '已达成'].includes(stageOf(o))) {
    acts.push({ t: o.update?.slice(0, 5) ?? '—', type: '协同', title: o.owner.includes('/') ? `跨部门协同 · ${o.owner}` : '部门协同 · 投行/审批联动', detail: o.category === '公私联动' ? '对公 + 私行双经理 · 进场宣讲/签约' : '授信审批绿色通道 · 定价已预审' });
  }
  if (stageOf(o) === '已达成' || stageOf(o) === '已失败') {
    acts.push({ t: o.due ?? '—', type: '结果', title: stageOf(o) === '已达成' ? `赢单 · ${o.amount}` : `丢单 · ${o.amount}`, detail: resultOf(o) });
  } else {
    acts.push({ t: o.update?.slice(0, 5) ?? '—', type: '跟进', title: o.update, detail: `下一步：${nextOf(o)}` });
  }
  return acts;
}
/** 关联协同事项：方案/拜访/审批拆出来的待办 */
function coopsOf(o: Opportunity): Array<{ item: string; owner: string; st: string; ddl: string }> {
  const s = stageOf(o);
  if (s === '已达成') return [{ item: '贷后归行回检 / 资金归行确认', owner: o.owner, st: '已办结', ddl: o.due ?? '—' }];
  if (s === '已失败') return [{ item: `复盘归档 · ${resultOf(o)}`, owner: o.owner, st: '已办结', ddl: o.due ?? '—' }];
  const rows = [
    { item: `拜访${contactOf(o)} · 确认窗口与决策链`, owner: o.owner, st: (o.progress ?? 0) >= 30 ? '已办结' : '办理中', ddl: o.created ?? '—' },
    { item: `方案制定 · ${o.title.slice(0, 12)}`, owner: o.owner.includes('/') ? o.owner : `${o.owner} · 投行/交易银行`, st: (o.progress ?? 0) >= 60 ? '已办结' : '办理中', ddl: o.due ?? '—' },
  ];
  if (o.owner.includes('/') || o.category === '公私联动') rows.push({ item: '协同合约 · 主办→属地/跨条线分工', owner: o.owner, st: (o.progress ?? 0) >= 50 ? '办理中' : '待启动', ddl: o.due ?? '—' });
  if ((o.daysLeft ?? 99) <= 20 && (o.progress ?? 0) < 60) rows.push({ item: '临期督办 · 升级至分管行长', owner: '分管行长督办', st: '逾期' , ddl: o.due ?? '—' });
  return rows;
}

export default function Marketing() {
  const { route, scopedGroups, nav } = useApp();
  const [q, setQ] = useState('');
  const [groupId, setGroupId] = useState<string>('all');
  const [stage, setStage] = useState<string>('all');
  const [cat, setCat] = useState<string>('all');
  const [onlyRisk, setOnlyRisk] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const allOpps = useMemo(() => OPPORTUNITIES.filter((o) => scopedGroups.some((g) => g.id === o.groupId)), [scopedGroups]);
  const cats = useMemo(() => Array.from(new Set(allOpps.map((o) => o.category))), [allOpps]);

  const rows = useMemo(() => allOpps.filter((o) => {
    if (groupId !== 'all' && o.groupId !== groupId) return false;
    if (stage !== 'all' && stageOf(o) !== stage) return false;
    if (cat !== 'all' && o.category !== cat) return false;
    if (onlyRisk && !((o.daysLeft ?? 99) <= 20 && (o.progress ?? 0) < 90 && !['已达成', '已失败'].includes(stageOf(o)))) return false;
    if (q && !(o.title.includes(q) || o.group.includes(q) || o.owner.includes(q))) return false;
    return true;
  }), [allOpps, groupId, stage, cat, onlyRisk, q]);

  const kpi = useMemo(() => {
    const open = allOpps.filter((o) => !['已达成', '已失败'].includes(stageOf(o)));
    const nw = allOpps.filter((o) => o.isNew).length;
    const weighted = open.reduce((s, o) => s + parseAmt(o.amount) * (probOf(o) / 100), 0);
    const won = allOpps.filter((o) => stageOf(o) === '已达成').length;
    const lost = allOpps.filter((o) => stageOf(o) === '已失败').length;
    const risk = allOpps.filter((o) => (o.daysLeft ?? 99) <= 20 && (o.progress ?? 0) < 60 && !['已达成', '已失败'].includes(stageOf(o))).length;
    return { open: open.length, nw, weighted: weighted.toFixed(1), won, lost, risk };
  }, [allOpps]);

  if (route === 'mkt-co') {
    return (
      <Card title="全行服务一家 · 协同合约">
        <Table size="small" pagination={false} dataSource={[
          { k: '南钢 N 端汽配 3 户转介开户', m: '南京分行 → 无锡分行', s: '5 : 5 · 2 年', t: '执行中' },
          { k: '途牛集团代发 3000 人', m: '苏州分行 ↔ 总行协同', s: '按投产份额', t: '待属地确认' },
        ]} columns={[{ title: '合约', dataIndex: 'k' }, { title: '主办 → 属地', dataIndex: 'm' }, { title: '分成', dataIndex: 's' }, { title: '状态', dataIndex: 't', render: (v: string) => <Tag color="blue">{v}</Tag> }, { title: '操作', render: () => <Button size="small" onClick={() => message.success('跟进记录已更新')}>跟进</Button> }]} />
      </Card>
    );
  }
  if (route === 'mkt-visit') {
    const visitRows = allOpps.flatMap((o) => actsOf(o).filter((a) => a.type === '拜访' || a.type === '线索').map((a, i) => ({ key: `${o.id}-${i}`, g: o.group, gid: o.groupId, ...a, owner: o.owner, stage: stageOf(o) })));
    return (
      <Card title={`访客管理 · 由商机驱动（${visitRows.length}）`} extra={<Button size="small" type="primary" onClick={() => nav('mkt-opp')}>回商机列表 →</Button>}>
        <Table size="small" pagination={{ pageSize: 10 }} dataSource={visitRows}
          columns={[
            { title: '客户', dataIndex: 'g', width: 150, render: (v: string, r) => <a onClick={() => setOpenId((r as { gid: string }).gid)}>{v}</a> },
            { title: '拜访事项', dataIndex: 'title', render: (v: string, r) => <span><b>{v}</b><br /><span style={{ fontSize: 11, color: '#888' }}>{(r as { detail: string }).detail}</span></span> },
            { title: '时间', dataIndex: 't', width: 80 },
            { title: '跟进人', dataIndex: 'owner', width: 150 },
            { title: '商机阶段', dataIndex: 'stage', width: 100, render: (v: string) => <Tag color={STAGE_C[v]}>{v}</Tag> },
            { title: '操作', width: 180, render: (_, r) => <Space><Button size="small" onClick={() => message.success('访前材料包已推送')}>访前包</Button><Button size="small" onClick={() => setDetailId((r as { key: string }).key.split('-')[0])}>商机</Button></Space> },
          ]} />
        <OpportunityDetail id={detailId} onClose={() => setDetailId(null)} onOpenGroup={(gid) => setOpenId(gid)} />
        <CustomerDrawer openId={openId} onClose={() => setOpenId(null)} />
      </Card>
    );
  }

  return (
    <div>
      {/* 漏斗总览 */}
      <Row gutter={10} style={{ marginBottom: 10 }}>
        {[
          ['在管商机', `${kpi.open} 个`, `加权 ${kpi.weighted} 亿`],
          ['本月新增', `${kpi.nw} 个`, '线索 → 初筛'],
          ['已达成', `${kpi.won} 个`, '赢单计入实绩'],
          ['已失败', `${kpi.lost} 个`, '复盘归档'],
          ['临期风险', `${kpi.risk} 个`, '剩≤20天且进度<60%'],
        ].map((k) => (
          <Col span={5} key={k[0]} style={{ flex: 1 }}>
            <Card size="small" type="inner" style={{ textAlign: 'center', borderTop: `3px solid ${k[0] === '临期风险' ? '#cf1322' : k[0] === '已达成' ? '#389e0d' : '#2456a6'}` }}>
              <div style={{ fontSize: 11, color: '#888' }}>{k[0]}</div>
              <b style={{ fontSize: 20 }}>{k[1]}</b>
              <div style={{ fontSize: 11, color: '#888' }}>{k[2]}</div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card
        size="small" title={`商机管理 · Opportunity → Engagement（${rows.length} / ${allOpps.length}）`}
        extra={<Space><Button size="small" onClick={() => message.success('商机清单已导出（含跟进过程）')}>导出</Button><Button size="small" type="primary" onClick={() => message.success('已新建商机线索，进入线索阶段')}>+ 新建商机</Button></Space>}
      >
        {/* 阶段漏斗 */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          {['all', ...STAGES].map((s) => {
            const n = s === 'all' ? allOpps.length : allOpps.filter((o) => stageOf(o) === s).length;
            return <Button key={s} size="small" type={stage === s ? 'primary' : 'default'} danger={s === '已失败'} onClick={() => setStage(s)}>{s === 'all' ? `全部 ${n}` : `${s} ${n}`}</Button>;
          })}
        </div>
        <Space wrap style={{ marginBottom: 10 }}>
          <Input placeholder="商机 / 客户 / 跟进人" value={q} onChange={(e) => setQ(e.target.value)} style={{ width: 220 }} />
          <Select value={groupId} onChange={setGroupId} style={{ width: 200 }} options={[{ value: 'all', label: '全部战略客户' }, ...scopedGroups.map((g) => ({ value: g.id, label: `${g.name}（${allOpps.filter((o) => o.groupId === g.id).length}）` }))]} />
          <Select value={cat} onChange={setCat} style={{ width: 140 }} options={[{ value: 'all', label: '全部分类' }, ...cats.map((c) => ({ value: c, label: c }))]} />
          <Button size="small" type={onlyRisk ? 'primary' : 'default'} danger={onlyRisk} onClick={() => setOnlyRisk(!onlyRisk)}>临期预警</Button>
          <Button size="small" onClick={() => { setQ(''); setGroupId('all'); setStage('all'); setCat('all'); setOnlyRisk(false); }}>重置</Button>
          <span style={{ fontSize: 11, color: '#888' }}>阶段口径：线索10% → 初筛20% → 需求确认40% → 方案制定60% → 审批定价80% → 签约落地90% → 赢单100% / 丢单归档</span>
        </Space>
        <Table
          size="small" rowKey="id" pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条商机` }} dataSource={rows}
          expandable={{
            expandedRowRender: (r) => {
              const o = r as Opportunity;
              const acts = actsOf(o);
              const coops = coopsOf(o);
              return (
                <Row gutter={10}>
                  <Col span={13}>
                    <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 6 }}>跟进过程 · Engagement（拜访 → 方案 → 协同 → 结果）</div>
                    <Timeline items={acts.map((a) => ({ children: <span><Tag color={a.type === '结果' ? (stageOf(o) === '已达成' ? 'green' : 'red') : a.type === '拜访' ? 'blue' : a.type === '方案' ? 'purple' : a.type === '协同' ? 'cyan' : 'default'}>{a.type} · {a.t}</Tag> <b>{a.title}</b><br /><span style={{ fontSize: 11, color: '#555' }}>{a.detail}</span></span> }))} />
                  </Col>
                  <Col span={11}>
                    <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 6 }}>关联协同事项（{coops.length}）</div>
                    <Table size="small" pagination={false} dataSource={coops} rowKey="item"
                      columns={[
                        { title: '事项', dataIndex: 'item' },
                        { title: '责任', dataIndex: 'owner', width: 130 },
                        { title: '状态', dataIndex: 'st', width: 80, render: (v: string) => <Tag color={v === '已办结' ? 'green' : v === '逾期' ? 'red' : v === '待启动' ? 'default' : 'blue'}>{v}</Tag> },
                      ]} />
                    <div style={{ fontSize: 12, marginTop: 8, background: stageOf(o) === '已失败' ? '#fff1f0' : stageOf(o) === '已达成' ? '#f6ffed' : '#f5f7fb', padding: 8, borderRadius: 6 }}>
                      <b>{stageOf(o) === '已达成' ? '赢单原因：' : stageOf(o) === '已失败' ? '丢单原因：' : '下一步：'}</b>{stageOf(o) === '已达成' || stageOf(o) === '已失败' ? resultOf(o) : nextOf(o)}
                    </div>
                  </Col>
                </Row>
              );
            },
          }}
          columns={[
            {
              title: '商机', width: 250,
              render: (_, r) => {
                const o = r as Opportunity; const s = stageOf(o);
                const risk = (o.daysLeft ?? 99) <= 20 && (o.progress ?? 0) < 60 && !['已达成', '已失败'].includes(s);
                return <span><a onClick={() => setDetailId(o.id)}><b>{o.title}</b></a> {o.isNew && <Tag color="red">新增</Tag>} {risk && <Tag color="red">临期</Tag>}<br /><span style={{ fontSize: 11, color: '#888' }}>{o.group} · {o.update} · 创建 {o.created}</span></span>;
              },
            },
            { title: '类别/来源', width: 120, render: (_, r) => { const o = r as Opportunity; return <span><Tag color={o.category === '公私联动' ? 'purple' : 'blue'}>{o.category}</Tag><br /><span style={{ fontSize: 11, color: '#888' }}>{sourceOf(o)}</span></span>; } },
            { title: '金额/加权', width: 110, render: (_, r) => { const o = r as Opportunity; return <span><b>{o.amount}</b><br /><span style={{ fontSize: 11, color: '#888' }}>加权 {(parseAmt(o.amount) * probOf(o) / 100).toFixed(1)} 亿 · {probOf(o)}%</span></span>; } },
            {
              title: '阶段', width: 170,
              render: (_, r) => {
                const o = r as Opportunity; const s = stageOf(o);
                return <span><Tag color={STAGE_C[s]}>{s}</Tag><Progress percent={o.progress ?? probOf(o)} size="small" /><span style={{ fontSize: 11, color: '#888' }}>预计 {o.due} · 剩 {o.daysLeft} 天</span></span>;
              },
            },
            { title: '关键人/跟进', width: 150, render: (_, r) => { const o = r as Opportunity; return <span style={{ fontSize: 12 }}>{contactOf(o)}<br /><span style={{ color: '#888' }}>{o.owner}</span></span>; } },
            { title: '优先级', dataIndex: 'priority', width: 70, render: (v: string) => <Tag color={v === '高' ? 'red' : 'default'}>{v}</Tag> },
            {
              title: '操作', width: 170, fixed: 'right' as const,
              render: (_, r) => {
                const o = r as Opportunity; const s = stageOf(o);
                return <span><Button size="small" type="primary" onClick={() => setDetailId(o.id)}>跟进</Button><Button size="small" style={{ marginLeft: 6 }} onClick={() => message.success('已推进到下一阶段，概率上调')}>推进</Button>{!['已达成', '已失败'].includes(s) && <Button size="small" style={{ marginLeft: 6 }} onClick={() => message.success('协同事项已发起（主办→协同方）')}>协同</Button>}</span>;
              },
            },
          ]}
          scroll={{ x: 1200 }}
        />
      </Card>
      <OpportunityDetail id={detailId} onClose={() => setDetailId(null)} onOpenGroup={(gid) => setOpenId(gid)} />
      <CustomerDrawer openId={openId} onClose={() => setOpenId(null)} />
    </div>
  );
}

function OpportunityDetail({ id, onClose, onOpenGroup }: { id: string | null; onClose: () => void; onOpenGroup: (gid: string) => void }) {
  const opp = OPPORTUNITIES.find((o) => o.id === id) ?? null;
  const g = opp ? GROUPS.find((x) => x.id === opp.groupId) : null;
  if (!opp) return <Drawer title="商机详情" width={860} open={!!id} onClose={onClose} />;
  const s = normStage(opp.stage);
  const idx = Math.max(0, STAGES.indexOf(s) > 5 ? 5 : STAGES.indexOf(s));
  const acts = actsOf(opp);
  const coops = coopsOf(opp);
  return (
    <Drawer title={`${opp.title} · 商机详情`} width={900} open={!!id} onClose={onClose}
      extra={<Space><Button size="small" onClick={() => message.success('拜访纪要已关联本商机')}>记录拜访</Button><Button size="small" onClick={() => message.success('方案协同已发起')}>发起协同</Button><Button size="small" type="primary" onClick={() => message.success('阶段已推进，概率/加权已更新')}>推进阶段</Button></Space>}>
      <Card size="small" type="inner" style={{ marginBottom: 10 }}>
        <Space wrap>
          <Tag color={STAGE_C[s]}>{s} · {STAGE_P[s]}%</Tag>
          <Tag color={opp.priority === '高' ? 'red' : 'default'}>{opp.priority}优先级</Tag>
          <Tag color="blue">{opp.category}</Tag>
          {opp.isNew && <Tag color="red">新增</Tag>}
          <span style={{ fontSize: 12, color: '#555' }}>{opp.group} · 主办 {g?.branch} · 管户 {g?.managers}</span>
        </Space>
        <Steps size="small" current={idx} style={{ marginTop: 10 }} items={STAGES.slice(0, 6).map((x) => ({ title: x, description: `${STAGE_P[x]}%` }))} />
      </Card>
      <Row gutter={10}>
        <Col span={12}>
          <Card size="small" type="inner" title="商机信息">
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="金额 / 加权">{opp.amount} · 加权 {(parseAmt(opp.amount) * (STAGE_P[s] / 100)).toFixed(1)} 亿</Descriptions.Item>
              <Descriptions.Item label="来源 / 决策人">{sourceOf(opp)} / {contactOf(opp)}</Descriptions.Item>
              <Descriptions.Item label="跟进人">{opp.owner}</Descriptions.Item>
              <Descriptions.Item label="创建 / 预计关闭">{opp.created} / {opp.due}（剩 {opp.daysLeft} 天）</Descriptions.Item>
              <Descriptions.Item label="下一步">{nextOf(opp)}</Descriptions.Item>
              <Descriptions.Item label={s === '已失败' ? '丢单原因' : '赢单/预期结果'}>{resultOf(opp)}</Descriptions.Item>
            </Descriptions>
            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
              <Button size="small" onClick={() => onOpenGroup(opp.groupId)}>穿透客户360 →</Button>
              <Button size="small" danger onClick={() => message.success('丢单已登记并复盘归档')}>丢单登记</Button>
              <Button size="small" type="primary" onClick={() => message.success('赢单已登记并计入实绩')}>赢单登记</Button>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card size="small" type="inner" title={`跟进过程 · ${acts.length} 环`} extra={<span style={{ fontSize: 11, color: '#888' }}>拜访/方案/协同自动关联</span>}>
            <Timeline items={acts.map((a) => ({ children: <span><Tag color="default">{a.type} · {a.t}</Tag> <b>{a.title}</b><br /><span style={{ fontSize: 11, color: '#555' }}>{a.detail}</span></span> }))} />
          </Card>
        </Col>
      </Row>
      <Card size="small" type="inner" title={`关联协同事项（${coops.length}）`} style={{ marginTop: 10 }}
        extra={<Button size="small" onClick={() => message.success('协同事项已发起（方案/拜访联动）')}>+ 发起协同</Button>}>
        <Table size="small" pagination={false} rowKey="item" dataSource={coops}
          columns={[
            { title: '事项', dataIndex: 'item' },
            { title: '责任方', dataIndex: 'owner', width: 180 },
            { title: '期限', dataIndex: 'ddl', width: 90 },
            { title: '状态', dataIndex: 'st', width: 90, render: (v: string) => <Tag color={v === '已办结' ? 'green' : v === '逾期' ? 'red' : 'blue'}>{v}</Tag> },
            { title: '操作', width: 150, render: () => <Space><Button size="small" onClick={() => message.success('已催办责任方')}>催办</Button><Button size="small" onClick={() => message.success('事项已办结归档')}>办结</Button></Space> },
          ]} />
      </Card>
    </Drawer>
  );
}

import { Button, Card, Checkbox, Col, Descriptions, Drawer, Input, Progress, Row, Select, Space, Steps, Table, Tabs, Tag, Timeline, message } from 'antd';
import { useMemo, useState } from 'react';
import { ESCALATION_RULES, GROUPS, LEAD_POOL, MAJOR_PROJECTS, OPPORTUNITIES, PIPELINE_STAGES, RECOGNITION_RULES } from '../data';
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
  if ((o.daysLeft ?? 99) <= 20 && (o.progress ?? 0) < 60) rows.push({ item: '临期督办 · 升级至分管行长', owner: '分管行长督办', st: '逾期', ddl: o.due ?? '—' });
  return rows;
}

/** 可选产品与服务组合（跨部门） */
const PRODUCTS = ['流贷/固贷', '银团贷款', '中票/ABS承销', 'REITs/托管', 'CBS/司库', '跨境资金池', '供应链确权链', '大额存单', '代发/团金B端', '私行/家族信托', '保函/信用证', '撮合/财务顾问'];
function deptOf(p: string): string {
  if (p.includes('承销') || p.includes('REITs') || p.includes('撮合')) return '投资银行部';
  if (p.includes('司库') || p.includes('确权')) return '交易银行部';
  if (p.includes('跨境')) return '国际业务部';
  if (p.includes('代发') || p.includes('团金')) return '零售部 · 团金处';
  if (p.includes('私行') || p.includes('信托')) return '私行中心';
  if (p.includes('存单') || p.includes('流贷') || p.includes('银团')) return '授信审批部 · 资金营运中心';
  return '运营管理部';
}

type Recog = '未认定' | '已认定' | '已退回';

export default function Marketing() {
  const { route, scopedGroups, nav } = useApp();
  const hostNav = nav;
  const [q, setQ] = useState('');
  const [groupId, setGroupId] = useState<string>('all');
  const [stage, setStage] = useState<string>('all');
  const [cat, setCat] = useState<string>('all');
  const [onlyRisk, setOnlyRisk] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  // —— 全流程状态（演示内存态：线索验证→认定→分派→拜访→组合→项目→提级） ——
  const [flow, setFlow] = useState('lead');
  const [leads, setLeads] = useState(LEAD_POOL);
  const [localOpps, setLocalOpps] = useState<Opportunity[]>(OPPORTUNITIES);
  const [recog, setRecog] = useState<Record<string, Recog>>(() => Object.fromEntries(OPPORTUNITIES.map((o) => [o.id, ((o.progress ?? 20) >= 40 || !['线索', '待营销', '待转介', '已触达'].includes(o.stage)) ? '已认定' as Recog : '未认定' as Recog])));
  const [assign, setAssign] = useState<Record<string, string>>(() => Object.fromEntries(OPPORTUNITIES.map((o) => [o.id, o.owner])));
  const [visitLog, setVisitLog] = useState<Record<string, Array<{ t: string; what: string }>>>({});
  const [combos, setCombos] = useState<Record<string, string[]>>({ o1b: ['银团贷款', '流贷/固贷'], o3: ['中票/ABS承销'], o2b: ['CBS/司库', '大额存单'], o12b: ['代发/团金B端', '私行/家族信托'] });
  const [formed, setFormed] = useState<string[]>(['o1b', 'o3', 'o2b', 'o12b', 'o9']);
  const [escalated, setEscalated] = useState<string[]>(['o1b', 'o3']);
  const [leadDrawer, setLeadDrawer] = useState(false);
  const [nlTitle, setNlTitle] = useState('');
  const [nlChannel, setNlChannel] = useState('客户拜访');
  const [nlGroup, setNlGroup] = useState('g1');
  const [nlContent, setNlContent] = useState('');

  const allOpps = useMemo(() => localOpps.filter((o) => scopedGroups.some((g) => g.id === o.groupId)), [localOpps, scopedGroups]);
  const cats = useMemo(() => Array.from(new Set(allOpps.map((o) => o.category))), [allOpps]);

  const funnel = useMemo(() => {
    const leadN = leads.length;
    const unRecog = allOpps.filter((o) => (recog[o.id] ?? '未认定') === '未认定').length;
    const recoged = allOpps.filter((o) => (recog[o.id] ?? '未认定') === '已认定').length;
    const visiting = allOpps.filter((o) => Object.keys(visitLog).includes(o.id) || (o.progress ?? 0) >= 30).length;
    const projN = formed.length;
    const escN = escalated.length + MAJOR_PROJECTS.length;
    return { leadN, unRecog, recoged, visiting, projN, escN };
  }, [leads, allOpps, recog, visitLog, formed, escalated]);

  const verifyLead = (id: string, v: string) => {
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, verify: v } : l)));
    message.success(`线索 ${id} 已标记为${v}`);
  };
  const convertLead = (lid: string) => {
    const l = leads.find((x) => x.id === lid);
    if (!l) return;
    if (l.verify !== '已验证') { message.warning('请先完成验证再转商机'); return; }
    if (l.oppId && localOpps.some((o) => o.id === l.oppId)) { message.info('该线索已关联商机，可直接进入认定'); setFlow('recog'); return; }
    const nid = `o-${Date.now()}`;
    const g = GROUPS.find((x) => x.id === l.groupId);
    const opp: Opportunity = { id: nid, title: l.title, group: l.group, groupId: l.groupId, category: '资产业务', stage: '线索', priority: '中', amount: '待定', owner: l.finder, update: `${l.time} 已验证转入`, created: l.time.slice(0, 5), due: '12-31', daysLeft: 61, progress: 10, isNew: true, source: l.channel, contact: '财务总监', nextStep: '上门拜访 · 确认决策链与需求真伪' };
    setLocalOpps((os) => [opp, ...os]);
    setRecog((m) => ({ ...m, [nid]: '未认定' }));
    setLeads((ls) => ls.map((x) => (x.id === lid ? { ...x, oppId: nid } : x)));
    message.success(`已生成商机：${g?.name ?? l.group} · 进入认定环节`);
    setFlow('recog');
  };
  const doRecognize = (o: Opportunity, pass: boolean) => {
    if (pass) {
      const fails = RECOGNITION_RULES.filter((r) => !r.check(o));
      if (fails.length) { message.warning(`不满足认定：${fails.map((f) => f.name).join('、')}，请补齐后再认定`); return; }
      setRecog((m) => ({ ...m, [o.id]: '已认定' }));
      setLocalOpps((os) => os.map((x) => (x.id === o.id ? { ...x, stage: x.stage === '线索' || x.stage === '待营销' || x.stage === '待转介' ? '初筛' : x.stage } : x)));
      message.success(`${o.title} 已通过认定，可分派`);
    } else {
      setRecog((m) => ({ ...m, [o.id]: '已退回' }));
      message.success('已退回补充材料');
    }
  };
  const addVisit = (o: Opportunity) => {
    const t = new Date().toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
    setVisitLog((m) => ({ ...m, [o.id]: [...(m[o.id] ?? []), { t, what: `拜访${contactOf(o)} · 需求深挖 + 纪要48h上传（${assign[o.id] ?? o.owner}）` }] }));
    setLocalOpps((os) => os.map((x) => (x.id === o.id ? { ...x, progress: Math.min(95, (x.progress ?? 20) + 10) } : x)));
    message.success('拜访记录已关联本商机，进度+10%');
  };
  const toggleCombo = (oid: string, p: string) => {
    setCombos((m) => {
      const cur = m[oid] ?? [];
      return { ...m, [oid]: cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p] };
    });
  };
  const formProject = (o: Opportunity) => {
    if (!(combos[o.id]?.length)) { message.warning('请先勾选至少 1 项产品服务组合再形成项目'); return; }
    if (!(visitLog[o.id]?.length) && (o.progress ?? 0) < 30) { message.warning('请先完成至少 1 次客户拜访再形成项目'); return; }
    setFormed((f) => (f.includes(o.id) ? f : [...f, o.id]));
    setLocalOpps((os) => os.map((x) => (x.id === o.id ? { ...x, stage: '方案制定', progress: Math.max(x.progress ?? 0, 60) } : x)));
    message.success('已形成项目，进入提级评估');
  };
  const escalate = (o: Opportunity) => {
    setEscalated((e) => (e.includes(o.id) ? e : [...e, o.id]));
    message.success('已申请提级为重大项目，同步至重大项目督办');
  };

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
      <Card title={`访客管理 · 由商机驱动（${visitRows.length}）`} extra={<Button size="small" type="primary" onClick={() => hostNav('mkt-opp')}>回商机列表 →</Button>}>
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
      {/* 全流程漏斗：线索 → 认定 → 分派 → 拜访 → 组合 → 项目 → 提级 */}
      <Card size="small" style={{ marginBottom: 10 }} title="商机全流程 · 线索 → 商机 → 项目 → 提级（重大项目）" extra={<Space><Button size="small" onClick={() => hostNav('sup-task')}>重大项目督办 →</Button><Button size="small" type="primary" onClick={() => setLeadDrawer(true)}>+ 录入线索</Button></Space>}>
        <Steps size="small" current={-1} items={PIPELINE_STAGES.map((s) => ({ title: s }))} style={{ marginBottom: 10 }} />
        <Row gutter={10}>
          {[
            ['线索池', `${funnel.leadN} 条`, '接触/邮件/电话/转介'],
            ['待认定', `${funnel.unRecog} 个`, '4项规则校验'],
            ['已认定', `${funnel.recoged} 个`, '可分派跟进'],
            ['拜访中', `${funnel.visiting} 个`, '纪要48h'],
            ['已形成项目', `${funnel.projN} 个`, '产品组合已定'],
            ['重大项目', `${funnel.escN} 个`, '含提级+在督办'],
          ].map((k) => (
            <Col span={4} key={k[0]}>
              <Card size="small" type="inner" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#888' }}>{k[0]}</div>
                <b style={{ fontSize: 17 }}>{k[1]}</b>
                <div style={{ fontSize: 11, color: '#888' }}>{k[2]}</div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      <Card size="small" title={`商机管理 · ${flow === 'lead' ? '线索池' : flow === 'recog' ? '商机认定' : flow === 'work' ? '分派 · 拜访 · 方案组合' : flow === 'proj' ? '项目形成与提级' : '全量台账'}`}>
        <Tabs
          activeKey={flow}
          onChange={setFlow}
          items={[
            { key: 'lead', label: `线索池（${leads.length}）` },
            { key: 'recog', label: `商机认定（${funnel.unRecog}待认定）` },
            { key: 'work', label: '分派 · 拜访 · 方案组合' },
            { key: 'proj', label: `项目与提级（${formed.length}/提级${escalated.length}）` },
            { key: 'all', label: `全量台账（${allOpps.length}）` },
          ]}
        />

        {flow === 'lead' && (
          <Table
            size="small" rowKey="id" pagination={{ pageSize: 8 }} dataSource={leads}
            columns={[
              { title: '线索', width: 260, render: (_, r) => { const l = r as (typeof leads)[number]; return <span><b>{l.title}</b><br /><span style={{ fontSize: 11, color: '#888' }}>{l.group} · {l.content}</span></span>; } },
              { title: '来源渠道', dataIndex: 'channel', width: 100, render: (v: string) => <Tag color={v === '电话' ? 'green' : v === '邮件' ? 'blue' : v === 'N端转介' ? 'purple' : 'default'}>{v}</Tag> },
              { title: '发现人/时间', width: 150, render: (_, r) => { const l = r as (typeof leads)[number]; return <span style={{ fontSize: 12 }}>{l.finder}<br /><span style={{ color: '#888' }}>{l.time}</span></span>; } },
              { title: '验证', dataIndex: 'verify', width: 90, render: (v: string) => <Tag color={v === '已验证' ? 'green' : v === '验证中' ? 'blue' : 'orange'}>{v}</Tag> },
              { title: '关联商机', width: 130, render: (_, r) => { const l = r as (typeof leads)[number]; const o = localOpps.find((x) => x.id === l.oppId); return o ? <a onClick={() => setDetailId(o.id)}>{o.title.slice(0, 12)}…</a> : <span style={{ color: '#888' }}>未关联</span>; } },
              {
                title: '操作', width: 220, render: (_, r) => {
                  const l = r as (typeof leads)[number];
                  return <Space wrap><Button size="small" onClick={() => verifyLead(l.id, '验证中')}>开始验证</Button><Button size="small" type={l.verify === '已验证' ? 'default' : 'primary'} onClick={() => verifyLead(l.id, '已验证')}>验证通过</Button><Button size="small" type="primary" onClick={() => convertLead(l.id)}>转商机 →</Button></Space>;
                },
              },
            ]}
          />
        )}

        {flow === 'recog' && (
          <div>
            <div style={{ background: '#f5f7fb', borderRadius: 8, padding: 8, marginBottom: 8, fontSize: 12 }}>
              <b>商机认定规则（4项硬门槛，全部通过才允许分派）：</b>
              {RECOGNITION_RULES.map((r) => <Tag key={r.id} color="blue" style={{ marginLeft: 6 }}>{r.name}：{r.desc}</Tag>)}
            </div>
            <Table
              size="small" rowKey="id" pagination={{ pageSize: 8 }} dataSource={allOpps}
              expandable={{
                expandedRowRender: (r) => {
                  const o = r as Opportunity;
                  return (
                    <Row gutter={10}>
                      {RECOGNITION_RULES.map((rule) => {
                        const ok = rule.check(o);
                        return (
                          <Col span={6} key={rule.id}>
                            <Card size="small" type="inner" title={<span><Tag color={ok ? 'green' : 'red'}>{ok ? '通过' : '不通过'}</Tag> {rule.name}</span>}>
                              <div style={{ fontSize: 12, color: '#555' }}>{rule.desc}</div>
                              <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>当前：金额{o.amount} · 决策人{contactOf(o)} · {o.due ?? '无窗口'} · {o.nextStep ? '有下一步' : '无下一步'}</div>
                            </Card>
                          </Col>
                        );
                      })}
                    </Row>
                  );
                },
              }}
              columns={[
                { title: '商机', width: 250, render: (_, r) => { const o = r as Opportunity; return <span><b>{o.title}</b><br /><span style={{ fontSize: 11, color: '#888' }}>{o.group} · {sourceOf(o)} · 金额{o.amount}</span></span>; } },
                { title: '规则', width: 110, render: (_, r) => { const o = r as Opportunity; const n = RECOGNITION_RULES.filter((x) => x.check(o)).length; return <span><Progress percent={Math.round((n / 4) * 100)} size="small" showInfo={false} /><span style={{ fontSize: 11 }}>{n}/4 通过</span></span>; } },
                { title: '认定', dataIndex: 'id', width: 90, render: (v: string) => { const s = recog[v] ?? '未认定'; return <Tag color={s === '已认定' ? 'green' : s === '已退回' ? 'red' : 'orange'}>{s}</Tag>; } },
                { title: '关键人/跟进', width: 150, render: (_, r) => { const o = r as Opportunity; return <span style={{ fontSize: 12 }}>{contactOf(o)}<br /><span style={{ color: '#888' }}>{o.owner}</span></span>; } },
                {
                  title: '操作', width: 220, render: (_, r) => {
                    const o = r as Opportunity;
                    return <Space><Button size="small" onClick={() => setDetailId(o.id)}>详情</Button><Button size="small" onClick={() => doRecognize(o, false)}>退回补件</Button><Button size="small" type="primary" onClick={() => doRecognize(o, true)}>认定通过 →</Button></Space>;
                  },
                },
              ]}
            />
          </div>
        )}

        {flow === 'work' && (
          <Table
            size="small" rowKey="id" pagination={{ pageSize: 6 }} dataSource={allOpps.filter((o) => (recog[o.id] ?? '未认定') === '已认定')}
            expandable={{
              expandedRowRender: (r) => {
                const o = r as Opportunity;
                const cur = combos[o.id] ?? [];
                const logs = visitLog[o.id] ?? [];
                return (
                  <Row gutter={10}>
                    <Col span={12}>
                      <Card size="small" type="inner" title={`客户拜访（${logs.length + 1}）· 纪要48h`} extra={<Button size="small" type="primary" onClick={() => addVisit(o)}>+ 记录拜访</Button>}>
                        <Timeline items={[
                          { children: <span><b>存量拜访</b><br /><span style={{ fontSize: 11, color: '#555' }}>拜访{contactOf(o)} · {nextOf(o)}</span></span> },
                          ...logs.map((l) => ({ children: <span><Tag color="blue">{l.t}</Tag> <b>{l.what}</b></span> })),
                        ]} />
                        <div style={{ fontSize: 11, color: '#888' }}>分派：<Select size="small" value={assign[o.id] ?? o.owner} onChange={(v) => { setAssign((m) => ({ ...m, [o.id]: v })); message.success(`已分派至 ${v}`); }} style={{ width: 220 }} options={[o.owner, ...GROUPS.filter((g) => g.id === o.groupId).flatMap((g) => g.managers.split('/').map((s) => s.trim())), '投行部 · 承销处', '交易银行部 · CBS组', '私行中心 · 沈经理', '北京分行 · 赵经理', '上海分行 · 钱经理'].filter(Boolean).map((x) => ({ value: x, label: x }))} /></div>
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card size="small" type="inner" title={`产品服务组合（${cur.length}）· 跨部门`} extra={<Button size="small" type="primary" onClick={() => formProject(o)}>形成项目 →</Button>}>
                        <Checkbox.Group value={cur} onChange={(v) => setCombos((m) => ({ ...m, [o.id]: v as string[] }))}>
                          <Row gutter={[6, 6]}>
                            {PRODUCTS.map((p) => (
                              <Col span={12} key={p}><Checkbox value={p}>{p} <span style={{ color: '#888', fontSize: 11 }}>· {deptOf(p)}</span></Checkbox></Col>
                            ))}
                          </Row>
                        </Checkbox.Group>
                        <div style={{ fontSize: 11, color: '#888', marginTop: 6 }}>已选组合将自动生成协同分工（CoE方案 + SDC交付），进入项目环节。</div>
                      </Card>
                    </Col>
                  </Row>
                );
              },
            }}
            columns={[
              { title: '已认定商机', width: 260, render: (_, r) => { const o = r as Opportunity; return <span><b>{o.title}</b><br /><span style={{ fontSize: 11, color: '#888' }}>{o.group} · 金额{o.amount} · {contactOf(o)}</span></span>; } },
              { title: '分派', width: 170, render: (_, r) => { const o = r as Opportunity; return <span style={{ fontSize: 12 }}>{assign[o.id] ?? o.owner}<br /><span style={{ color: '#888' }}>拜访{(visitLog[o.id] ?? []).length + 1}次</span></span>; } },
              { title: '组合', width: 200, render: (_, r) => { const o = r as Opportunity; const cur = combos[o.id] ?? []; return cur.length ? cur.map((c) => <Tag key={c} color="purple" style={{ marginBottom: 4 }}>{c}</Tag>) : <span style={{ color: '#888', fontSize: 12 }}>未组合，点击展开勾选</span>; } },
              { title: '操作', width: 200, render: (_, r) => { const o = r as Opportunity; return <Space><Button size="small" onClick={() => addVisit(o)}>记录拜访</Button><Button size="small" type="primary" onClick={() => formProject(o)}>形成项目</Button></Space>; } },
            ]}
          />
        )}

        {flow === 'proj' && (
          <div>
            <div style={{ background: '#f5f7fb', borderRadius: 8, padding: 8, marginBottom: 8, fontSize: 12 }}>
              <b>提级标准（满足任一条即建议提级为重大项目）：</b>
              {ESCALATION_RULES.map((s, i) => <Tag key={s} color={i === 0 ? 'red' : 'blue'} style={{ marginLeft: 6 }}>{s}</Tag>)}
            </div>
            <Table
              size="small" rowKey="id" pagination={{ pageSize: 8 }} dataSource={allOpps.filter((o) => formed.includes(o.id))}
              columns={[
                { title: '项目（由商机形成）', width: 260, render: (_, r) => { const o = r as Opportunity; return <span><b>{o.title}</b><br /><span style={{ fontSize: 11, color: '#888' }}>{o.group} · 组合：{(combos[o.id] ?? []).join(' + ') || '—'}</span></span>; } },
                {
                  title: '提级评估', width: 220, render: (_, r) => {
                    const o = r as Opportunity;
                    const big = parseAmt(o.amount) >= 5 || o.amount.includes('3000') || o.amount.includes('1.1万');
                    const cross = (assign[o.id] ?? o.owner).includes('/') || (combos[o.id] ?? []).length >= 2;
                    const urgent = (o.daysLeft ?? 99) <= 30;
                    return <span><Tag color={big ? 'red' : 'default'}>规模{big ? '达标' : '未达'}</Tag> <Tag color={cross ? 'red' : 'default'}>协同{cross ? '跨条线' : '单一'}</Tag> <Tag color={urgent ? 'red' : 'default'}>窗口{urgent ? '紧急' : '充裕'}</Tag><br /><span style={{ fontSize: 11, color: '#888' }}>{big || cross || urgent ? '建议提级' : '暂留项目层跟进'}</span></span>;
                  },
                },
                { title: '状态', width: 120, render: (_, r) => { const o = r as Opportunity; const esc = escalated.includes(o.id); return esc ? <Tag color="red">已提级·重大项目</Tag> : <Tag color="green">项目跟进中</Tag>; } },
                {
                  title: '操作', width: 260, render: (_, r) => {
                    const o = r as Opportunity; const esc = escalated.includes(o.id);
                    return <Space><Button size="small" onClick={() => setDetailId(o.id)}>项目详情</Button>{!esc && <Button size="small" type="primary" onClick={() => escalate(o)}>申请提级 ↑</Button>}{esc && <Button size="small" onClick={() => hostNav('sup-task')}>进督办 →</Button>}<Button size="small" onClick={() => setOpenId(o.groupId)}>客户360</Button></Space>;
                  },
                },
              ]}
            />
            <Card size="small" type="inner" title={`重大项目衔接（演示 ${MAJOR_PROJECTS.length} 个在督办 + 本页提级 ${escalated.length} 个）`} style={{ marginTop: 8 }}>
              <div style={{ fontSize: 12, color: '#555' }}>提级后自动进入「重大项目督办」：行长关注 + 部门协同 + 未决事项随清随结。本页提级：{escalated.map((id) => localOpps.find((o) => o.id === id)?.title).filter(Boolean).join('；') || '—'}</div>
              <div style={{ marginTop: 6 }}><Button size="small" type="primary" onClick={() => hostNav('sup-task')}>打开重大项目督办 →</Button></div>
            </Card>
          </div>
        )}

        {flow === 'all' && (
          <div>
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
              size="small" rowKey="id" pagination={{ pageSize: 8, showTotal: (t) => `共 ${t} 条商机` }} dataSource={rows}
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
          </div>
        )}
      </Card>

      <Drawer title="录入线索 · 接触/邮件/电话随手记" width={520} open={leadDrawer} onClose={() => setLeadDrawer(false)}
        extra={<Button size="small" type="primary" onClick={() => {
          if (!nlTitle) { message.warning('请填写线索标题'); return; }
          const g = GROUPS.find((x) => x.id === nlGroup);
          setLeads((ls) => [{ id: `l-${Date.now()}`, title: nlTitle, group: g?.name ?? '', groupId: nlGroup, channel: nlChannel, finder: '张经理', time: '10-30 10:00', content: nlContent || '待补充', verify: '待验证', oppId: '' }, ...ls]);
          setNlTitle(''); setNlContent(''); setLeadDrawer(false);
          message.success('线索已进入线索池，待验证');
        }}>保存进线索池</Button>}>
        <Space direction="vertical" style={{ width: '100' + '%' }}>
          <span style={{ fontSize: 12 }}>线索标题<Input value={nlTitle} onChange={(e) => setNlTitle(e.target.value)} placeholder="如：电话：客户问…" /></span>
          <span style={{ fontSize: 12 }}>来源渠道<Select value={nlChannel} onChange={setNlChannel} style={{ width: '100%' }} options={['客户拜访', '电话', '邮件', '现场接触', 'N端转介', '总行推送', '存量到期'].map((x) => ({ value: x, label: x }))} /></span>
          <span style={{ fontSize: 12 }}>归属客户<Select value={nlGroup} onChange={setNlGroup} style={{ width: '100%' }} options={GROUPS.map((g) => ({ value: g.id, label: g.name }))} /></span>
          <span style={{ fontSize: 12 }}>内容<Input.TextArea value={nlContent} onChange={(e) => setNlContent(e.target.value)} rows={4} placeholder="记录接触要点：需求/金额/窗口/决策人" /></span>
          <span style={{ fontSize: 11, color: '#888' }}>保存后进入「线索池 → 验证 → 转商机」，再走认定/分派/拜访/组合/提级。</span>
        </Space>
      </Drawer>

      <OpportunityDetail id={detailId} onClose={() => setDetailId(null)} onOpenGroup={(gid) => setOpenId(gid)} />
      <CustomerDrawer openId={openId} onClose={() => setOpenId(null)} />
    </div>
  );
}

function OpportunityDetail({ id, onClose, onOpenGroup }: { id: string | null; onClose: () => void; onOpenGroup: (gid: string) => void }) {
  const { nav } = useApp();
  const opp = OPPORTUNITIES.find((o) => o.id === id) ?? null;
  const g = opp ? GROUPS.find((x) => x.id === opp.groupId) : null;
  if (!opp) return <Drawer title="商机详情" width={860} open={!!id} onClose={onClose} />;
  const s = normStage(opp.stage);
  const idx = Math.max(0, STAGES.indexOf(s) > 5 ? 5 : STAGES.indexOf(s));
  const acts = actsOf(opp);
  const coops = coopsOf(opp);
  const recogN = RECOGNITION_RULES.filter((r) => r.check(opp)).length;
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
            <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Button size="small" onClick={() => onOpenGroup(opp.groupId)}>穿透客户360 →</Button>
              <Button size="small" danger onClick={() => message.success('丢单已登记并复盘归档')}>丢单登记</Button>
              <Button size="small" type="primary" onClick={() => message.success('赢单已登记并计入实绩')}>赢单登记</Button>
            </div>
          </Card>
          <Card size="small" type="inner" title={`认定校验（${recogN}/4）`} style={{ marginTop: 10 }}>
            {RECOGNITION_RULES.map((r) => <div key={r.id} style={{ fontSize: 12, marginBottom: 4 }}><Tag color={r.check(opp) ? 'green' : 'red'}>{r.check(opp) ? '通过' : '不通过'}</Tag> {r.name}：{r.desc}</div>)}
            <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>提级参考：{ESCALATION_RULES.join('；')}</div>
            <Button size="small" type="primary" style={{ marginTop: 6 }} onClick={() => { message.success('已申请提级，同步至重大项目督办'); nav('sup-task'); }}>申请提级 ↑</Button>
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

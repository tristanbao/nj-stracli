import { Button, Card, Input, Progress, Segmented, Select, Space, Table, Tag } from 'antd';
import { useMemo, useState } from 'react';
import { GROUPS } from '../data';
import type { Group } from '../types';

export type DriverKey = '负债组织' | '资产投放' | '投行综合化' | '生态渗透';

export const DRIVER_KEYS: DriverKey[] = ['负债组织', '资产投放', '投行综合化', '生态渗透'];

/** 每个驱动在单户上的核心量 + 辅助指标（决策用：看量、看份额、看到户偏离） */
function driverVal(g: Group, d: DriverKey): number {
  if (d === '负债组织') return g.deposit;
  if (d === '资产投放') return g.loan;
  if (d === '投行综合化') return Math.round(((g.revenue * g.nonRate) / 100 / 100) * 10) / 10; // 非息收入 proxy（亿）
  return g.nEnd;
}
function driverSub(g: Group, d: DriverKey): string {
  if (d === '负债组织') return `口袋${g.pocketL}%`;
  if (d === '资产投放') return `口袋${g.pocketA}% · FPA${g.fpa}亿`;
  if (d === '投行综合化') return `非息${g.nonRate}% · 营收${Math.round(g.revenue / 100) / 100}亿`;
  return g.bEnd;
}
function driverUnit(d: DriverKey): string {
  if (d === '负债组织') return '亿（日均存款）';
  if (d === '资产投放') return '亿（一般性贷款）';
  if (d === '投行综合化') return '亿（非息收入proxy=营收×非息占比）';
  return '户（N端）';
}

interface RowAgg {
  key: string;
  count: number;
  headCount: number; // 总行级户数（分行视图用）
  val: number;
  share: number;
  avgPocket: number;
  avgNon: number;
  avgScore: number;
  groups: Group[];
}

export default function DriverBreakdown({ driver, onDriver, onOpen }: { driver: DriverKey; onDriver: (d: DriverKey) => void; onOpen: (id: string) => void }) {
  const [view, setView] = useState<'level' | 'branch' | 'customer'>('level');
  const [lv, setLv] = useState<string>('');
  const [br, setBr] = useState<string>('');
  const [q, setQ] = useState('');

  const total = useMemo(() => GROUPS.reduce((s, g) => s + driverVal(g, driver), 0), [driver]);
  const branches = useMemo(() => [...new Set(GROUPS.map((g) => g.branch))].sort(), []);

  const levelRows: RowAgg[] = useMemo(
    () =>
      (['总行级', '分行级'] as const).map((L) => {
        const gs = GROUPS.filter((g) => g.level === L);
        const val = gs.reduce((s, g) => s + driverVal(g, driver), 0);
        return {
          key: L,
          count: gs.length,
          headCount: gs.length,
          val: Math.round(val * 10) / 10,
          share: total ? Math.round((val / total) * 1000) / 10 : 0,
          avgPocket: gs.length ? Math.round((gs.reduce((s, g) => s + (driver === '负债组织' ? g.pocketL : g.pocketA), 0) / gs.length) * 10) / 10 : 0,
          avgNon: gs.length ? Math.round((gs.reduce((s, g) => s + g.nonRate, 0) / gs.length) * 10) / 10 : 0,
          avgScore: gs.length ? Math.round((gs.reduce((s, g) => s + g.score, 0) / gs.length) * 10) / 10 : 0,
          groups: gs,
        };
      }),
    [driver, total],
  );

  const branchRows: RowAgg[] = useMemo(
    () =>
      branches
        .map((b) => {
          const gs = GROUPS.filter((g) => g.branch === b);
          const val = gs.reduce((s, g) => s + driverVal(g, driver), 0);
          return {
            key: b,
            count: gs.length,
            headCount: gs.filter((g) => g.level === '总行级').length,
            val: Math.round(val * 10) / 10,
            share: total ? Math.round((val / total) * 1000) / 10 : 0,
            avgPocket: gs.length ? Math.round((gs.reduce((s, g) => s + (driver === '负债组织' ? g.pocketL : g.pocketA), 0) / gs.length) * 10) / 10 : 0,
            avgNon: gs.length ? Math.round((gs.reduce((s, g) => s + g.nonRate, 0) / gs.length) * 10) / 10 : 0,
            avgScore: gs.length ? Math.round((gs.reduce((s, g) => s + g.score, 0) / gs.length) * 10) / 10 : 0,
            groups: gs,
          };
        })
        .sort((a, b) => b.val - a.val),
    [branches, driver, total],
  );

  const custRows = useMemo(() => {
    let gs = [...GROUPS];
    if (lv) gs = gs.filter((g) => g.level === lv);
    if (br) gs = gs.filter((g) => g.branch === br);
    if (q) gs = gs.filter((g) => g.name.includes(q) || g.industry.includes(q));
    return gs
      .map((g) => ({ g, v: driverVal(g, driver), share: total ? (driverVal(g, driver) / total) * 100 : 0 }))
      .sort((a, b) => b.v - a.v);
  }, [lv, br, q, driver, total]);

  const weakHint =
    driver === '投行综合化' ? '短板：承销/非息偏弱，优先看苏州·南瑞链与连云港·恒瑞定增' : driver === '生态渗透' ? '短板：N端326户距目标420户，缺口在南京·先声链与苏州·沙钢链' : driver === '负债组织' ? '稳健：存款向南京·交控/南钢集中，宿迁·洋河口袋最高' : '稳健：贷款集中在南京·交控与苏州·沙钢，关注雨润敞口';

  return (
    <Card
      size="small"
      style={{ marginTop: 8 }}
      title={
        <span style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span>四大驱动穿透 · {driver}</span>
          <span style={{ fontSize: 11, color: '#888', fontWeight: 400 }}>总量 → 层级 → 分行 → 单户（点击行穿透）</span>
        </span>
      }
      extra={
        <Space size={6}>
          <Select size="small" value={driver} onChange={onDriver} style={{ width: 120 }} options={DRIVER_KEYS.map((d) => ({ value: d, label: d }))} />
          <Segmented
            size="small"
            value={view}
            onChange={(v) => setView(v as typeof view)}
            options={[
              { value: 'level', label: '按层级' },
              { value: 'branch', label: '按分行' },
              { value: 'customer', label: '到户清单' },
            ]}
          />
        </Space>
      }
    >
      <div style={{ fontSize: 11.5, color: '#888', marginBottom: 8 }}>
        口径：{driverUnit(driver)} · 全行总量 {Math.round(total * 10) / 10}（演示20户口径，全量86户同口径折算） · {weakHint}
      </div>
      {view !== 'customer' && (
        <Table
          size="small"
          pagination={false}
          rowKey="key"
          onRow={(r) => ({ onClick: () => { const agg = r as RowAgg; if (view === 'level') { setLv(agg.key); setView('customer'); } else { setBr(agg.key); setView('customer'); } }, style: { cursor: 'pointer' } })}
          dataSource={view === 'level' ? levelRows : branchRows}
          columns={[
            { title: view === 'level' ? '层级' : '分行', dataIndex: 'key', width: 110, render: (v: string, r) => { const a = r as RowAgg; return <span><b>{v}</b><br /><span style={{ fontSize: 11, color: '#888' }}>{a.count}户{view === 'branch' ? `（总${a.headCount}/分${a.count - a.headCount}）` : ''}</span></span>; } },
            { title: `量（${driverUnit(driver).split('（')[0]}）`, dataIndex: 'val', width: 110, sorter: (a, b) => (a as RowAgg).val - (b as RowAgg).val, render: (v: number) => <b>{v}</b> },
            { title: '占全行', dataIndex: 'share', width: 170, render: (v: number) => <span><Progress percent={v} size="small" showInfo={false} /><span style={{ fontSize: 11 }}>{v}%</span></span> },
            { title: driver === '投行综合化' ? '平均非息%' : '平均口袋%', dataIndex: driver === '投行综合化' ? 'avgNon' : 'avgPocket', width: 100, render: (v: number) => `${v}%` },
            { title: '户均评分', dataIndex: 'avgScore', width: 90 },
            {
              title: '状态', width: 90, render: (_, r) => { const a = r as unknown as RowAgg; const weak = (driver === '负债组织' || driver === '资产投放' ? a.avgPocket : a.avgNon) < 18 || a.avgScore < 72; return <Tag color={weak ? 'orange' : 'green'}>{weak ? '偏弱' : '正常'}</Tag>; },
            },
            { title: '操作', width: 130, render: (_, r) => <Button size="small" onClick={(e) => { e.stopPropagation(); const a = r as RowAgg; if (view === 'level') { setLv(a.key); } else { setBr(a.key); } setView('customer'); }}>穿透到户 →</Button> },
          ]}
        />
      )}
      {view === 'customer' && (
        <div>
          <Space style={{ marginBottom: 8 }} size={6}>
            <Select size="small" value={lv} onChange={setLv} allowClear placeholder="全部层级" style={{ width: 110 }} options={[{ value: '总行级', label: '总行级' }, { value: '分行级', label: '分行级' }]} />
            <Select size="small" value={br} onChange={setBr} allowClear placeholder="全部分行" style={{ width: 130 }} options={branches.map((b) => ({ value: b, label: b }))} />
            <Input size="small" placeholder="集团 / 行业" value={q} onChange={(e) => setQ(e.target.value)} style={{ width: 180 }} />
            {(lv || br || q) && <Button size="small" onClick={() => { setLv(''); setBr(''); setQ(''); }}>重置</Button>}
            <span style={{ fontSize: 11, color: '#888' }}>共 {custRows.length} 户 · 点击行进客户360</span>
          </Space>
          <Table
            size="small"
            rowKey={(r) => (r as { g: Group }).g.id}
            pagination={{ pageSize: 8, showTotal: (t) => `共 ${t} 户` }}
            onRow={(r) => ({ onClick: () => onOpen((r as { g: Group }).g.id), style: { cursor: 'pointer' } })}
            dataSource={custRows}
            columns={[
              { title: '集团', width: 190, render: (_, r) => { const { g } = r as { g: Group }; return <span><b>{g.name}</b><br /><span style={{ fontSize: 11, color: '#888' }}>{g.industry} · {g.branch}</span></span>; } },
              { title: '层级', width: 70, render: (_, r) => { const { g } = r as { g: Group }; return <Tag color={g.level === '总行级' ? 'red' : 'blue'}>{g.level}</Tag>; } },
              { title: `单户量`, width: 90, sorter: (a, b) => (a as { v: number }).v - (b as { v: number }).v, render: (_, r) => { const { v } = r as { v: number }; return <b>{v}</b>; } },
              { title: '占全行', width: 120, sorter: (a, b) => (a as { share: number }).share - (b as { share: number }).share, render: (_, r) => { const { share } = r as { share: number }; return <span><Progress percent={Math.round(share * 10) / 10} size="small" showInfo={false} /><span style={{ fontSize: 11 }}>{share.toFixed(1)}%</span></span>; } },
              { title: '辅助（份额/结构）', render: (_, r) => { const { g } = r as { g: Group }; return <span style={{ fontSize: 12 }}>{driverSub(g, driver)}</span>; } },
              { title: '价值', width: 90, render: (_, r) => { const { g } = r as { g: Group }; return <Tag color={g.tag === 'S' ? 'red' : g.tag === 'A' ? 'blue' : g.risk === '预警' ? 'orange' : 'green'}>{g.tag}·{g.score}{g.risk === '预警' ? '·预警' : ''}</Tag>; } },
              { title: '操作', width: 100, render: (_, r) => <Button size="small" onClick={(e) => { e.stopPropagation(); onOpen((r as { g: Group }).g.id); }}>客户360</Button> },
            ]}
          />
        </div>
      )}
      <div style={{ fontSize: 11, color: '#888', marginTop: 6 }}>决策链：总量达成 → 哪一层/哪一行掉队 → 哪几户缺口最大 → 进客户360看商机与督办事项。点击任意行可逐级下钻。</div>
    </Card>
  );
}

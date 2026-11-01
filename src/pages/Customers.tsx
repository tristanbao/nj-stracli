import { Button, Card, Input, Select, Space, Table, Tag, message } from 'antd';
import { useMemo, useState } from 'react';
import { useApp } from '../store';
import CustomerDrawer from '../components/CustomerDrawer';

/** 标签色：行内标签体系着色 */
function tagColor(t: string) {
  if (['上市公司', '产业链链主', '主办行', '发债主体'].includes(t)) return 'red';
  if (['央企二级', '省属国企', '民营龙头', '司库客户', '1端核心'].includes(t)) return 'blue';
  if (t.includes('N端') || t.includes('团金') || t.includes('代发') || t.includes('跨境')) return 'green';
  if (t.includes('风险') || t.includes('压降') || t.includes('续作')) return 'orange';
  return 'default';
}

export default function Customers() {
  const { scopedGroups, route } = useApp();
  const [openId, setOpenId] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [lv, setLv] = useState<string>('');
  const [tag, setTag] = useState<string>('');
  const [ind, setInd] = useState<string>('');
  const std = route === 'cust-std';

  const allTags = useMemo(() => Array.from(new Set(scopedGroups.flatMap((g) => g.tags ?? []))).sort(), [scopedGroups]);
  const allInd = useMemo(() => Array.from(new Set(scopedGroups.map((g) => g.industry.split(' · ')[0]))).sort(), [scopedGroups]);

  const rows = useMemo(
    () =>
      scopedGroups.filter(
        (g) =>
          (!q || g.name.includes(q) || g.managers.includes(q) || (g.tags ?? []).some((t) => t.includes(q))) &&
          (!lv || g.level === lv) &&
          (!tag || (g.tags ?? []).includes(tag)) &&
          (!ind || g.industry.startsWith(ind)),
      ),
    [scopedGroups, q, lv, tag, ind],
  );

  if (std) {
    return (
      <Card title="两级准入标准对照">
        <Table size="small" pagination={false} dataSource={[
          { k: '行业', h: '符合国家战略与现代化产业体系方向', b: '聚焦当地主导、长周期优势产业' },
          { k: '公司', h: '细分行业排名前 20，营收 / 利润 / 资产达标，跨区域经营，治理稳健', b: '成长与合作空间广阔，集团经营价值大' },
          { k: '业务', h: '跨区域、跨市场、跨条线综合化需求，产业链数据价值高', b: '金融属性强，投商行一体化与三环两链机会多' },
          { k: '风险', h: '符合风险偏好，集团风险可控；家谱成员资产分类正常', b: '风险可控；授信类须经总行风险条线核准' },
          { k: '调整', h: '按年度调整，纳入后原则上三年内不调出', b: '单户按年调整，存量三年内原则上不调出' },
        ]} columns={[{ title: '维度', dataIndex: 'k' }, { title: '总行级', dataIndex: 'h' }, { title: '分行级', dataIndex: 'b' }]} />
      </Card>
    );
  }
  return (
    <Card
      title={`战略客户名单（${rows.length} 户）`}
      extra={<span><Button size="small" style={{ marginRight: 8 }} onClick={() => message.success('调入申请已提交会签')}>调入申请</Button><Button size="small" onClick={() => message.success('调出申请已提交评审')}>调出申请</Button></span>}
    >
      <Space wrap style={{ marginBottom: 10 }}>
        <Input placeholder="集团 / 客户经理 / 标签" value={q} onChange={(e) => setQ(e.target.value)} style={{ width: 230 }} />
        <Select value={lv} onChange={setLv} style={{ width: 110 }} allowClear placeholder="层级" options={[{ value: '总行级', label: '总行级' }, { value: '分行级', label: '分行级' }]} />
        <Select value={ind} onChange={setInd} style={{ width: 150 }} allowClear placeholder="行业赛道" options={allInd.map((v) => ({ value: v, label: v }))} />
        <Select value={tag} onChange={setTag} style={{ width: 150 }} allowClear placeholder="客户标签" options={allTags.map((v) => ({ value: v, label: v }))} />
        <Button type="primary" onClick={() => undefined}>查询</Button>
        <Button onClick={() => { setQ(''); setLv(''); setTag(''); setInd(''); }}>重置</Button>
      </Space>
      <Table
        size="small" rowKey="id" pagination={{ pageSize: 12, showTotal: (t) => `共 ${t} 户` }} dataSource={rows}
        scroll={{ x: 1500 }}
        onRow={(r) => ({ onClick: () => setOpenId((r as { id: string }).id), style: { cursor: 'pointer' } })}
        columns={[
          { title: '集团', dataIndex: 'name', width: 170, fixed: 'left' as const, render: (v: string, r) => <span><a onClick={(e) => { e.stopPropagation(); setOpenId((r as { id: string }).id); }}>{v}</a><br /><span style={{ color: '#888', fontSize: 11 }}>{(r as { industry: string }).industry}</span></span> },
          { title: '层级', dataIndex: 'level', width: 80, render: (v: string) => <Tag color={v === '总行级' ? 'red' : 'blue'}>{v}</Tag> },
          { title: '客户标签', dataIndex: 'tags', width: 260, render: (v: string[]) => <span>{(v ?? []).slice(0, 4).map((t) => <Tag key={t} color={tagColor(t)} style={{ marginBottom: 2 }}>{t}</Tag>)}<span style={{ color: '#999', fontSize: 11 }}>{(v ?? []).length > 4 ? ` +${(v ?? []).length - 4}` : ''}</span></span> },
          { title: '价值', dataIndex: 'tag', width: 90, render: (v: string, r) => <Tag color={v === 'S' ? 'red' : v === 'A' ? 'blue' : v === 'B' ? 'green' : 'orange'}>{v} · {(r as { score: number }).score} 分</Tag> },
          { title: 'EVA(万)', dataIndex: 'eva', width: 90, sorter: (a, b) => (a as { eva: number }).eva - (b as { eva: number }).eva },
          { title: '营收(万)', dataIndex: 'revenue', width: 90 },
          { title: '存款日均(亿)', dataIndex: 'deposit', width: 105, sorter: (a, b) => (a as { deposit: number }).deposit - (b as { deposit: number }).deposit },
          { title: 'FPA(亿)', dataIndex: 'fpa', width: 80 },
          { title: '口袋负债/资产', width: 120, render: (_, r) => { const m = r as { pocketL: number; pocketA: number }; return `${m.pocketL}% / ${m.pocketA}%`; } },
          { title: '家谱/N端', width: 110, render: (_, r) => { const m = r as { homeCount: number; nEnd: number }; return `${m.homeCount} 户 / ${m.nEnd} 户`; } },
          { title: '主办', dataIndex: 'branch', width: 100, render: (v: string, r) => <span>{v}<br /><span style={{ color: '#888', fontSize: 11 }}>{(r as { managers: string }).managers}</span></span> },
          { title: '状态', dataIndex: 'risk', width: 70, render: (v: string) => <Tag color={v === '预警' ? 'red' : 'green'}>{v}</Tag> },
          { title: '操作', width: 90, fixed: 'right' as const, render: (_, r) => <Button size="small" onClick={(e) => { e.stopPropagation(); setOpenId((r as { id: string }).id); }}>客户 360</Button> },
        ]}
      />
      <CustomerDrawer openId={openId} onClose={() => setOpenId(null)} />
    </Card>
  );
}

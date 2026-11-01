import { Button, Card, Col, Drawer, Form, Input, Progress, Row, Space, Table, Tabs, Tag, Timeline, message } from 'antd';
import { useMemo, useState } from 'react';
import { GROUPS, OPPORTUNITIES } from '../data';
import { useApp } from '../store';
import CustomerDrawer from '../components/CustomerDrawer';

/**
 * 客户经理工作台（桌面端）：整合自《客户经理工作台-桌面端-单文件.html》
 * 经营总览大卡 + 今日重点横向滚动 + 重大商机跟踪 + 重点客户进展 + 日程/提醒
 * 数据接行内 demo 真实户（mgr 仅见 g1 南钢 / g2 南瑞），人名去全名、保留姓+职务在360里
 */
export default function MgrDesk() {
  const { scopedGroups, user } = useApp();
  // 首页问候去名化：只显示 姓+职务（如 张经理），不放全名
  const mgrShort = user ? `${user.name[0]}经理` : '张经理';
  const [focus, setFocus] = useState('all');
  const [remind, setRemind] = useState('risk');
  const [openId, setOpenId] = useState<string | null>(null);
  const [drawer, setDrawer] = useState<string | null>(null);

  const myGroups = scopedGroups.length ? scopedGroups : GROUPS.filter((g) => ['g1', 'g2'].includes(g.id));
  const myOpps = useMemo(() => OPPORTUNITIES.filter((o) => myGroups.some((g) => g.id === o.groupId)), [myGroups]);
  const newCount = myOpps.filter((o) => o.isNew).length;

  // 今日重点：由真实商机 + 履职事项拼成（对应 HTML 的 6 张卡片）
  const focusItems = [
    { kind: 'plan', tag: '质量整改', level: '今日截止', color: 'red', title: `${myGroups[0]?.name ?? '南钢'} · 规划书评审整改`, desc: '预评发现 2 项待补：同行业授信比较、季度OKR时间节点；需量化重大商机进度', foot: '扣分项 2', act: '进入整改' },
    { kind: 'visit', tag: '访后48h纪要', level: '剩 6 小时', color: 'red', title: `${myGroups[0]?.name ?? '南钢'} · 高层拜访纪要待上传`, desc: '昨日拜访财务总监，已识别客户诉求 3 项，需补录责任人和结项时间', foot: '诉求 3', act: '写纪要' },
    { kind: 'lead', tag: '重大商机研判', level: '14:30', color: 'blue', title: `${myOpps[1]?.title ?? '转炉升级银团'}`, desc: '扩产/技改融资需求，核实重大资产业务需求及决策链，限制知情范围', foot: '拜访财务总监', act: '确认负责' },
    { kind: 'plan', tag: '目标校验', level: '待确认', color: 'orange', title: `${myGroups[1]?.name ?? '南瑞'} · 1+10目标校验`, desc: '补齐重点客户经营分类、重点方向、基数、年度目标及主要推动措施', foot: '1+10 计划', act: '校验目标' },
    { kind: 'plan', tag: '材料提交', level: '17:00', color: 'orange', title: `${myGroups[1]?.name ?? '南瑞'} · 储能项目贷材料`, desc: '授信续作与项目贷款材料今日 17:00 前提交审批', foot: '截止事项', act: '去提交' },
    { kind: 'lead', tag: '关键人触达', level: '剩 3 日', color: 'orange', title: `${myGroups[0]?.name ?? '南钢'} · 采购总监确权触达`, desc: 'N 端确权对接人需在时限内完成触达；联系方式按最小权限查阅', foot: '关键人', act: '安排触达' },
  ];
  const focusRows = focusItems.filter((f) => focus === 'all' || f.kind === focus);

  return (
    <div>
      {/* 页头问候 + 快捷发起 */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 12 }}>
        <Col>
          <div style={{ fontSize: 18, fontWeight: 700 }}>早上好，{mgrShort}</div>
          <div style={{ fontSize: 12, color: '#888' }}>2026年10月31日 星期六 · 今日 6 项重点事项，其中 2 项今日到期 · 管户 {myGroups.length} 户</div>
        </Col>
        <Col>
          <Space>
            <Button onClick={() => setDrawer('填写拜访纪要')}>写纪要</Button>
            <Button onClick={() => setDrawer('录入商机')}>录入商机</Button>
            <Button onClick={() => setDrawer('发起协同任务')}>发起协同</Button>
            <Button type="primary" onClick={() => setDrawer('新建客户拜访')}>新建拜访</Button>
          </Space>
        </Col>
      </Row>

      {/* 1. 经营总览：一张卡两层 */}
      <Card size="small" style={{ marginBottom: 12 }}>
        <Row gutter={10}>
          {[
            ['经营业绩', '1,286 万元', '累计综合净收入 · 同比 +6.2%'],
            ['客户经营', `${myGroups.length} 户`, `重点客户阶段达标 · 在跟商机 ${myOpps.length} 个`],
            ['商机转化', `${myOpps.filter((o) => (o.progress ?? 0) >= 50).length} 项`, `重大商机已推进 · 新增 ${newCount} 项`],
            ['履职质量', '89 分', '综合履职评分 · 2 项待整改'],
          ].map((k) => (
            <Col span={6} key={k[0]}>
              <Card size="small" type="inner" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#888' }}>{k[0]}</div>
                <b style={{ fontSize: 22 }}>{k[1]}</b>
                <div style={{ fontSize: 11, color: '#888' }}>{k[2]}</div>
              </Card>
            </Col>
          ))}
        </Row>
        <Row gutter={10} style={{ marginTop: 10 }}>
          {[
            ['规划书上传', `${myGroups.length}/${myGroups.length}`, 100, '已完成', 'green'],
            ['内部质量评审', `${myGroups.length - 0}/${myGroups.length}`, 89, '2户整改', 'orange'],
            ['回检优化', `${myGroups.length}/${myGroups.length}`, 100, '已完成', 'green'],
            ['季度OKR落实', '11/14', 79, '3项受阻', 'orange'],
            ['评分卡过程测算', '83.6分', 84, '40+50+10', 'default'],
          ].map((d) => (
            <Col span={4} key={d[0] as string} style={{ flex: 1 }}>
              <Card size="small" type="inner" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#888' }}>{d[0]}</div>
                <b>{d[1]}</b> <Tag color={d[4] as string} style={{ fontSize: 10 }}>{d[3]}</Tag>
                <Progress percent={d[2] as number} size="small" showInfo={false} />
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* 2. 今日重点横向滚动 */}
      <Card
        size="small" style={{ marginBottom: 12 }}
        title="今日重点" extra={<Space><Button size="small" type={focus === 'all' ? 'primary' : 'default'} onClick={() => setFocus('all')}>全部</Button><Button size="small" type={focus === 'plan' ? 'primary' : 'default'} onClick={() => setFocus('plan')}>一户一策</Button><Button size="small" type={focus === 'visit' ? 'primary' : 'default'} onClick={() => setFocus('visit')}>拜访</Button><Button size="small" type={focus === 'lead' ? 'primary' : 'default'} onClick={() => setFocus('lead')}>商机诉求</Button></Space>}
      >
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
          {focusRows.map((f) => (
            <Card key={f.title} size="small" type="inner" style={{ minWidth: 290, flex: '0 0 290px' }}>
              <Space><Tag>{f.tag}</Tag><Tag color={f.color}>{f.level}</Tag></Space>
              <div style={{ fontWeight: 700, margin: '6px 0' }}>{f.title}</div>
              <div style={{ fontSize: 12, color: '#555', minHeight: 38 }}>{f.desc}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                <span style={{ fontSize: 12, color: '#888' }}>{f.foot}</span>
                <Button size="small" type="link" onClick={() => setDrawer(f.act)}>{f.act} →</Button>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      <Row gutter={10} align="top">
        <Col span={16}>
          <Card size="small" type="inner" title="重大商机跟踪" extra={<a onClick={() => message.success('商机管理页已打开（按管户过滤）')}>商机管理</a>} style={{ marginBottom: 10 }}>
            <Table
              size="small" pagination={false} rowKey="id" dataSource={myOpps.slice(0, 5)}
              columns={[
                { title: '商机', dataIndex: 'title', render: (v: string, r) => <span><b>{v}</b><br /><span style={{ fontSize: 11, color: '#888' }}>{(r as { update: string }).update} · {(r as { owner: string }).owner}</span></span> },
                { title: '金额', dataIndex: 'amount', width: 90 },
                { title: '阶段', dataIndex: 'stage', width: 90, render: (v: string) => <Tag color={v === '已达成' || v === '签约落地' || v === '协同中' || v === '执行中' ? 'green' : v === '已失败' ? 'red' : v === '方案制定' || v === '陪标中' ? 'purple' : v.includes('待') || v === '线索' ? 'orange' : 'blue'}>{v}</Tag> },
                { title: '剩', dataIndex: 'daysLeft', width: 90, render: (v: number) => <Tag color={v <= 20 ? 'red' : 'green'}>剩 {v} 天</Tag> },
                { title: '进度', dataIndex: 'progress', width: 120, render: (v: number) => <Progress percent={v ?? 0} size="small" /> },
                { title: '操作', width: 90, render: () => <Button size="small" onClick={() => message.success('跟进记录已更新')}>更新进展</Button> },
              ]}
            />
          </Card>
          <Card size="small" type="inner" title="重点客户经营进展" extra={<span style={{ fontSize: 11, color: '#888' }}>关键人覆盖 82% · 总部条线 5/6</span>}>
            <Table
              size="small" pagination={false} rowKey="id" dataSource={myGroups}
              columns={[
                { title: '客户', dataIndex: 'name', render: (v: string, r) => <a onClick={() => setOpenId((r as { id: string }).id)}>{v}</a> },
                { title: '价值', dataIndex: 'tag', width: 90, render: (v: string, r) => <Tag color={v === 'S' ? 'red' : 'blue'}>{v} · {(r as { score: number }).score}</Tag> },
                { title: '当前重点', dataIndex: 'mainOpp' },
                { title: '在跟商机', width: 90, render: (_, r) => `${myOpps.filter((o) => o.groupId === (r as { id: string }).id).length} 个` },
                { title: '操作', width: 100, render: (_, r) => <Button size="small" onClick={() => setOpenId((r as { id: string }).id)}>客户360</Button> },
              ]}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small" type="inner" title="今日日程 · 10月31日" extra={<a>日历</a>} style={{ marginBottom: 10 }}>
            <Timeline items={[
              { children: '09:30 Q4 储备线索晨会 · 战略客户部会议室' },
              { children: '11:00 南钢银团方案会签 · 线上会议' },
              { children: '14:30 拜访南瑞财务总监 · 客户总部' },
              { children: '17:00 提交南瑞储能项目贷材料 · 截止事项' },
            ]} />
          </Card>
          <Card
            size="small" type="inner" title="提醒"
            extra={<Space><Button size="small" type={remind === 'risk' ? 'primary' : 'default'} onClick={() => setRemind('risk')}>风险预警(3)</Button><Button size="small" type={remind === 'sla' ? 'primary' : 'default'} onClick={() => setRemind('sla')}>时限(6)</Button></Space>}
          >
            {remind === 'risk' ? (
              <Table
                size="small" pagination={false} showHeader={false} dataSource={[
                  { k: '南钢存货周转放缓', v: '货押+保险 · 周转≤90天', c: 'orange' },
                  { k: '南瑞预付规模较大', v: '信用证+货押 · 逐月回检', c: 'orange' },
                  { k: '南钢 12 亿流贷 12 月到期', v: '授信方案已报 · 待提款', c: 'red' },
                ]}
                columns={[{ dataIndex: 'k', render: (v: string, r) => <span><b>{v}</b><br /><span style={{ fontSize: 11, color: '#888' }}>{(r as { v: string }).v}</span></span> }, { dataIndex: 'c', width: 70, render: (v: string) => <Tag color={v}>关注</Tag> }]}
              />
            ) : (
              <Table
                size="small" pagination={false} showHeader={false} dataSource={[
                  { k: '访后48h纪要', v: '剩 6 小时' },
                  { k: '核心主体季度触达', v: '剩 7 天' },
                  { k: '集团月度触达', v: '2户待补' },
                  { k: '诉求3个月结项', v: '在办 8 项' },
                ]}
                columns={[{ dataIndex: 'k' }, { dataIndex: 'v', width: 90, render: (v: string) => <Tag color="orange">{v}</Tag> }]}
              />
            )}
          </Card>
        </Col>
      </Row>

      <Drawer title={drawer ?? '事项'} open={!!drawer} onClose={() => setDrawer(null)} width={440}>
        <Form layout="vertical">
          <Form.Item label="关联客户"><Input value={myGroups[0]?.name} /></Form.Item>
          <Form.Item label="下一步行动"><Input /></Form.Item>
          <Form.Item label="行动记录"><Input.TextArea rows={4} placeholder="记录客户反馈、需求变化、关键人信息和后续安排" /></Form.Item>
          <Button type="primary" block onClick={() => { setDrawer(null); message.success('已保存，经营进度已更新'); }}>保存并推进</Button>
        </Form>
      </Drawer>
      <CustomerDrawer openId={openId} onClose={() => setOpenId(null)} />
    </div>
  );
}

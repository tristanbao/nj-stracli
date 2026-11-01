import { Button, Card, Descriptions, Input, Select, Steps, Table, message } from 'antd';

export default function Planning() {
  return (
    <Card title="一户一策 · 集团经营规划">
      <Steps size="small" current={2} items={[{ title: '画像与回检' }, { title: '当年规划' }, { title: '评审 36/38' }, { title: '执行落地' }, { title: '8 月回检' }, { title: '次年 1 月考核' }]} />
      <div style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
        <Select defaultValue="南京钢铁集团" style={{ width: 200 }} options={[{ value: '南京钢铁集团', label: '南京钢铁集团' }, { value: '国电南瑞集团', label: '国电南瑞集团' }]} />
        <Button type="primary" onClick={() => message.success('已加载该集团本年度经营规划书')}>加载</Button>
        <Button onClick={() => message.success('规划书 Word 版已导出')}>导出</Button>
      </div>
      <Descriptions column={2} bordered size="small" title="一、客户画像 / 二、回检与规划（摘要）">
        <Descriptions.Item label="一图两表">股权架构 + 我行授信明细 + 同业授信比较</Descriptions.Item>
        <Descriptions.Item label="关键人">中高管 + 核心营运 + 董秘（上市必备）</Descriptions.Item>
        <Descriptions.Item label="上年回检">近三年营收 / 利息 / 非息 / FPA / 存款 / 口袋份额</Descriptions.Item>
        <Descriptions.Item label="当年目标">KPI（营收 / 存款 / 贷款）+ 1+10（≥10 户）+ OKR</Descriptions.Item>
      </Descriptions>
      <Table
        size="small" style={{ marginTop: 12 }} pagination={false} title={() => '评审打分'}
        dataSource={[{ k: '画像', s: 20, v: 17 }, { k: '回检', s: 30, v: 25 }, { k: '规划', s: 40, v: 34 }, { k: '总体', s: 10, v: 8 }]}
        columns={[{ title: '维度', dataIndex: 'k' }, { title: '分值', dataIndex: 's' }, { title: '得分', dataIndex: 'v', render: (v: number) => <Input defaultValue={v} style={{ width: 60 }} /> }]}
      />
      <Button type="primary" style={{ marginTop: 10 }} onClick={() => message.success('评审 84 分已提交，自动回写考核')}>提交评审</Button>
    </Card>
  );
}

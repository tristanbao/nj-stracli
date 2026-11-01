import { Button, Card, Col, Row, Statistic, Table, Tag, message } from 'antd';
import { useState } from 'react';
import { APPR_ITEMS } from '../data';

export default function Approval() {
  const [items, setItems] = useState(APPR_ITEMS);
  return (
    <div>
      <Row gutter={10}>
        {[['待我审批', '6', '2 项即将超期'], ['本月已办', '18', '平均 1.6 天'], ['定价审批中', '3', '联动授信审批'], ['分润仲裁', '1', 'T+5 裁定']].map((k) => (
          <Col span={6} key={k[0]}><Card size="small"><Statistic title={k[0]} value={k[1]} suffix={<span style={{ fontSize: 11 }}>{k[2]}</span>} /></Card></Col>
        ))}
      </Row>
      <Card size="small" title="审批列表" style={{ marginTop: 10 }}>
        <Table
          size="small" rowKey="id" dataSource={items} pagination={false}
          columns={[
            { title: '事项', dataIndex: 'kind', render: (v: string) => <b>{v}</b> },
            { title: '提交人 / 机构', dataIndex: 'from' },
            { title: '摘要', dataIndex: 'summary' },
            { title: '等待', dataIndex: 'waiting' },
            { title: '状态', dataIndex: 'state', render: (v: string) => <Tag color={v === '待办' ? 'orange' : 'green'}>{v}</Tag> },
            { title: '操作', render: (_, r) => <span><Button size="small" type="primary" disabled={(r as { state: string }).state !== '待办'} onClick={() => { setItems(items.map((x) => (x.id === (r as { id: string }).id ? { ...x, state: '已同意' as const } : x))); message.success('审批意见已提交，进入下一节点'); }}>审批</Button> <Button size="small" style={{ marginLeft: 6 }} onClick={() => message.info('流程轨迹：提交 → 会签 → 审定 → 发文')}>详情</Button></span> },
          ]}
        />
      </Card>
    </div>
  );
}

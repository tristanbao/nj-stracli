import { Button, Card, Col, Row, Table, Tabs, Tag, message } from 'antd';
import { BizChart } from '../components/Charts';
import { GROUPS } from '../data';
import { useApp } from '../store';

export default function Reports({ anchor }: { anchor?: string }) {
  const { route } = useApp();
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
          <Col span={12}><Card size="small" title="经营团队">南钢服务团队：张嵘(A) / 李薇(B) + 分行 3 人 + 投行 1 人 <Tag color="green">触达 100%</Tag></Card></Col>
        </Row>
      </div>
    );
  }
  return (
    <div>
      <Card size="small" title="集团经营合作分析" extra={<Button size="small" onClick={() => message.success('已按统一模板导出')}>导出模板</Button>}>
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

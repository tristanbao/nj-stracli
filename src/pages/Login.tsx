import { Button, Card, Form, Input, List, Typography } from 'antd';
import { USERS } from '../data';
import { useApp } from '../store';
import { useState } from 'react';

export default function LoginPage() {
  const { login } = useApp();
  const [selected, setSelected] = useState(USERS[0]);
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div style={{ flex: 1.15, background: 'linear-gradient(135deg,#0d1c36,#1b3a6e 60%,#274e95)', color: '#fff', padding: 56, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Typography.Title level={2} style={{ color: '#fff', letterSpacing: 2 }}>战略客户经营管理平台</Typography.Title>
        <Typography.Paragraph style={{ color: 'rgba(255,255,255,.8)' }}>
          总行战略客户部 / 分行战略客户团队 / 经营主办行协同使用
        </Typography.Paragraph>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, maxWidth: 560, marginTop: 18 }}>
          {['名单制 · 两级管理：总行级 / 分行级准入、调整、家谱', '一户一策 · 闭环：规划 — 评审 — 执行 — 回检 — 考核', '营销协同 · 落地：商机 — 访客 — 定价 — 分润 — 权益', '驾驶舱 · 决策：经营 / 投行 / 监管 / 授信四模块'].map((t) => (
            <Card key={t} size="small" style={{ background: 'rgba(255,255,255,.08)', borderColor: 'rgba(255,255,255,.16)', color: '#fff' }}><span style={{ color: '#fff', fontSize: 12 }}>{t}</span></Card>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
        <div style={{ width: 360 }}>
          <Typography.Title level={3}>统一认证登录</Typography.Title>
          <Typography.Paragraph type="secondary">选择本次演示登录用户（模拟 SSO，不同岗位数据权限不同）</Typography.Paragraph>
          <List
            bordered
            dataSource={USERS}
            renderItem={(u) => {
              const sp = u.post.includes('分行行长') ? '行长' : u.post.includes('总经理') ? '总经理' : u.post.includes('经理') ? '经理' : u.post.includes('行长') ? '行长' : u.post;
              const label = `${u.name[0]}${sp}`;
              return (
              <List.Item onClick={() => setSelected(u)} style={{ cursor: 'pointer', background: selected.workNo === u.workNo ? '#eef4ff' : undefined }}>
                <List.Item.Meta title={<span>{label} <Typography.Text type="secondary" style={{ fontSize: 11 }}>{u.dept}</Typography.Text></span>} description={`工号 ${u.workNo}`} />
              </List.Item>
              );
            }}
          />
          <Form layout="vertical" style={{ marginTop: 12 }}>
            <Form.Item label="密码（任意输入）"><Input.Password defaultValue="123456" /></Form.Item>
            <Button type="primary" danger block size="large" onClick={() => login(selected)}>登 录</Button>
          </Form>
        </div>
      </div>
    </div>
  );
}

import { Avatar, Badge, Breadcrumb, Dropdown, Layout, Menu } from 'antd';
import { BellOutlined, DownOutlined } from '@ant-design/icons';
import { useApp } from '../store';
import Home from './Home';
import Customers from './Customers';
import Planning from './Planning';
import Marketing from './Marketing';
import Approval from './Approval';
import Reports from './Reports';
import Supervise from './Supervise';
import MgrDesk from './MgrDesk';

const { Header, Sider, Content } = Layout;

/** 左侧分级功能树：常驻全量导航（行内系统形态），不再随顶栏切换 */
const NAV_TREE = [
  {
    group: '指挥塔',
    children: [
      { key: 'home', label: '全局总览' },
      { key: 'perf', label: '实绩总览' },
      { key: 'sup-task', label: '重大项目督办' },
      { key: 'sup-coop', label: '协同调度' },
    ],
  },
  {
    group: '客户经营',
    children: [
      { key: 'cust', label: '战略客户名单' },
      { key: 'cust-std', label: '准入标准对照' },
      { key: 'plan', label: '经营规划书' },
      { key: 'plan-review', label: '评审考核' },
    ],
  },
  {
    group: '营销协同',
    children: [
      { key: 'mkt-opp', label: '商机管理' },
      { key: 'mkt-visit', label: '访客管理' },
      { key: 'mkt-co', label: '全行服务一家' },
    ],
  },
  {
    group: '经营管理',
    children: [
      { key: 'price', label: '定价审批' },
      { key: 'price-key', label: '权益派发' },
      { key: 'price-split', label: '分润管理' },
      { key: 'price-team', label: '经营团队' },
    ],
  },
  {
    group: '分析审批',
    children: [
      { key: 'rep', label: '经营合作分析' },
      { key: 'rep-rpt', label: '决策报表' },
      { key: 'appr', label: '待办审批' },
    ],
  },
];

/** 客户经理独立导航：工作台视角（对齐 HTML 单文件：工作总览/客户经营/提醒） */
const MGR_NAV = [
  {
    group: '我的工作',
    children: [
      { key: 'home', label: '工作总览' },
      { key: 'mkt-opp', label: '商机与线索' },
      { key: 'mkt-visit', label: '拜访与触达' },
      { key: 'appr', label: '履职待办' },
    ],
  },
  {
    group: '客户经营',
    children: [
      { key: 'cust', label: '我负责的客户' },
      { key: 'plan', label: '经营规划书' },
      { key: 'mkt-co', label: '诉求与协同' },
      { key: 'rep', label: '风险预警' },
    ],
  },
];

/** 顶栏 key → 高亮映射：督办/实绩都归属首页总览 */
function topActive(route: string): string {
  if (route === 'home' || route === 'perf' || route.startsWith('sup')) return 'home';
  if (route.startsWith('cust')) return 'cust';
  if (route.startsWith('plan')) return 'plan';
  if (route.startsWith('mkt')) return 'mkt-opp';
  if (route.startsWith('price')) return 'price';
  if (route === 'appr') return 'appr';
  if (route.startsWith('rep')) return 'rep';
  return 'home';
}

export default function Shell() {
  const { user, logout, route, nav } = useApp();
  if (!user) return null;
  // 右上角去名化：只显示 姓+职务（如 王行长 / 李总经理 / 陈行长 / 张经理），不放全名
  const shortPost = user.post.includes('行长') ? '行长' : user.post.includes('总经理') ? '总经理' : user.post.includes('经理') ? '经理' : user.post;
  const shortName = `${user.name[0]}${shortPost}`;
  const isMgr = user.id === 'mgr';
  // 客户经理登录：首页 = 独立工作台（MgrDesk），其余页沿用行内页但数据已按管户过滤
  const body = isMgr && route === 'home' ? <MgrDesk /> :
    route.startsWith('cust') ? <Customers /> :
    route.startsWith('plan') ? <Planning /> :
    route.startsWith('mkt') ? <Marketing /> :
    route.startsWith('sup') ? <Supervise anchor={route} /> :
    route === 'perf' ? <Supervise anchor="perf" /> :
    route === 'appr' ? <Approval /> :
    route.startsWith('rep') ? <Reports /> :
    route.startsWith('price') ? <Reports anchor="price" /> : <Home />;
  const tree = isMgr ? MGR_NAV : NAV_TREE;
  const crumb = tree.flatMap((g) => g.children).find((c) => c.key === route)?.label ?? (isMgr ? '工作总览' : '全局总览');
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', gap: 16, background: '#14294e', padding: '0 16px', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fff', fontWeight: 700 }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: '#fff', color: '#b01f24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>南</div>
          {isMgr ? '客户经理工作台' : '战略客户经营管理平台'}
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[topActive(route)]}
          onClick={(e) => nav(e.key)}
          style={{ background: '#14294e', flex: 1, minWidth: 0 }}
          items={isMgr ? [
            { key: 'home', label: '工作台' },
            { key: 'cust', label: '客户中心' },
            { key: 'mkt-opp', label: '营销中心' },
            { key: 'rep', label: '经营驾驶舱' },
          ] : [
            { key: 'home', label: '首页总览' },
            { key: 'cust', label: '客户管理' },
            { key: 'plan', label: '一户一策' },
            { key: 'mkt-opp', label: '营销协同' },
            { key: 'price', label: '定价与权益' },
            { key: 'appr', label: '审批中心' },
            { key: 'rep', label: '决策分析' },
          ]}
        />
        <Badge count={isMgr ? 6 : 3} size="small"><BellOutlined style={{ color: '#fff', fontSize: 16 }} /></Badge>
        <Dropdown menu={{ items: [{ key: 'logout', label: '退出登录', onClick: logout }] }}>
          <span style={{ color: '#fff', cursor: 'pointer' }}><Avatar size="small" style={{ background: '#f2c14e', color: '#333', marginRight: 6 }}>{shortName[0]}</Avatar>{shortName} <DownOutlined /></span>
        </Dropdown>
      </Header>
      <Layout>
        <Sider width={216} theme="light" style={{ borderRight: '1px solid #e3e8ef' }}>
          <Menu
            mode="inline"
            selectedKeys={[route]}
            defaultOpenKeys={tree.map((g) => g.group)}
            onClick={(e) => nav(e.key)}
            style={{ height: '100%', paddingBottom: 24 }}
            items={tree.map((g) => ({ key: g.group, label: g.group, children: g.children.map((c) => ({ key: c.key, label: c.label })) }))}
          />
        </Sider>
        <Content style={{ padding: 14, background: '#eef1f6' }}>
          <Breadcrumb style={{ marginBottom: 10 }} items={[{ title: isMgr ? '客户经理' : '战略客户' }, { title: crumb }]} />
          {body}
        </Content>
      </Layout>
    </Layout>
  );
}

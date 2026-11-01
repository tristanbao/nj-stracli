/** 全局类型定义：对齐招行名单/一户一策/工作范式 + 行方22项需求口径 */
export type Level = '总行级' | '分行级';
export type ValueTag = 'S' | 'A' | 'B' | 'C';

export interface User {
  id: 'head' | 'dept' | 'branch' | 'mgr';
  name: string;
  dept: string;
  post: string;
  workNo: string;
}

export interface Group {
  id: string;
  name: string;
  level: Level;
  industry: string;
  branch: string;
  managers: string;
  eva: number; // 万元
  revenue: number; // 万元
  deposit: number; // 亿元 日均
  loan: number; // 亿元
  rate: number; // 1+10 进展 %
  mainOpp: string;
  score: number;
  tag: ValueTag;
  risk: '正常' | '预警';
  founded: string;
  credit: string;
  /** 多维标签：价值 / 行业 / 合作 / 生态 / 风险 */
  tags: string[];
  fpa: number; // 亿元 FPA余额
  nonRate: number; // 非息占比 %
  pocketL: number; // 负债口袋份额 %
  pocketA: number; // 资产口袋份额 %
  homeCount: number; // 家谱户数
  nEnd: number; // N端户数
  bEnd: string; // B端覆盖
}

export interface Opportunity {
  id: string;
  title: string;
  group: string;
  groupId: string;
  category: string;
  /** 销售阶段（行内口径）：线索 / 初筛 / 需求确认 / 方案制定 / 审批定价 / 签约落地 / 已达成 / 已失败 */
  stage: string;
  priority: '高' | '中' | '低';
  amount: string;
  owner: string;
  update: string;
  created?: string;
  due?: string;
  daysLeft?: number;
  progress?: number;
  isNew?: boolean;
  /** Salesforce 式扩展（可选，缺省由展示层按规则派生，保证老数据兼容） */
  source?: string; // 线索来源：拜访挖掘 / N端转介 / 总行推送 / 存量到期 / 客户主动
  contact?: string; // 关键决策人：财务总监 / 董秘 / 董事长等（只放职务，不放人名）
  nextStep?: string; // 下一步动作
  winReason?: string; // 赢单原因（已达成时填）
  lossReason?: string; // 丢单原因（已失败时填）
}

export interface KeyPerson {
  id: string;
  name: string;
  post: string;
  dept: string;
  phone: string;
  masked: string;
  coverage: string;
  contributor: string;
  points: number;
  approved: '已公开' | '待审批' | '未收录';
}

export interface ApprItem {
  id: string;
  kind: string;
  from: string;
  summary: string;
  waiting: string;
  state: '待办' | '已同意' | '已退回';
}

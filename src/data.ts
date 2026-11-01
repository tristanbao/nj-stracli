import type { ApprItem, Group, KeyPerson, Opportunity, User } from './types';

export const USERS: User[] = [
  { id: 'head', name: '王行长', dept: '总行', post: '分管行长', workNo: 'NJ8801' },
  { id: 'dept', name: '李总经理', dept: '总行战略客户部', post: '总经理', workNo: 'NJ8802' },
  { id: 'branch', name: '陈行长', dept: '南京分行', post: '分行行长', workNo: 'NJ8803' },
  { id: 'mgr', name: '张经理', dept: '南京分行营业部', post: '战略客户经理', workNo: 'NJ8804' },
];

export const GROUPS: Group[] = [
  { id: 'g1', name: '南京钢铁集团', level: '总行级', industry: '先进制造 · 钢铁', branch: '南京分行', managers: '张经理 / 李经理', eva: 4820, revenue: 9100, deposit: 68.5, loan: 54.2, rate: 92, mainOpp: '转炉升级银团 12 亿', score: 91, tag: 'S', risk: '正常', founded: '成立 2005 年 · 注册资本 58 亿', credit: '我行授信 32 亿（敞口 21 亿）· 同业份额 22%（主办行）', tags: ['上市公司', '产业链链主', '发债主体', '主办行', '1端核心', '绿色技改'], fpa: 96, nonRate: 31, pocketL: 24, pocketA: 28, homeCount: 12, nEnd: 58, bEnd: 'B端 8/12 · 代发 1.1 万人' },
  { id: 'g2', name: '国电南瑞集团', level: '总行级', industry: '智能电网', branch: '南京分行', managers: '王经理 / 陈经理', eva: 3950, revenue: 7600, deposit: 52.3, loan: 31.8, rate: 88, mainOpp: '中期票据 10 亿承销', score: 89, tag: 'A', risk: '正常', founded: '成立 2001 年 · 注册资本 66.6 亿', credit: '我行授信 28 亿（敞口 17 亿）· 同业份额 25%（主办行）', tags: ['央企二级', '上市公司', '发债主体', '司库客户', '跨境结算', '主办行'], fpa: 88, nonRate: 34, pocketL: 22, pocketA: 26, homeCount: 18, nEnd: 64, bEnd: 'B端 12/18 · 代发 2.2 万人' },
  { id: 'g3', name: '先声药业集团', level: '总行级', industry: '生物医药', branch: '南京分行', managers: '赵经理 / 孙经理', eva: 2680, revenue: 5200, deposit: 34.7, loan: 28.9, rate: 81, mainOpp: '司库 / CBS 招标', score: 86, tag: 'A', risk: '正常', founded: '成立 1995 年 · 注册资本 27 亿', credit: '我行授信 20 亿（敞口 12 亿）· 同业份额 19%', tags: ['上市公司', '创新药械', '司库客户', '跨境研发', 'N端待拓'], fpa: 61, nonRate: 29, pocketL: 19, pocketA: 21, homeCount: 9, nEnd: 22, bEnd: 'B端 5/9 · 代发 0.6 万人' },
  { id: 'g4', name: '熊猫电子集团', level: '分行级', industry: '电子信息', branch: '南京分行', managers: '刘经理', eva: 1420, revenue: 2900, deposit: 18.2, loan: 15.6, rate: 76, mainOpp: '供应链 N 端破冰 6 户', score: 78, tag: 'B', risk: '正常', founded: '成立 1936 年 · 注册资本 9.1 亿', credit: '我行授信 12 亿（敞口 8 亿）', tags: ['省属国企', '供应链1端', 'N端待拓', '团金B端'], fpa: 24, nonRate: 22, pocketL: 14, pocketA: 16, homeCount: 7, nEnd: 31, bEnd: 'B端 4/7 · 代发 0.4 万人' },
  { id: 'g5', name: '苏交科集团', level: '分行级', industry: '数字基建', branch: '无锡分行', managers: '周经理', eva: 1180, revenue: 2400, deposit: 14.9, loan: 12.3, rate: 74, mainOpp: 'ABS 5 亿', score: 76, tag: 'B', risk: '正常', founded: '成立 1978 年 · 注册资本 12.7 亿', credit: '我行授信 10 亿（敞口 6 亿）', tags: ['上市公司', '发债主体', '项目制', '属地协同'], fpa: 19, nonRate: 26, pocketL: 12, pocketA: 15, homeCount: 6, nEnd: 12, bEnd: 'B端 3/6 · 代发 0.3 万人' },
  { id: 'g6', name: '康尼机电集团', level: '分行级', industry: '轨道交通', branch: '常州分行', managers: '吴经理', eva: 960, revenue: 1950, deposit: 11.4, loan: 9.8, rate: 69, mainOpp: '跨境资金池', score: 71, tag: 'B', risk: '正常', founded: '成立 1979 年 · 注册资本 9.3 亿', credit: '我行授信 8 亿（敞口 5 亿）', tags: ['上市公司', '跨境结算', 'N端待拓'], fpa: 14, nonRate: 24, pocketL: 11, pocketA: 13, homeCount: 5, nEnd: 18, bEnd: 'B端 2/5 · 代发 0.2 万人' },
  { id: 'g7', name: '途牛文旅集团', level: '分行级', industry: '文旅平台', branch: '苏州分行', managers: '何经理', eva: 540, revenue: 1250, deposit: 7.8, loan: 6.4, rate: 66, mainOpp: '团体金融代发 3000 人', score: 68, tag: 'B', risk: '正常', founded: '成立 2006 年 · 注册资本 13.5 亿', credit: '我行授信 5 亿（敞口 3 亿）', tags: ['互联网平台', '团金B端', '代发批量'], fpa: 9, nonRate: 18, pocketL: 9, pocketA: 10, homeCount: 4, nEnd: 6, bEnd: 'B端 3/4 · 代发 0.3 万人' },
  { id: 'g8', name: '雨润食品集团', level: '分行级', industry: '大消费', branch: '南京分行', managers: '郑经理', eva: 320, revenue: 1100, deposit: 6.1, loan: 14.2, rate: 52, mainOpp: '风险缓释 / 敞口压降', score: 58, tag: 'C', risk: '预警', founded: '成立 1993 年 · 注册资本 12 亿', credit: '我行敞口 14.2 亿 · 评级下调至 BB', tags: ['风险关注', '敞口压降', '存量续作'], fpa: 7, nonRate: 9, pocketL: 6, pocketA: 8, homeCount: 6, nEnd: 4, bEnd: 'B端 1/6' },
  { id: 'g9', name: '南京大全电气集团', level: '总行级', industry: '智能电网', branch: '南京分行', managers: '刘经理 / 王经理', eva: 2310, revenue: 4800, deposit: 29.6, loan: 24.5, rate: 84, mainOpp: '供应链确权 5 亿', score: 87, tag: 'A', risk: '正常', founded: '成立 1965 年 · 注册资本 15 亿', credit: '我行授信 18 亿（敞口 11 亿）· 同业份额 21%', tags: ['民营龙头', '产业链链主', '供应链1端', '发债主体', '主办行'], fpa: 52, nonRate: 27, pocketL: 20, pocketA: 23, homeCount: 11, nEnd: 47, bEnd: 'B端 7/11 · 代发 0.9 万人' },
  { id: 'g10', name: '江苏交通控股集团', level: '总行级', industry: '数字基建', branch: '南京分行', managers: '陈经理 / 赵经理', eva: 4520, revenue: 8300, deposit: 61.2, loan: 88.6, rate: 90, mainOpp: 'REITs 20 亿', score: 90, tag: 'S', risk: '正常', founded: '成立 1993 年 · 注册资本 168 亿', credit: '我行授信 60 亿（敞口 40 亿）· 同业份额 18%（参团行）', tags: ['省属国企', '发债主体', '司库客户', '绿色金融', '主办行'], fpa: 110, nonRate: 26, pocketL: 17, pocketA: 19, homeCount: 22, nEnd: 15, bEnd: 'B端 16/22 · 代发 3.1 万人' },
  { id: 'g11', name: '扬子江药业集团', level: '总行级', industry: '生物医药', branch: '泰州分行', managers: '孙经理 / 吴经理', eva: 3120, revenue: 6100, deposit: 38.4, loan: 22.7, rate: 86, mainOpp: '募集资金归行 6 亿', score: 88, tag: 'A', risk: '正常', founded: '成立 1971 年 · 注册资本 9.6 亿', credit: '我行授信 22 亿（敞口 13 亿）· 同业份额 20%', tags: ['民营龙头', '司库客户', '代发批量', 'N端待拓'], fpa: 58, nonRate: 25, pocketL: 18, pocketA: 20, homeCount: 8, nEnd: 26, bEnd: 'B端 6/8 · 代发 1.4 万人' },
  { id: 'g12', name: '徐工机械集团', level: '总行级', industry: '先进制造 · 工程机械', branch: '徐州分行', managers: '李经理 / 周经理', eva: 4280, revenue: 7900, deposit: 55.8, loan: 47.3, rate: 89, mainOpp: '跨境人民币池 8 亿', score: 90, tag: 'S', risk: '正常', founded: '成立 1989 年 · 注册资本 71 亿', credit: '我行授信 45 亿（敞口 28 亿）· 同业份额 17%', tags: ['省属国企', '上市公司', '跨境结算', '产业链链主', '发债主体'], fpa: 92, nonRate: 30, pocketL: 16, pocketA: 22, homeCount: 16, nEnd: 72, bEnd: 'B端 10/16 · 代发 1.8 万人' },
  { id: 'g13', name: '恒瑞医药集团', level: '总行级', industry: '生物医药', branch: '连云港分行', managers: '赵经理 / 何经理', eva: 3650, revenue: 6800, deposit: 44.1, loan: 26.4, rate: 87, mainOpp: '定增资金托管 12 亿', score: 89, tag: 'A', risk: '正常', founded: '成立 1970 年 · 注册资本 63.9 亿', credit: '我行授信 25 亿（敞口 14 亿）· 同业份额 19%', tags: ['上市公司', '创新药械', '跨境研发', '司库客户'], fpa: 70, nonRate: 32, pocketL: 21, pocketA: 24, homeCount: 10, nEnd: 19, bEnd: 'B端 7/10 · 代发 1.0 万人' },
  { id: 'g14', name: '沙钢集团', level: '总行级', industry: '先进制造 · 钢铁', branch: '苏州分行', managers: '张经理 / 何经理', eva: 3980, revenue: 7400, deposit: 49.6, loan: 58.9, rate: 83, mainOpp: '银团续作 15 亿', score: 85, tag: 'A', risk: '正常', founded: '成立 1975 年 · 注册资本 45 亿', credit: '我行授信 40 亿（敞口 26 亿）· 同业份额 15%（参团行）', tags: ['民营龙头', '存量续作', '风险关注', '绿色技改'], fpa: 78, nonRate: 21, pocketL: 13, pocketA: 16, homeCount: 14, nEnd: 41, bEnd: 'B端 6/14 · 代发 1.2 万人' },
  { id: 'g15', name: '协鑫科技集团', level: '分行级', industry: '新能源 · 光伏', branch: '苏州分行', managers: '何经理 / 周经理', eva: 1890, revenue: 3600, deposit: 21.5, loan: 27.8, rate: 78, mainOpp: '硅料贸易融资 4 亿', score: 79, tag: 'B', risk: '正常', founded: '成立 2006 年 · 注册资本 70 亿', credit: '我行授信 16 亿（敞口 10 亿）', tags: ['上市公司', '绿色金融', '跨境结算', 'N端待拓'], fpa: 28, nonRate: 23, pocketL: 12, pocketA: 14, homeCount: 9, nEnd: 35, bEnd: 'B端 4/9 · 代发 0.5 万人' },
  { id: 'g16', name: '中天科技集团', level: '分行级', industry: '电子信息 · 线缆', branch: '南通分行', managers: '吴经理 / 郑经理', eva: 1640, revenue: 3200, deposit: 19.8, loan: 17.2, rate: 77, mainOpp: '海缆项目贷 6 亿', score: 77, tag: 'B', risk: '正常', founded: '成立 1992 年 · 注册资本 34 亿', credit: '我行授信 14 亿（敞口 9 亿）', tags: ['上市公司', '产业链链主', '项目制', '属地协同'], fpa: 26, nonRate: 24, pocketL: 13, pocketA: 15, homeCount: 8, nEnd: 29, bEnd: 'B端 5/8 · 代发 0.6 万人' },
  { id: 'g17', name: '波司登集团', level: '分行级', industry: '大消费 · 纺织服装', branch: '常州分行', managers: '郑经理 / 刘经理', eva: 1320, revenue: 2700, deposit: 17.4, loan: 9.5, rate: 75, mainOpp: '品牌供应链金融 3 亿', score: 75, tag: 'B', risk: '正常', founded: '成立 1976 年 · 注册资本 12 亿', credit: '我行授信 9 亿（敞口 5 亿）', tags: ['民营龙头', '供应链1端', '团金B端'], fpa: 20, nonRate: 20, pocketL: 15, pocketA: 14, homeCount: 5, nEnd: 44, bEnd: 'B端 4/5 · 代发 0.8 万人' },
  { id: 'g18', name: '洋河股份集团', level: '分行级', industry: '大消费 · 白酒', branch: '宿迁分行', managers: '孙经理 / 陈经理', eva: 2210, revenue: 4100, deposit: 33.2, loan: 8.6, rate: 82, mainOpp: '大额存单 10 亿', score: 82, tag: 'B', risk: '正常', founded: '成立 2002 年 · 注册资本 15 亿', credit: '我行授信 10 亿（敞口 3 亿）· 存款大户', tags: ['上市公司', '存款大户', '代发批量'], fpa: 38, nonRate: 17, pocketL: 23, pocketA: 12, homeCount: 6, nEnd: 8, bEnd: 'B端 5/6 · 代发 1.6 万人' },
  { id: 'g19', name: '南京浦镇车辆集团', level: '分行级', industry: '轨道交通', branch: '南京分行', managers: '王经理 / 刘经理', eva: 1080, revenue: 2200, deposit: 13.6, loan: 16.8, rate: 73, mainOpp: '城轨项目保函 2 亿', score: 74, tag: 'B', risk: '正常', founded: '成立 1908 年 · 注册资本 8 亿', credit: '我行授信 11 亿（敞口 7 亿）', tags: ['央企二级', '项目制', 'N端待拓'], fpa: 16, nonRate: 22, pocketL: 12, pocketA: 14, homeCount: 6, nEnd: 21, bEnd: 'B端 3/6 · 代发 0.4 万人' },
  { id: 'g20', name: '金陵石化集团', level: '分行级', industry: '石化', branch: '南京分行', managers: '李经理 / 郑经理', eva: 890, revenue: 2300, deposit: 12.8, loan: 19.5, rate: 68, mainOpp: '装置检修银团 5 亿', score: 69, tag: 'C', risk: '正常', founded: '成立 1982 年 · 注册资本 25 亿', credit: '我行授信 15 亿（敞口 10 亿）', tags: ['央企二级', '存量续作', '绿色技改'], fpa: 15, nonRate: 15, pocketL: 10, pocketA: 12, homeCount: 5, nEnd: 9, bEnd: 'B端 2/5' },
];

export const OPPORTUNITIES: Opportunity[] = [
  { id: 'o1', title: '南钢 12 亿流贷 12 月到期', group: '南京钢铁集团', groupId: 'g1', category: '资产业务', stage: '需求确认', priority: '高', amount: '12 亿', owner: '张经理', update: '10-28 授信方案已报', created: '10-08', due: '12-20', daysLeft: 50, progress: 30, isNew: false, source: '存量到期', contact: '财务总监', nextStep: '授信方案上会 · 确认提款节奏' },
  { id: 'o1b', title: '南钢转炉升级银团 12 亿', group: '南京钢铁集团', groupId: 'g1', category: '资产业务', stage: '协同中', priority: '高', amount: '12 亿', owner: '张经理 / 周经理', update: '10-25 无锡属地已承接', created: '10-25', due: '12-31', daysLeft: 61, progress: 65, isNew: true },
  { id: 'o1c', title: '南钢 N 端 3 家汽配套件开户', group: '南京钢铁集团', groupId: 'g1', category: '产业链', stage: '待转介', priority: '中', amount: '潜力 2 亿', owner: '李经理', update: '10-20 名单已确权', created: '10-20', due: '11-30', daysLeft: 30, progress: 20, isNew: true },
  { id: 'o2', title: '先声 8.6 亿募集资金转入', group: '先声药业集团', groupId: 'g3', category: '存款引流', stage: '已触达', priority: '高', amount: '8.6 亿', owner: '赵经理', update: '10-27 董秘确认 11 月归行', created: '09-28', due: '11-15', daysLeft: 15, progress: 70, isNew: false },
  { id: 'o2b', title: '先声 CBS / 司库招标', group: '先声药业集团', groupId: 'g3', category: '非公开', stage: '陪标中', priority: '高', amount: '—', owner: '赵经理 / 钱经理', update: '10-26 陪标材料已提交', created: '10-12', due: '11-25', daysLeft: 25, progress: 55, isNew: false },
  { id: 'o3', title: '南瑞兄弟行 10 亿中票', group: '国电南瑞集团', groupId: 'g2', category: '公开市场', stage: '协同中', priority: '高', amount: '10 亿', owner: '王经理 / 赵经理', update: '10-24 北京分行已对接财司', created: '10-10', due: '11-30', daysLeft: 30, progress: 48, isNew: false },
  { id: 'o3b', title: '南瑞储能项目贷 6 亿', group: '国电南瑞集团', groupId: 'g2', category: '资产业务', stage: '尽调中', priority: '中', amount: '6 亿', owner: '王经理', update: '10-22 可研已收', created: '10-22', due: '12-15', daysLeft: 45, progress: 35, isNew: true },
  { id: 'o6', title: '苏交科 ABS 5 亿', group: '苏交科集团', groupId: 'g5', category: '资产业务', stage: '尽调中', priority: '中', amount: '5 亿', owner: '周经理 / 孙经理', update: '10-21 杭州项目已尽调', created: '09-30', due: '12-10', daysLeft: 40, progress: 40, isNew: false },
  { id: 'o6b', title: '苏交科数字基建项目贷 4 亿', group: '苏交科集团', groupId: 'g5', category: '资产业务', stage: '待营销', priority: '中', amount: '4 亿', owner: '周经理', update: '10-18 方案编制中', created: '10-18', due: '12-20', daysLeft: 50, progress: 15, isNew: true },
  { id: 'o7', title: '熊猫 N 端 6 户批量开户', group: '熊猫电子集团', groupId: 'g4', category: '产业链', stage: '待营销', priority: '中', amount: '潜力 1.5 亿', owner: '刘经理', update: '10-19 名单已下发', created: '10-19', due: '11-30', daysLeft: 30, progress: 25, isNew: true },
  { id: 'o8', title: '大全确权链 5 亿 + 中票 6 亿', group: '南京大全电气集团', groupId: 'g9', category: '公开市场', stage: '协同中', priority: '高', amount: '11 亿', owner: '刘经理', update: '10-25 方案已立项', created: '10-08', due: '12-05', daysLeft: 35, progress: 60, isNew: false },
  { id: 'o9', title: '交控 REITs 20 亿 + 司库', group: '江苏交通控股集团', groupId: 'g10', category: '公开市场', stage: '尽调中', priority: '高', amount: '20 亿', owner: '陈经理', update: '10-23 总对总已立项', created: '09-25', due: '12-31', daysLeft: 61, progress: 42, isNew: false },
  { id: 'o10', title: '扬子江 6 亿回款 + 代发', group: '扬子江药业集团', groupId: 'g11', category: '存款引流', stage: '已触达', priority: '高', amount: '6 亿', owner: '孙经理', update: '10-24 财务已确认', created: '10-15', due: '11-20', daysLeft: 20, progress: 66, isNew: false },
  { id: 'o11', title: '徐工跨境人民币池 8 亿', group: '徐工机械集团', groupId: 'g12', category: '非公开', stage: '协同中', priority: '高', amount: '8 亿', owner: '李经理', update: '10-22 跨境方案已报', created: '10-05', due: '11-30', daysLeft: 30, progress: 58, isNew: false },
  { id: 'o12', title: '恒瑞定增托管 12 亿', group: '恒瑞医药集团', groupId: 'g13', category: '公开市场', stage: '待营销', priority: '高', amount: '12 亿', owner: '赵经理', update: '10-21 董秘已触达', created: '10-21', due: '12-25', daysLeft: 55, progress: 18, isNew: true },
  { id: 'o12b', title: '恒瑞 1.1 万人代发升级 + 高管私行签约 200 人', group: '恒瑞医药集团', groupId: 'g13', category: '公私联动', stage: '执行中', priority: '高', amount: '代发 1.1 万人 / 私行 200 人', owner: '赵经理（对公） / 沈经理（私行）', update: '10-29 已进场宣讲 3 场 · 私行开户 68 户', created: '10-12', due: '11-30', daysLeft: 30, progress: 62, isNew: true },
  { id: 'o12c', title: '恒瑞实控人家族信托 5 亿 + 慈善信托', group: '恒瑞医药集团', groupId: 'g13', category: '公私联动', stage: '尽调中', priority: '高', amount: '5 亿', owner: '沈经理（私行） / 赵经理（对公协同）', update: '10-27 实控人已面谈 · 架构方案比选中', created: '10-18', due: '12-20', daysLeft: 50, progress: 40, isNew: true },
  { id: 'o12d', title: '恒瑞核心高管财富管理 8000 万 + 员工持股资管', group: '恒瑞医药集团', groupId: 'g13', category: '公私联动', stage: '已触达', priority: '中', amount: '8000 万', owner: '沈经理（私行）', update: '10-26 高管沙龙 40 人 · 意向 2300 万', created: '10-26', due: '12-10', daysLeft: 40, progress: 35, isNew: false },
  { id: 'o13', title: '沙钢银团续作 15 亿', group: '沙钢集团', groupId: 'g14', category: '资产业务', stage: '尽调中', priority: '高', amount: '15 亿', owner: '张经理', update: '10-20 风险预审中', created: '10-11', due: '12-18', daysLeft: 48, progress: 33, isNew: false },
  { id: 'o14', title: '协鑫硅料贸易融资 4 亿', group: '协鑫科技集团', groupId: 'g15', category: '资产业务', stage: '待营销', priority: '中', amount: '4 亿', owner: '何经理', update: '10-18 额度测算中', created: '10-18', due: '12-12', daysLeft: 42, progress: 12, isNew: true },
  { id: 'o15', title: '中天海缆项目贷 6 亿', group: '中天科技集团', groupId: 'g16', category: '资产业务', stage: '尽调中', priority: '中', amount: '6 亿', owner: '吴经理', update: '10-17 可研评审中', created: '10-09', due: '12-08', daysLeft: 38, progress: 38, isNew: false },
  { id: 'o16', title: '途牛代发 3000 人 + B端', group: '途牛文旅集团', groupId: 'g7', category: '非公开', stage: '执行中', priority: '中', amount: '3000 人', owner: '何经理', update: '10-28 已开 1200 户', created: '09-20', due: '11-30', daysLeft: 30, progress: 58, isNew: false },
  { id: 'o17', title: '洋河大额存单 10 亿', group: '洋河股份集团', groupId: 'g18', category: '存款引流', stage: '已触达', priority: '高', amount: '10 亿', owner: '孙经理', update: '10-26 财务已确认', created: '10-16', due: '11-18', daysLeft: 18, progress: 72, isNew: false },
  { id: 'o18', title: '康尼跨境资金池 3 亿', group: '康尼机电集团', groupId: 'g6', category: '非公开', stage: '待营销', priority: '中', amount: '3 亿', owner: '吴经理', update: '10-15 方案编制中', created: '10-15', due: '12-22', daysLeft: 52, progress: 10, isNew: true },
  { id: 'o19', title: '南钢存量续作 8 亿（已放款）', group: '南京钢铁集团', groupId: 'g1', category: '资产业务', stage: '已达成', priority: '高', amount: '8 亿', owner: '张经理', update: '10-12 已放款 · 归行率100%', created: '08-20', due: '10-12', daysLeft: 0, progress: 100, isNew: false, source: '存量到期', contact: '财务总监', nextStep: '贷后归行回检', winReason: '主办行份额优先 + 定价LPR-10bp + 抵押足值' },
  { id: 'o20', title: '南瑞海外EPC保函 2 亿（丢单）', group: '国电南瑞集团', groupId: 'g2', category: '非公开', stage: '已失败', priority: '中', amount: '2 亿', owner: '王经理', update: '10-08 客户选择国有大行', created: '08-15', due: '10-08', daysLeft: 0, progress: 0, isNew: false, source: '拜访挖掘', contact: '董秘', nextStep: '复盘 · 3个月后再触达', lossReason: '授信额度不足 + 境外行无代理行优势' },
];

/** 关键人库（联系方式脱敏 + 贡献积分 + 审批状态） */
export const KEY_PERSONS: Record<string, KeyPerson[]> = {
  g1: [
    { id: 'k11', name: '陈董', post: '董事长', dept: '集团', phone: '138****8821', masked: '138****8821', coverage: '年度互访', contributor: '张经理 +20', points: 20, approved: '已公开' },
    { id: 'k12', name: '李总', post: '总经理', dept: '集团', phone: '139****6654', masked: '139****6654', coverage: '季度触达', contributor: '李经理 +15', points: 15, approved: '已公开' },
    { id: 'k13', name: '王总', post: '财务总监', dept: '财务部', phone: '137****3302', masked: '137****3302', coverage: '月度触达 · 司库对接', contributor: '张经理 +25', points: 25, approved: '已公开' },
    { id: 'k14', name: '赵董秘', post: '董秘', dept: '董事会', phone: '136****9918', masked: '136****9918', coverage: '资本运作 · 中票窗口', contributor: '李经理 +18', points: 18, approved: '待审批' },
    { id: 'k15', name: '刘总', post: '采购总监', dept: '采购中心', phone: '—', masked: '待补充', coverage: 'N端确权对接人待补', contributor: '—', points: 0, approved: '未收录' },
  ],
  g13: [
    { id: 'k131', name: '孙董', post: '董事长 / 实控人', dept: '集团', phone: '139****6688', masked: '139****6688', coverage: '年度互访 · 家族信托面谈', contributor: '赵经理 +20', points: 20, approved: '已公开' },
    { id: 'k132', name: '张总', post: '总经理', dept: '集团', phone: '138****7766', masked: '138****7766', coverage: '季度触达 · 定增托管', contributor: '赵经理 +15', points: 15, approved: '已公开' },
    { id: 'k133', name: '戴总', post: '财务总监', dept: '财务部', phone: '137****9901', masked: '137****9901', coverage: '月度触达 · 代发升级对接', contributor: '沈经理 +25', points: 25, approved: '已公开' },
    { id: 'k134', name: '刘董秘', post: '董秘', dept: '董事会', phone: '136****2210', masked: '136****2210', coverage: '资本运作 · 员工持股', contributor: '赵经理 +18', points: 18, approved: '已公开' },
    { id: 'k135', name: '陈夫人', post: '实控人家族成员', dept: '家族', phone: '—', masked: '待补充', coverage: '私行签约待触达', contributor: '沈经理 +0', points: 0, approved: '未收录' },
  ],
};

/** 默认关键人（其余集团复用模板，按集团名替换） */
export function keyPersonsOf(gid: string, gname: string): KeyPerson[] {
  if (KEY_PERSONS[gid]) return KEY_PERSONS[gid];
  return [
    { id: `${gid}-1`, name: '董事长', post: '董事长', dept: '集团', phone: '138****0001', masked: '138****0001', coverage: '年度互访', contributor: '管户经理 +15', points: 15, approved: '已公开' },
    { id: `${gid}-2`, name: '财务负责人', post: '财务总监', dept: '财务部', phone: '139****0002', masked: '139****0002', coverage: gname.includes('药') || gname.includes('瑞') ? '司库对接 · 月度触达' : '月度触达', contributor: '管户经理 +20', points: 20, approved: '已公开' },
    { id: `${gid}-3`, name: '董秘', post: '董秘', dept: '董事会', phone: '136****0003', masked: '136****0003', coverage: '资本运作', contributor: '管户经理 +12', points: 12, approved: '待审批' },
  ];
}

/** 股权穿透：持股比例（演示用确定性算法，保证图谱与列表一致） */
export const EQUITY_SHARES = [100, 100, 82.4, 68.5, 51.0, 44.6, 35.2, 28.7, 62.3, 75.8, 58.9, 41.3];
export interface EquityNode { name: string; share: number; tier: string; open: string; credit: string; loan: string; parent: string }
export function equityOf(g: Group): EquityNode[] {
  const short = g.name.replace('集团', '');
  const n = Math.min(g.homeCount, 9);
  return Array.from({ length: n }, (_, i) => {
    const share = EQUITY_SHARES[i % EQUITY_SHARES.length];
    return {
      name: `${short}子0${i + 1}`,
      share,
      tier: i < 2 ? '核心上市主体' : i < 5 ? '一级控股' : '参股/二级',
      open: i < Math.ceil(n * 0.9) ? '已开户' : '未开户',
      credit: i < 6 ? '已建额' : '未建额',
      loan: `${(3 + i * 1.2).toFixed(1)} 亿`,
      parent: i < Math.ceil(n / 2) ? '上市核心主体' : '财务/销售/研发板块',
    };
  });
}

/** 经营合作：经营动作台账（动作 → 实绩结果，可追溯到商机） */
export function bizActionsOf(g: Group): Array<{ date: string; act: string; kind: string; owner: string; result: string; opp: string }> {
  const mgr = g.managers.split(' / ')[0] ?? '管户经理';
  return [
    { date: '10-26', act: '司库归集 + 募集资金归行', kind: '存款组织', owner: mgr, result: `存款日均 +${(g.deposit * 0.06).toFixed(1)} 亿 · FPA +${(g.fpa * 0.05).toFixed(1)} 亿`, opp: '已关联商机 · 资金11-15归行' },
    { date: '10-18', act: '供应链确权放款（1端直贷）', kind: '贷款投放', owner: mgr, result: `供应链投放 +${(g.loan * 0.05).toFixed(1)} 亿 · N端确权 ${Math.ceil(g.nEnd * 0.2)} 户`, opp: '已关联商机 · 确权链推进中' },
    { date: '09-28', act: '中票/银团承销发行', kind: '投行承销', owner: '投行部协同', result: `承销落地 8 亿 · 中收 320 万`, opp: '已落地 · 计入非息' },
    { date: '10-12', act: 'N端白名单批量开户 + 团金进场', kind: '生态获客', owner: `${g.branch}属地`, result: `N端开户 ${Math.ceil(g.nEnd * 0.12)} 户 · B端代发 +${(g.nEnd * 12).toFixed(0)} 人`, opp: '已转线索 · 属地跟进' },
  ];
}

/** 规划执行：一户一策任务台账（目标 → 关键动作 → 已落地实绩） */
export function planTasksOf(g: Group): Array<{ task: string; target: string; owner: string; act: string; done: string; p: number; next: string }> {
  return [
    { task: '核心主体存款/非息', target: `+${(g.deposit * 0.1).toFixed(1)} 亿 / 800 万`, owner: `${g.managers.split(' / ')[0]} · 交易银行`, act: '司库招标 + 发债联动，已陪标2轮', done: `已落地 +${(g.deposit * 0.06).toFixed(1)} 亿 / 320 万`, p: 82, next: '11-15资金归行后结项' },
    { task: '供应链1端贷款', target: `+${(g.loan * 0.08).toFixed(1)} 亿供应链`, owner: `${g.managers.split(' / ')[1] ?? g.managers} · 属地行`, act: '1端确权+N端破冰，已确权资料回收', done: `已投放 +${(g.loan * 0.05).toFixed(1)} 亿`, p: 64, next: '11-30前再确权2户' },
    { task: '新业务线（投行/跨境）', target: '+3 亿 / 非息500万', owner: '投行部 · 跨境团队', act: '项目制+铁三角，已立项进尽调', done: '已承销报备 · 尚未放款', p: 58, next: '12月发行窗口' },
  ];
}

/** 往来记录：每次经营活动 → 产生的结果 */
export function visitLogsOf(g: Group): Array<{ when: string; act: string; result: string }> {
  return [
    { when: '10-26', act: `拜访财务总监 · 确认司库11月挂标（${g.managers.split(' / ')[0]}）`, result: '形成商机：资金归行+司库招标 · 纪要48h已上传' },
    { when: '09-30', act: '拜访董秘/战投总监 · 中票10亿窗口', result: '已发起跨部门协同 · 投行部立项，计入规划任务3' },
    { when: '09-12', act: `属地行陪访N端2户 · 确权资料回收`, result: `N端开户+2户 · 贷款意向${(g.loan * 0.02).toFixed(1)}亿` },
  ];
}

/** 风险处置：风险点 → 处置动作 → 责任人时限 → 进展结果 */
export function riskRowsOf(g: Group): Array<{ k: string; act: string; owner: string; ddl: string; p: number; res: string }> {
  if (g.risk === '预警') {
    return [
      { k: '评级下调至BB', act: '敞口压降 · 只收不放', owner: '风险部 · 管户', ddl: '12-31', p: 55, res: '已压降1.8亿 · 逐月回检' },
      { k: '存货周转放缓', act: '货押+保险 · 周转≤90天', owner: '授信审批部', ddl: '11-30', p: 70, res: '已办妥货押 · 在途监测正常' },
    ];
  }
  return [
    { k: '行业周期波动', act: '品种结构优化+套保', owner: '管户 · 资金营运', ddl: '持续', p: 80, res: '套保覆盖率60% · 敞口可控' },
    { k: '预付规模较大', act: '信用证+货押，敞口逐月回检', owner: '管户 · 运营', ddl: '11-30', p: 75, res: '回款归行比82% · 符合条件' },
  ];
}
export function scoreTrendOf(score: number): number[] {
  return [score - 8, score - 6, score - 5, score - 3, score - 1, score];
}
export function scorePartsOf(score: number, tag: string): Array<{ item: string; w: string; v: number; full: number; got: string }> {
  const adj = tag === 'S' ? 0 : tag === 'A' ? -2 : tag === 'B' ? -5 : -9;
  const rows = [
    { item: '盈利贡献', w: '35%', base: score + 2 },
    { item: '规模份额', w: '25%', base: score - 1 },
    { item: '综合化', w: '20%', base: score - 4 },
    { item: '客群生态', w: '20%', base: score - 2 },
  ];
  return rows.map((r) => ({ item: r.item, w: r.w, v: Math.max(40, Math.min(100, Math.round(r.base + adj * 0.3))), full: 100, got: `${Math.max(0, Math.round(((r.base + adj * 0.3) / 100) * (r.w === '35%' ? 35 : r.w === '25%' ? 25 : 20)))}分` }));
}

export const APPR_ITEMS: ApprItem[] = [
  { id: 'a1', kind: '名单调入', from: '南京分行 · 刘经理', summary: '南京大全电气集团调入总行级', waiting: '1 天', state: '待办' },
  { id: 'a2', kind: '定价审批', from: '张经理', summary: '南钢 12 亿流贷 LPR-15bp', waiting: '2 天', state: '待办' },
  { id: 'a3', kind: '权益派发', from: '南京分行', summary: '南钢董秘年度论坛席位', waiting: '3 天', state: '待办' },
  { id: 'a4', kind: '分润仲裁', from: '苏州分行', summary: '途牛代发分润争议', waiting: '4 天', state: '待办' },
  { id: 'a5', kind: '名单调出', from: '南京分行', summary: 'XX 商贸（注销）调出分行级', waiting: '5 天', state: '待办' },
];

export const BRANCH_RANK = [
  { name: '南京分行', score: 96 },
  { name: '苏州分行', score: 88 },
  { name: '无锡分行', score: 81 },
  { name: '常州分行', score: 74 },
  { name: '南通分行', score: 69 },
];

/** 战略引领层：年度战略解码（对接“十五五”与差异化/数智化转型） */
export const STRATEGY_THEMES = [
  { title: '做强主办银行', desc: '总行级集团主办行覆盖率 → 85%，口袋份额提升 2pct', progress: 72 },
  { title: '做深三环两链', desc: 'N 端新增 200 户 · 团金 B 端覆盖 80%', progress: 64 },
  { title: '做优价值分层', desc: 'S/A 客户营收占比 → 70%，C 类压降 10%', progress: 58 },
];

export const STRATEGY_GOALS = [
  { name: 'EVA', target: 8.0, actual: 6.8, unit: '亿' },
  { name: '战客营收', target: 90, actual: 76, unit: '亿' },
  { name: '核心存款日均', target: 700, actual: 612, unit: '亿' },
  { name: '一般性贷款', target: 500, actual: 438, unit: '亿' },
];

/** 行业赛道前瞻布局：覆盖度 vs 潜力 vs 建议动作 */
export const TRACKS = [
  { industry: '智能电网', households: 12, share: 28, potential: '高', penetration: 62, advice: '新增 2 户（南瑞链属）', tag: '压舱石' },
  { industry: '生物医药', households: 9, share: 21, potential: '高', penetration: 48, advice: '新增 3 户（创新药械）', tag: '进攻' },
  { industry: '新能源汽车零部件', households: 6, share: 12, potential: '高', penetration: 35, advice: '新增 4 户（拓面）', tag: '进攻' },
  { industry: '数字基建', households: 11, share: 24, potential: '中', penetration: 55, advice: '保持，促 ABS 落地', tag: '巩固' },
  { industry: '钢铁冶化', households: 8, share: 18, potential: '低', penetration: 81, advice: '优化结构，压降 C 类', tag: '调优' },
  { industry: '文旅平台', households: 4, share: 8, potential: '低', penetration: 44, advice: '维持团金，不新增授信', tag: '观察' },
];

/** 全行协同网络：主办 → 属地合约金额（亿） */
export const COOP_NETWORK = {
  nodes: ['总行战客部', '南京分行', '苏州分行', '无锡分行', '常州分行', '资金营运中心', '投资银行部'],
  links: [
    { from: '总行战客部', to: '南京分行', v: 12.6 },
    { from: '总行战客部', to: '苏州分行', v: 4.2 },
    { from: '南京分行', to: '无锡分行', v: 2.1 },
    { from: '南京分行', to: '常州分行', v: 1.4 },
    { from: '总行战客部', to: '投资银行部', v: 10.0 },
    { from: '总行战客部', to: '资金营运中心', v: 8.0 },
    { from: '苏州分行', to: '南京分行', v: 0.8 },
  ],
};

/** 前瞻预测：营收实际 + 预测（亿） */
export const FORECAST = {
  months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月E', '12月E'],
  actual: [52, 55, 58, 61, 64, 68, 70, 72, 74, 76, null, null],
  forecast: [null, null, null, null, null, null, null, null, null, 76, 81, 86],
};

/** 行业授信投向指引与额度执行：行内真实形态（政策 + 额度台账） */
export const INDUSTRY_POLICY = [
  { industry: '智能电网及装备', guide: '大力拓展', limit: 120, used: 74, bad: 0.21, policy: '优先保障授信规模，配套中票承销与供应链额度', id: 'IP01' },
  { industry: '生物医药', guide: '大力拓展', limit: 90, used: 48, bad: 0.35, policy: '创新药械择优准入，配套司库与跨境额度', id: 'IP02' },
  { industry: '新能源汽车零部件', guide: '择优支持', limit: 80, used: 33, bad: 0.42, policy: '头部链主白名单制，N 端批量授信', id: 'IP03' },
  { industry: '数字基建', guide: '择优支持', limit: 100, used: 62, bad: 0.55, policy: 'ABS/项目贷为主，关注回款', id: 'IP04' },
  { industry: '钢铁冶化', guide: '维持压缩', limit: 150, used: 132, bad: 1.12, policy: '存量续作、只减不增，C 类逐步压降', id: 'IP05' },
  { industry: '商贸及弱质文旅', guide: '压缩退出', limit: 40, used: 36, bad: 2.31, policy: '不再新增授信，敞口到期压降', id: 'IP06' },
];

/** 全行级 / 分行级重大项目督办：高层关注 + 部门协同 + 未决事项随清随结 */
export const MAJOR_PROJECTS = [
  {
    id: 'mp1', proj: '南钢转炉升级银团 12 亿', group: '南京钢铁集团', groupId: 'g1', level: '总行级',
    amount: '12 亿', field: '银团贷款', attention: '行长督办',
    lead: '南京分行 · 张经理', coop: ['无锡分行 · 周经理', '投资银行部', '授信审批部', '资金营运中心'],
    progress: 65, state: '执行中', ddl: '12-31', daysLeft: 61,
    miles: [{ n: '银团结构获批', done: true }, { n: '份额确认 8/12 亿', done: true }, { n: '提款放款', done: false }, { n: '贷后归行', done: false }],
    pendings: [
      { item: '剩余 4 亿份额确认（城商组团）', owner: '投资银行部 · 承销处', ddl: '11-15', st: '办理中' },
      { item: 'LPR-15bp 定价终审', owner: '资金营运中心', ddl: '11-18', st: '办理中' },
      { item: '抵押登记办妥', owner: '南京分行 · 李经理', ddl: '11-10', st: '已办结' },
    ],
  },
  {
    id: 'mp2', proj: '南瑞 10 亿中票承销发行', group: '国电南瑞集团', groupId: 'g2', level: '总行级',
    amount: '10 亿', field: '投行承销', attention: '董事长关注',
    lead: '南京分行 · 王经理', coop: ['北京分行 · 赵经理', '投资银行部', '资金营运中心', '金融科技部'],
    progress: 48, state: '执行中', ddl: '11-30', daysLeft: 30,
    miles: [{ n: '总对总立项', done: true }, { n: '发行材料报备', done: true }, { n: '簿记发行', done: false }, { n: '资金归行', done: false }],
    pendings: [
      { item: '集团财司发行窗口最终确认', owner: '北京分行 · 赵经理', ddl: '11-08', st: '逾期' },
      { item: '线上簿记系统联调', owner: '金融科技部', ddl: '11-12', st: '办理中' },
    ],
  },
  {
    id: 'mp3', proj: '先声 8.6 亿回款 + 司库招标', group: '先声药业集团', groupId: 'g3', level: '总行级',
    amount: '8.6 亿', field: '司库 + 存款', attention: '分管副行长督办',
    lead: '南京分行 · 赵经理', coop: ['上海分行 · 钱经理', '交易银行部', '运营管理部'],
    progress: 72, state: '执行中', ddl: '11-15', daysLeft: 15,
    miles: [{ n: '陪标方案提交', done: true }, { n: 'CBS 联调', done: true }, { n: '资金归行', done: false }, { n: '司库挂标', done: false }],
    pendings: [
      { item: '8.6 亿募集资金归行（最后一笔 3 亿）', owner: '南京分行 · 赵经理', ddl: '11-15', st: '办理中' },
      { item: '银企直开户极速通道', owner: '运营管理部', ddl: '11-06', st: '已办结' },
    ],
  },
  {
    id: 'mp4', proj: '交控 REITs 20 亿 + 司库体系', group: '江苏交通控股集团', groupId: 'g10', level: '总行级',
    amount: '20 亿', field: 'REITs + 司库', attention: '行长督办',
    lead: '南京分行 · 陈经理', coop: ['投资银行部', '托管部', '风险管理部'],
    progress: 42, state: '尽调中', ddl: '12-31', daysLeft: 61,
    miles: [{ n: '总对总立项', done: true }, { n: '底层资产尽调', done: false }, { n: '交易所申报', done: false }, { n: '发行 + 托管', done: false }],
    pendings: [
      { item: '底层高速收费权数据确权', owner: '投资银行部', ddl: '11-20', st: '办理中' },
      { item: '托管专户开立', owner: '托管部', ddl: '11-25', st: '待启动' },
    ],
  },
  {
    id: 'mp5', proj: '恒瑞公私联动 6.1 亿（代发 + 信托 + 财富）', group: '恒瑞医药集团', groupId: 'g13', level: '总行级',
    amount: '6.1 亿', field: '公私联动', attention: '分管副行长督办',
    lead: '南京分行 · 赵经理（对公）', coop: ['私行中心 · 沈经理', '零售部', '连云港分行'],
    progress: 55, state: '执行中', ddl: '12-20', daysLeft: 50,
    miles: [{ n: '1.1 万人代发进场', done: true }, { n: '私行签约 68/200 户', done: false }, { n: '家族信托落地', done: false }, { n: '高管财富配置', done: false }],
    pendings: [
      { item: '剩余 7 场子公司宣讲排期', owner: '零售部 · 团金处', ddl: '11-18', st: '办理中' },
      { item: '家族信托架构终稿确认', owner: '私行中心 · 沈经理', ddl: '11-22', st: '办理中' },
    ],
  },
  {
    id: 'mp6', proj: '徐工跨境人民币池 8 亿', group: '徐工机械集团', groupId: 'g12', level: '总行级',
    amount: '8 亿', field: '跨境结算', attention: '常规督办',
    lead: '徐州分行 · 李经理', coop: ['国际业务部', '上海分行'],
    progress: 58, state: '执行中', ddl: '11-30', daysLeft: 30,
    miles: [{ n: '跨境方案获批', done: true }, { n: '主办账户开立', done: true }, { n: '额度切分上线', done: false }],
    pendings: [{ item: '外管备案回执', owner: '国际业务部', ddl: '11-12', st: '办理中' }],
  },
  {
    id: 'mp7', proj: '苏交科 ABS 5 亿', group: '苏交科集团', groupId: 'g5', level: '分行级',
    amount: '5 亿', field: '资产证券化', attention: '分行行长督办',
    lead: '无锡分行 · 周经理', coop: ['杭州分行 · 孙经理', '投资银行部'],
    progress: 35, state: '尽调中', ddl: '12-10', daysLeft: 40,
    miles: [{ n: '基础资产尽调', done: true }, { n: '增信评审', done: false }, { n: '发行', done: false }],
    pendings: [
      { item: '增信评审会排期', owner: '风险管理部', ddl: '11-14', st: '办理中' },
      { item: '杭州项目回款数据补正', owner: '杭州分行 · 孙经理', ddl: '11-09', st: '逾期' },
    ],
  },
  {
    id: 'mp8', proj: '途牛团金代发 3000 人', group: '途牛文旅集团', groupId: 'g7', level: '分行级',
    amount: '3000 人', field: '团金 B 端', attention: '常规督办',
    lead: '苏州分行 · 何经理', coop: ['零售部', '手机银行部', '运营管理部'],
    progress: 58, state: '执行中', ddl: '11-30', daysLeft: 30,
    miles: [{ n: '批量开卡 1200 户', done: true }, { n: '场景嵌入发薪', done: false }, { n: 'B端转化', done: false }],
    pendings: [{ item: '剩余 1800 人分批开卡', owner: '运营管理部', ddl: '11-25', st: '办理中' }],
  },
];
export const GAP_TASKS = [
  { gap: '营收缺口 4 亿', need: '需新增商机 ≥6 亿', task: '南瑞中票 10 亿发行 + 南钢银团 12 亿提款', owner: '南京分行 · 张经理', ddl: '11-30', state: '已派发' },
  { gap: '商机转化率 34%→40%', need: '提升 6pct', task: '南钢 N 端 3 户转介无锡分行落地', owner: '无锡分行 · 周经理', ddl: '11-20', state: '待承接' },
  { gap: '1+10 达成率 78%→85%', need: '提升 7pct', task: '先声司库招标陪标 + 8.6 亿资金归行', owner: '南京分行 · 赵经理', ddl: '11-15', state: '执行中' },
];
export const RESOURCES = [
  { name: '南京分行', quota: 200, used: 168, pricing: 82, team: 24 },
  { name: '苏州分行', quota: 120, used: 88, pricing: 65, team: 14 },
  { name: '无锡分行', quota: 100, used: 71, pricing: 58, team: 12 },
  { name: '常州分行', quota: 80, used: 52, pricing: 70, team: 9 },
];

/** 协同地图 · 省内全境 + 京沪杭异地（示意坐标，用于地图式展现） */
export const BRANCH_GEO = [
  { name: '南京分行', x: 118.8, y: 32.1, coop: 12.6, scope: '省内·主办中心' },
  { name: '苏州分行', x: 120.6, y: 31.3, coop: 4.2, scope: '省内' },
  { name: '无锡分行', x: 120.3, y: 31.6, coop: 2.1, scope: '省内' },
  { name: '常州分行', x: 119.9, y: 31.8, coop: 1.4, scope: '省内' },
  { name: '南通分行', x: 120.9, y: 32.0, coop: 0.9, scope: '省内' },
  { name: '徐州分行', x: 117.3, y: 34.2, coop: 0.6, scope: '省内·苏北' },
  { name: '扬州分行', x: 119.4, y: 32.4, coop: 0.7, scope: '省内' },
  { name: '盐城分行', x: 120.2, y: 33.3, coop: 0.5, scope: '省内·苏北' },
  { name: '镇江分行', x: 119.4, y: 32.2, coop: 0.6, scope: '省内' },
  { name: '泰州分行', x: 119.9, y: 32.5, coop: 0.5, scope: '省内' },
  { name: '淮安分行', x: 119.0, y: 33.6, coop: 0.4, scope: '省内·苏北' },
  { name: '连云港分行', x: 119.2, y: 34.6, coop: 0.3, scope: '省内·苏北' },
  { name: '宿迁分行', x: 118.3, y: 33.9, coop: 0.3, scope: '省内·苏北' },
  { name: '北京分行', x: 116.4, y: 39.9, coop: 3.1, scope: '异地·集团财司' },
  { name: '上海分行', x: 121.5, y: 31.2, coop: 2.4, scope: '异地·研发/资本' },
  { name: '杭州分行', x: 120.2, y: 30.3, coop: 1.1, scope: '异地·项目属地' },
];

/**
 * 协同调度 · 商机项目制（总分行 + 跨条线）
 */
export const COOP_PROJECTS = [
  { proj: '南钢转炉升级银团 12 亿', group: '南京钢铁集团', lead: '南京分行 · 张经理', coop: '无锡分行 · 周经理', coe: '战客部牵头方案 · 投行部银团结构设计', sdc: '授信审批部绿色通道 · 资金营运中心定价', progress: 65, state: '执行中' },
  { proj: '南瑞 10 亿中票承销', group: '国电南瑞集团', lead: '南京分行 · 王经理', coop: '北京分行 · 赵经理', coe: '投行部主承销 · 战客部总对总立项', sdc: '资金营运中心做市 · 科技部线上簿记', progress: 48, state: '执行中' },
  { proj: '先声 8.6 亿回款 + 司库招标', group: '先声药业集团', lead: '南京分行 · 赵经理', coop: '上海分行 · 钱经理', coe: '交易银行部CBS方案 · 战客部陪标', sdc: '科技部银企直连 · 运营部账户极速开立', progress: 72, state: '执行中' },
  { proj: '苏交科 ABS 5 亿', group: '苏交科集团', lead: '无锡分行 · 周经理', coop: '杭州分行 · 孙经理', coe: '投行部产品设计 · 战客部跨区调配', sdc: '风险管理部增信评审 · 托管部发行支持', progress: 35, state: '尽调中' },
  { proj: '途牛团金代发 3000 人', group: '途牛文旅集团', lead: '苏州分行 · 何经理', coop: '南京分行 + 上海分行', coe: '零售部团金方案 · 战客部B端督导', sdc: '运营部批量开卡 · 手机银行部场景', progress: 58, state: '执行中' },
];

/**
 * 经营实绩 · 六维指标体系
 * 口径来源：Z=招行《一户一策指引/评分卡》，X=行方需求13-18
 * 避免“唯存贷论”，以价值创造为牵引、份额质量协同并重
 */
export const PERF_SYSTEM = [
  {
    dim: '价值创造', color: '#b01f24',
    metrics: [
      { name: 'EVA', actual: 6.8, target: 8.0, unit: '亿', yoy: '+11.2%', src: 'X13·价值牵引' },
      { name: '营业净收入', actual: 76, target: 90, unit: '亿', yoy: '+9.4%', src: 'Z规划书KPI' },
      { name: '非息收入占比', actual: 28.6, target: 32, unit: '%', yoy: '+1.8pct', src: 'Z非息净收入' },
      { name: 'RAROC', actual: 14.2, target: 15, unit: '%', yoy: '+0.6pct', src: '价值引导' },
    ],
  },
  {
    dim: '规模与份额', color: '#2456a6',
    metrics: [
      { name: '核心存款日均', actual: 612, target: 700, unit: '亿', yoy: '+6.4%', src: 'Z·X13' },
      { name: '一般性对公贷款', actual: 438, target: 500, unit: '亿', yoy: '+7.9%', src: 'Z·X13' },
      { name: 'FPA 月均余额', actual: 520, target: 600, unit: '亿', yoy: '+8.8%', src: 'Z·FPA口径' },
      { name: '负债口袋份额', actual: 18, target: 20, unit: '%', yoy: '+1.2pct', src: 'Z口袋份额' },
      { name: '资产口袋份额', actual: 22, target: 25, unit: '%', yoy: '+0.9pct', src: 'Z口袋份额' },
    ],
  },
  {
    dim: '投行与综合化', color: '#b7791f',
    metrics: [
      { name: '发债承销规模', actual: 86, target: 110, unit: '亿', yoy: '+22%', src: 'X13投行类' },
      { name: '发债/银团中收', actual: 0.82, target: 1.1, unit: '亿', yoy: '+18%', src: 'X13投行中收' },
      { name: '撮合中收', actual: 0.31, target: 0.45, unit: '亿', yoy: '+35%', src: 'X13撮合' },
      { name: '跨境结算量', actual: 42, target: 55, unit: '亿美元', yoy: '+12%', src: '综合化' },
    ],
  },
  {
    dim: '客群与生态', color: '#17815f',
    metrics: [
      { name: '家谱覆盖率', actual: 94, target: 96, unit: '%', yoy: '+2pct', src: 'Z内环' },
      { name: '供应链 N 端新增', actual: 326, target: 420, unit: '户', yoy: '+68户', src: 'Z评分卡N端' },
      { name: '团金 B 端覆盖', actual: 71, target: 80, unit: '%', yoy: '+5pct', src: 'Z外环' },
      { name: '重点行业新开户', actual: 21, target: 30, unit: '户', yoy: '+9户', src: 'Z名单新开' },
      { name: '1+10 目标达成率', actual: 78, target: 85, unit: '%', yoy: '+6pct', src: 'Z1+10' },
    ],
  },
  {
    dim: '质量与风险', color: '#7c6ff0',
    metrics: [
      { name: '战客不良率', actual: 0.62, target: 0.8, unit: '%', yoy: '-0.08pct', src: 'X15质量', good: 'low' },
      { name: '关注类占比', actual: 1.4, target: 1.5, unit: '%', yoy: '-0.2pct', src: 'X15迁徙', good: 'low' },
      { name: '预警闭环率', actual: 92, target: 100, unit: '%', yoy: '+4pct', src: 'Z·T+1' },
      { name: '授信条件执行率', actual: 96, target: 100, unit: '%', yoy: '+1pct', src: 'Z风险策略' },
    ],
  },
  {
    dim: '协同与效率', color: '#0e7490',
    metrics: [
      { name: '协同合约落地率', actual: 61, target: 75, unit: '%', yoy: '+9pct', src: '全行服务一家' },
      { name: '商机转化率', actual: 34, target: 40, unit: '%', yoy: '+5pct', src: 'X16营销' },
      { name: '集团月度触达覆盖', actual: 98, target: 100, unit: '%', yoy: '+1pct', src: 'Z月≥1' },
      { name: '纪要48h及时率', actual: 93, target: 100, unit: '%', yoy: '+3pct', src: 'Z·48h' },
    ],
  },
];

/** 北极星 · 战客综合金融渗透度（FPA 口径）：对公综合金融的引导性指标
 * 定义：FPA综合份额 =（负债口袋份额 + 资产口袋份额）/ 2；FPA余额为月均余额口径
 * 来源：招行《一户一策指引》8项核心经营数据（营收/净利息/非息/FPA/存款/负债口袋/贷款/资产口袋）
 * 逻辑：主指标看份额渗透（现状），EVA+RAROC守价值底线（质量），四大驱动可分解到行动与资源
 */
export const NORTH_STAR = {
  name: '战客综合金融渗透度',
  formula: 'FPA综合份额 =（负债口袋份额 + 资产口袋份额）/ 2',
  fpaShare: { actual: 20.0, target: 22.5, unit: '%', yoy: '+1.1pct' },
  fpaBal: { actual: 520, target: 600, unit: '亿', yoy: '+8.8%' },
  liability: { actual: 18, target: 20, unit: '%', yoy: '+1.2pct' },
  asset: { actual: 22, target: 25, unit: '%', yoy: '+0.9pct' },
  eva: { actual: 6.8, target: 8.0, unit: '亿', yoy: '+11.2%' },
  raroc: { actual: 14.2, target: 15, unit: '%', yoy: '+0.6pct' },
  nonRate: { actual: 28.6, target: 32, unit: '%', yoy: '+1.8pct' },
  revenue: { actual: 76, target: 90, unit: '亿', yoy: '+9.4%' },
  bad: { actual: 0.62, target: 0.8, unit: '%', yoy: '-0.08pct' },
};

/** 北极星12个月趋势（演示口径，与经营趋势同源） */
export const NORTH_HISTORY = {
  months: ['11月', '12月', '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月'],
  fpaShare: [16.2, 16.6, 17.0, 17.4, 17.8, 18.2, 18.6, 19.0, 19.3, 19.6, 19.8, 20.0],
  fpaBal: [380, 395, 410, 425, 440, 455, 468, 480, 492, 502, 512, 520],
  eva: [3.8, 4.0, 4.2, 4.5, 4.8, 5.0, 5.4, 5.7, 6.0, 6.3, 6.5, 6.8],
};

/** 北极星四大驱动：缺口 → 关键动作 → 资源投向（指导经营调整与资源分配） */
export const NORTH_DRIVERS = [
  { key: '负债组织', actual: '612 亿 / 18%', target: '700 亿 / 20%', pct: 87, gap: '存款缺口 88 亿 · 口袋差 2pct', action: '司库归集 + 募集资金归行（先声 8.6 亿、南瑞中票资金沉淀）', resource: '交易银行CBS · 运营极速开户 · 定价（协定利率）', owner: '交易银行部 + 南京分行' },
  { key: '资产投放', actual: '438 亿 / 22%', target: '500 亿 / 25%', pct: 88, gap: '贷款缺口 62 亿 · 口袋差 3pct', action: '银团提款（南钢 12 亿）+ 供应链1端直贷 + N端确权', resource: '授信绿色通道 · 资金营运定价（LPR-15bp）', owner: '授信审批部 + 属地行' },
  { key: '投行综合化', actual: '承销 86 亿 · 非息 28.6%', target: '承销 110 亿 · 非息 32%', pct: 78, gap: '承销缺口 24 亿 · 非息差 3.4pct', action: '南瑞中票 10 亿簿记 + 苏交科 ABS 5 亿 + 撮合中收', resource: '投资银行部 · 资金营运做市 · 托管部', owner: '投资银行部' },
  { key: '生态渗透', actual: 'N端 326 户 · B端 71%', target: 'N端 420 户 · B端 80%', pct: 77, gap: 'N端缺口 94 户 · B端差 9pct', action: 'N端白名单批量开户 + 团金进场（恒瑞 1.1 万人、途牛 3000 人）', resource: '属地协同（5:5分润）· 零售团金 · 手机银行场景', owner: '属地行 + 零售部' },
];

/** 数据权限：不同岗位可见的集团范围（模拟行内数据权限模型） */
export function visibleGroups(u: User): Group[] {
  if (u.id === 'branch') return GROUPS.filter((g) => g.branch === '南京分行');
  if (u.id === 'mgr') return GROUPS.filter((g) => ['g1', 'g2'].includes(g.id));
  if (u.id === 'dept') return GROUPS.filter((g) => g.level === '总行级' || ['g4'].includes(g.id));
  return GROUPS;
}

/** 六维达成率汇总：低优指标（不良率等）用 目标/实际 折算，上限 100 */
export function dimScores(): Array<{ dim: string; score: number; color: string }> {
  return PERF_SYSTEM.map((d) => {
    const ms = d.metrics as Array<{ actual: number; target: number; good?: string }>;
    const avg =
      ms.reduce((s, m) => {
        const p = m.good === 'low' ? m.target / m.actual : m.actual / m.target;
        return s + Math.min(p, 1);
      }, 0) / ms.length;
    return { dim: d.dim, score: Math.round(avg * 100), color: (d as { color: string }).color };
  });
}

/** 某维度短板指标（达成率最低的一项） */
export function dimWeak(dim: string): { name: string; pct: number } {
  const d = PERF_SYSTEM.find((x) => x.dim === dim)!;
  const ms = d.metrics as Array<{ name: string; actual: number; target: number; good?: string }>;
  let weak = ms[0];
  let weakP = Infinity;
  ms.forEach((m) => {
    const p = m.good === 'low' ? m.target / m.actual : m.actual / m.target;
    if (p < weakP) { weakP = p; weak = m; }
  });
  return { name: weak.name, pct: Math.round(Math.min(weakP, 1) * 100) };
}

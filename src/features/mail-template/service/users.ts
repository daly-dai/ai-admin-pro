/**
 * 通讯录 mock（演示）：真实系统为后端用户接口，列表项含 officeOrgPath（组织路径）+ userInfo（用户标识）。
 * userInfo 形如「张三/112233」（姓名/工号）：模板保存/发送均传 userInfo（对外语义 = 逗号分隔的 userInfo 串），
 * 真实后端按 userInfo 换取邮件地址后发信——Demo 页面只展示用户信息，不涉及邮箱字段。
 * WHY 单目录契约：模块自包含 mock；接真实用户接口时仅替换 listUsersByGet 实现与数据来源。
 */
export interface DirectoryUser {
  /** 用户标识，形如「张三/112233」（姓名/工号） */
  userInfo: string;
  /** 组织路径，形如「总公司/产品部/数据组」 */
  officeOrgPath: string;
}

const DIRECTORY_USERS: DirectoryUser[] = [
  { userInfo: '张三/112233', officeOrgPath: '总公司/产品部/数据组' },
  { userInfo: '刘洋/112234', officeOrgPath: '总公司/产品部/数据组' },
  { userInfo: '陈静/112235', officeOrgPath: '总公司/产品部/数据组' },
  { userInfo: '王芳/1021', officeOrgPath: '总公司/产品部' },
  { userInfo: '李娜/1022', officeOrgPath: '总公司/产品部' },
  { userInfo: '赵磊/2031', officeOrgPath: '总公司/研发部/前端组' },
  { userInfo: '孙悦/2032', officeOrgPath: '总公司/研发部/前端组' },
  { userInfo: '周涛/2041', officeOrgPath: '总公司/研发部/后端组' },
  { userInfo: '吴桐/2042', officeOrgPath: '总公司/研发部/后端组' },
  { userInfo: '郑爽/3011', officeOrgPath: '总公司/运营部' },
  { userInfo: '冯斌/3012', officeOrgPath: '总公司/运营部' },
  { userInfo: '钱进/4011', officeOrgPath: '总公司/财务部' },
];

/** 通讯录列表（真实后端形状：ByGet；Demo 同步直返，页面侧按需包 Promise） */
export function listUsersByGet(): DirectoryUser[] {
  // WHY 拷贝：防外部修改污染模块内数据
  return DIRECTORY_USERS.map((user) => ({ ...user }));
}

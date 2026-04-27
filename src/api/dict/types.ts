export interface Dictionary {
  dictItem: string;
  dictKey: string;
  dictValue: string;
  dictDesc: string;
  dictMaintainUser?: string;
  dictMaintainUserName?: string;
  dictCreateTime?: Date;
  dictUpdateTime?: Date;
  dictReserve1?: string;
  dictReserve2?: string;
}

export type DictMapData = Record<string, Record<string, string>>;

export interface IGroup {
  id: number;
  name: string;
}

export type IAddGroup = Omit<IGroup, 'id'>;
export type IEditGroup = Partial<IAddGroup>;

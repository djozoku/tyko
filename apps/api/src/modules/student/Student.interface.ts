export interface IStudent {
  id: number;
  name: string;
  user_id: number;
  group_id: number;
}

export type IAddStudent = Omit<IStudent, 'id' | 'user_id' | 'group_id'> & {
  group_id: string;
};
export type IEditStudent = Partial<IAddStudent>;

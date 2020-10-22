export interface ITeacher {
  id: number;
  name: string;
  phone: string;
  email: string;
  user_id: number;
}

export type IAddTeacher = Omit<ITeacher, 'id' | 'user_id'>;
export type IEditTeacher = Partial<IAddTeacher>;

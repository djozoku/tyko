export interface IWorkplace {
  id: number;
  name: string;
  description: string;
  phone: string;
  url: string;
  email: string;
  address_id: number;
}

export type IAddWorkplace = Omit<IWorkplace, 'id' | 'address_id'>;
export type IEditWorkplace = Partial<IAddWorkplace>;

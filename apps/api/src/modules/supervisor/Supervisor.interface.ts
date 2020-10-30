export interface ISupervisor {
  id: number;
  name: string;
  phone: string;
  email: string;
  workplace_id: number;
}

export type IAddSupervisor = Omit<ISupervisor, 'id' | 'workplace_id'> & { workplace_id: string };
export type IEditSupervisor = Partial<Omit<IAddSupervisor, 'workplace_id'>>;

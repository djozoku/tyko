export interface IPeriod {
  id: number;
  start_date: Date;
  end_date: Date;
  student_id: number;
  supervisor_id: number;
  workplace_id: number;
  teacher_id: number;
}

export type IAddPeriod = Omit<
  IPeriod,
  'id' | 'student_id' | 'supervisor_id' | 'workplace_id' | 'teacher_id'
> & {
  supervisor_id: string;
  workplace_id: string;
  teacher_id: string;
};
export type IEditPeriod = Partial<IAddPeriod>;

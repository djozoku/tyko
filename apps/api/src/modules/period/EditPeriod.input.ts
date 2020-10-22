import { Field, InputType } from 'type-graphql';

import { IEditPeriod } from './Period.interface';

@InputType()
export default class EditPeriod implements IEditPeriod {
  @Field()
  start_date?: Date;

  @Field()
  end_date?: Date;

  @Field()
  supervisor_id?: string;

  @Field()
  workplace_id?: string;

  @Field()
  teacher_id?: string;
}

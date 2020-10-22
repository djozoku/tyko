import { Field, InputType } from 'type-graphql';

import { IAddPeriod } from './Period.interface';

@InputType()
export default class AddPeriod implements IAddPeriod {
  @Field()
  start_date!: Date;

  @Field()
  end_date!: Date;

  @Field()
  supervisor_id!: string;

  @Field()
  workplace_id!: string;

  @Field()
  teacher_id!: string;
}

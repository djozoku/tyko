import { Field, InputType } from 'type-graphql';

import { IAddStudent } from './Student.interface';

@InputType()
export default class AddStudent implements IAddStudent {
  @Field()
  name!: string;

  @Field()
  group_id!: string;
}

import { Field, InputType } from 'type-graphql';

import { IEditTeacher } from './Teacher.interface';

@InputType()
export default class EditTeacher implements IEditTeacher {
  @Field()
  name?: string;

  @Field()
  phone?: string;

  @Field()
  email?: string;
}

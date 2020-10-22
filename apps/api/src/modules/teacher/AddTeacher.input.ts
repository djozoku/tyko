import { Field, InputType } from 'type-graphql';

import { IAddTeacher } from './Teacher.interface';

@InputType()
export default class AddTeacher implements IAddTeacher {
  @Field()
  name!: string;

  @Field()
  phone!: string;

  @Field()
  email!: string;
}

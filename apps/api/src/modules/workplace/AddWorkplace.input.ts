import { Field, InputType } from 'type-graphql';

import { IAddWorkplace } from './Workplace.interface';

@InputType()
export default class AddWorkplace implements IAddWorkplace {
  @Field()
  name!: string;

  @Field()
  description!: string;

  @Field()
  phone!: string;

  @Field()
  url!: string;

  @Field()
  email!: string;
}

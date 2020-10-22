import { Field, InputType } from 'type-graphql';

import { IEditWorkplace } from './Workplace.interface';

@InputType()
export default class EditWorkplace implements IEditWorkplace {
  @Field()
  name?: string;

  @Field()
  description?: string;

  @Field()
  phone?: string;

  @Field()
  url?: string;

  @Field()
  email?: string;
}

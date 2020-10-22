import { Field, InputType } from 'type-graphql';

import { IEditGroup } from './Group.interface';

@InputType()
export default class EditGroup implements IEditGroup {
  @Field()
  name?: string;
}

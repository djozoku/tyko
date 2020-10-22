import { Field, InputType } from 'type-graphql';

import { IAddGroup } from './Group.interface';

@InputType()
export default class AddGroup implements IAddGroup {
  @Field()
  name!: string;
}

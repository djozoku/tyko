import { Field, InputType } from 'type-graphql';

import { IEditStudent } from './Student.interface';

@InputType()
export default class EditStudent implements IEditStudent {
  @Field()
  name?: string;

  @Field()
  group_id?: string;
}

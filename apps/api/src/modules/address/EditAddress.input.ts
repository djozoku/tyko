import { Field, InputType } from 'type-graphql';

import { IEditAddress } from './Address.interface';

@InputType()
export default class EditAddress implements IEditAddress {
  @Field()
  street?: string;

  @Field()
  city?: string;

  @Field()
  postal_code?: string;
}

import { Field, InputType } from 'type-graphql';

import { IAddAddress } from './Address.interface';

@InputType()
export default class AddAddress implements IAddAddress {
  @Field()
  street!: string;

  @Field()
  city!: string;

  @Field()
  postal_code!: string;
}

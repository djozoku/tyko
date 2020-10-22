import { ObjectType, Field, ID } from 'type-graphql';

@ObjectType()
export default class User {
  @Field(() => ID)
  uid!: string;

  @Field()
  name!: string;

  @Field()
  email!: string;

  @Field()
  type!: string;

  @Field()
  avatar!: string;
}

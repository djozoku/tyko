import { ArgsType, Field, Int } from 'type-graphql';

@ArgsType()
export default class PaginationArgs {
  @Field(() => Int, { defaultValue: 0 })
  skip = 0;

  @Field(() => Int, { defaultValue: 20 })
  take = 20;
}

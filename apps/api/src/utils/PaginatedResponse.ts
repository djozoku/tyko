import { ClassType, Field, Int, ObjectType } from 'type-graphql';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function PaginatedResponse<TItem>(TItemClass: ClassType<TItem>) {
  @ObjectType({ isAbstract: true })
  abstract class PaginatedResponseClass {
    @Field(() => [TItemClass])
    items!: TItem[];

    @Field(() => Int)
    total!: number;

    @Field()
    hasMore!: boolean;
  }
  return PaginatedResponseClass;
}

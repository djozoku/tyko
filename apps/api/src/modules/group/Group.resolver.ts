import {
  Resolver,
  Mutation,
  Arg,
  ID,
  Query,
  FieldResolver,
  Root,
  Authorized,
  Args,
  ObjectType,
} from 'type-graphql';
import { createQueryBuilder } from 'typeorm';

import Student from '../student/Student.entity';
import PaginationArgs from '../../utils/PaginationArgs';
import PaginatedResponse from '../../utils/PaginatedResponse';

import Group from './Group.entity';
import AddGroup from './AddGroup.input';
import EditGroup from './EditGroup.input';

@ObjectType()
class PaginatedGroupResponse extends PaginatedResponse(Group) {}

@Resolver(Group)
export default class GroupResolver {
  @Authorized()
  @Query(() => Group, { description: 'Get a group with an ID', nullable: true })
  async group(
    @Arg('id', () => ID, { description: 'ID of the group to get' }) id: string,
  ): Promise<Group | undefined> {
    return Group.findOne(id);
  }

  @Authorized()
  @Query(() => PaginatedGroupResponse, { description: 'Gets all groups' })
  async groups(
    @Args() { skip, take }: PaginationArgs,
    @Arg('search', () => String, { nullable: true }) search: string,
  ): Promise<PaginatedGroupResponse> {
    if (search) {
      const [items, count] = await createQueryBuilder(Group)
        .select()
        .where('name_search_doc @@ to_tsquery(:query)', { query: `${search}:*` })
        .orderBy('ts_rank(name_search_doc, to_tsquery(:query))', 'DESC')
        .skip(skip)
        .take(take)
        .getManyAndCount();
      return {
        items,
        total: count,
        hasMore: count - skip - take > 0,
      };
    }
    const [items, count] = await Group.findAndCount({ skip, take });
    return {
      items,
      total: count,
      hasMore: count - skip - take > 0,
    };
  }

  @Authorized('teacher')
  @Mutation(() => Group, { description: 'Adds a new group to the database' })
  async addGroup(
    @Arg('group', { description: "New group's data" }) group: AddGroup,
  ): Promise<Group> {
    const existing = await Group.findOne({ where: { name: group.name } });
    if (existing) throw new Error(`Group is already in the database`);

    return Group.create(group).save();
  }

  @Authorized('teacher')
  @Mutation(() => Group, { description: "Edit an existing group's data" })
  async editGroup(
    @Arg('id', () => ID, { description: 'ID of the group to edit' }) id: string,
    @Arg('edit', { description: 'Edited data' }) edit: EditGroup,
  ): Promise<Group> {
    const group = await Group.findOne(id);
    if (!group) throw new Error(`A group could not be found with ID: "${id}"`);

    if (edit.name) group.name = edit.name;

    return group.save();
  }

  // TODO: don't delete if has relations
  // TODO: delete multiple
  @Authorized('teacher')
  @Mutation(() => Boolean, { description: 'Delete an existing group' })
  async deleteGroup(
    @Arg('id', () => ID, { description: 'ID of the group to delete' }) id: string,
  ): Promise<true> {
    const group = await Group.findOne(id);
    if (!group) throw new Error(`A group could not be found with ID: "${id}"`);

    await group.remove();
    return true;
  }

  @FieldResolver(() => [Student])
  async students(@Root() parent: Group): Promise<Student[]> {
    return Student.find({ where: { group_id: parent.id } });
  }
}

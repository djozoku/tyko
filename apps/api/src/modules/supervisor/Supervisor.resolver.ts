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
import { UserInputError } from 'apollo-server-express';

import Workplace from '../workplace/Workplace.entity';
import PaginationArgs from '../../utils/PaginationArgs';
import PaginatedResponse from '../../utils/PaginatedResponse';

import Supervisor from './Supervisor.entity';
import AddSupervisor from './AddSupervisor.input';
import EditSupervisor from './EditSupervisor.input';

@ObjectType()
class PaginatedSupervisorResponse extends PaginatedResponse(Supervisor) {}

@Resolver(Supervisor)
export default class SupervisorResolver {
  @Authorized()
  @Query(() => Supervisor, { description: 'Get a supervisor by an ID', nullable: true })
  async supervisor(
    @Arg('id', () => ID, { description: 'ID of the supervisor to get' }) id: string,
  ): Promise<Supervisor | undefined> {
    return Supervisor.findOne(id);
  }

  @Authorized()
  @Query(() => PaginatedSupervisorResponse, { description: 'Gets all supervisors' })
  async supervisors(
    @Args() { skip, take }: PaginationArgs,
    @Arg('search', () => String, { nullable: true }) search: string,
  ): Promise<PaginatedSupervisorResponse> {
    if (search) {
      const [items, count] = await createQueryBuilder(Supervisor)
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
    const [items, count] = await Supervisor.findAndCount({ skip, take });
    return {
      items,
      total: count,
      hasMore: count - skip - take > 0,
    };
  }

  @Authorized('teacher', 'student')
  @Mutation(() => Supervisor, { description: 'Adds a new supervisor to the database' })
  async addSupervisor(
    @Arg('supervisor', { description: "New supervisor's data" }) supervisor: AddSupervisor,
  ): Promise<Supervisor> {
    const existing = await Supervisor.findOne({
      where: { name: supervisor.name, workplace_id: supervisor.workplace_id },
    });
    if (existing) throw new Error(`Supervisor is already in the database`);

    const errors: Partial<AddSupervisor> = {};

    if (supervisor.name.trim() === '') errors.name = "Name can't be empty";
    if (supervisor.phone.trim() === '') errors.phone = "Phone number can't be empty";
    if (supervisor.email.trim() === '') errors.email = "Email can't be empty";

    if (Object.keys(errors).length > 0) {
      throw new UserInputError('Invalid arguments', errors);
    }

    return Supervisor.create({
      ...supervisor,
      workplace_id: parseInt(supervisor.workplace_id, 10),
    }).save();
  }

  @Authorized('teacher', 'student')
  @Mutation(() => Supervisor, { description: "Edit an existing supervisor's data" })
  async editSupervisor(
    @Arg('id', () => ID, { description: 'ID of the supervisor to edit' }) id: string,
    @Arg('edit', { description: 'Edited data' }) edit: EditSupervisor,
  ): Promise<Supervisor> {
    const supervisor = await Supervisor.findOne(id);
    if (!supervisor) throw new Error(`A supervisor could not be found with ID: "${id}"`);

    const errors: Partial<EditSupervisor> = {};

    if (edit.name === '') errors.name = "Name can't be empty";
    if (edit.phone === '') errors.phone = "Phone number can't be empty";
    if (edit.email === '') errors.email = "Email can't be empty";

    if (Object.keys(errors).length > 0) {
      throw new UserInputError('Invalid arguments', errors);
    }

    if (edit.name) supervisor.name = edit.name;
    if (edit.phone) supervisor.phone = edit.phone;
    if (edit.email) supervisor.email = edit.email;

    return supervisor.save();
  }

  // TODO: don't delete if has relations
  // TODO: delete multiple
  @Authorized('teacher')
  @Mutation(() => Boolean, { description: 'Delete an existing supervisor' })
  async deleteSupervisor(
    @Arg('id', () => ID, { description: 'ID of the supervisor to delete' }) id: string,
  ): Promise<true> {
    const supervisor = await Supervisor.findOne(id);
    if (!supervisor) throw new Error(`A supervisor could not be found with ID: "${id}"`);

    await supervisor.remove();
    return true;
  }

  @FieldResolver(() => Workplace)
  async workplace(@Root() parent: Supervisor): Promise<Workplace> {
    return Workplace.findOneOrFail(parent.workplace_id);
  }
}

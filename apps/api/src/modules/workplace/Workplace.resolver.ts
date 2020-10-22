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
} from 'type-graphql';
import { createQueryBuilder } from 'typeorm';

import AddAddress from '../address/AddAddress.input';
import Address from '../address/Address.entity';
import PaginationArgs from '../../utils/PaginationArgs';
import Supervisor from '../supervisor/Supervisor.entity';

import Workplace from './Workplace.entity';
import AddWorkplace from './AddWorkplace.input';
import EditWorkplace from './EditWorkplace.input';

@Resolver(Workplace)
export default class WorkplaceResolver {
  @Authorized()
  @Query(() => Workplace, { description: 'Get a workplace by an ID', nullable: true })
  async workplace(
    @Arg('id', () => ID, { description: 'ID of the workplace to get' }) id: string,
  ): Promise<Workplace | undefined> {
    return Workplace.findOne(id);
  }

  @Authorized()
  @Query(() => [Workplace], { description: 'Gets all workplaces' })
  async workplaces(
    @Args() { skip, take }: PaginationArgs,
    @Arg('search', () => String, { nullable: true }) search: string,
  ): Promise<Workplace[]> {
    if (search) {
      return createQueryBuilder(Workplace)
        .select()
        .where('name_search_doc @@ to_tsquery(:query)', { query: `${search}:*` })
        .orderBy('ts_rank(name_search_doc, to_tsquery(:query))', 'DESC')
        .skip(skip)
        .take(take)
        .getMany();
    }
    return Workplace.find({ skip, take });
  }

  @Authorized('teacher', 'student')
  @Mutation(() => Workplace, { description: 'Adds a new workplace to the database' })
  async addWorkplace(
    @Arg('workplace', { description: "New workplace's data" }) workplace: AddWorkplace,
    @Arg('address', { description: "New workplace's address" }) address: AddAddress,
  ): Promise<Workplace> {
    const existing = await Workplace.findOne({ where: { name: workplace.name } });
    if (existing) throw new Error(`Workplace is already in the database`);

    const { id } = await Address.create(address).save();

    return Workplace.create({
      ...workplace,
      address_id: id,
    }).save();
  }

  @Authorized('teacher', 'student')
  @Mutation(() => Workplace, { description: "Edit an existing workplace's data" })
  async editWorkplace(
    @Arg('id', () => ID, { description: 'ID of the workplace to edit' }) id: string,
    @Arg('edit', { description: 'Edited data' }) edit: EditWorkplace,
  ): Promise<Workplace> {
    const workplace = await Workplace.findOne(id);
    if (!workplace) throw new Error(`A workplace could not be found with ID: "${id}"`);

    if (edit.name) workplace.name = edit.name;
    if (edit.description) workplace.description = edit.description;
    if (edit.email) workplace.email = edit.email;
    if (edit.phone) workplace.phone = edit.phone;
    if (edit.url) workplace.url = edit.url;

    return workplace.save();
  }

  // TODO: don't delete if has relations
  // TODO: delete multiple
  @Authorized('teacher')
  @Mutation(() => Boolean, { description: 'Delete an existing workplace' })
  async deleteWorkplace(
    @Arg('id', () => ID, { description: 'ID of the workplace to delete' }) id: string,
  ): Promise<true> {
    const workplace = await Workplace.findOne(id);
    if (!workplace) throw new Error(`A workplace could not be found with ID: "${id}"`);

    const address = await Address.findOneOrFail(workplace.address_id);
    await address.remove();

    await workplace.remove();
    return true;
  }

  @FieldResolver(() => Address)
  async address(@Root() parent: Workplace): Promise<Address> {
    return Address.findOneOrFail(parent.address_id);
  }

  @FieldResolver(() => [Supervisor])
  async supervisors(@Root() parent: Workplace): Promise<Supervisor[]> {
    return Supervisor.find({ where: { workplace_id: parent.id } });
  }
}

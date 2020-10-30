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

import AddAddress from '../address/AddAddress.input';
import Address from '../address/Address.entity';
import PaginationArgs from '../../utils/PaginationArgs';
import Supervisor from '../supervisor/Supervisor.entity';
import PaginatedResponse from '../../utils/PaginatedResponse';
import Period from '../period/Period.entity';

import Workplace from './Workplace.entity';
import AddWorkplace from './AddWorkplace.input';
import EditWorkplace from './EditWorkplace.input';

@ObjectType()
class PaginatedWorkplaceResponse extends PaginatedResponse(Workplace) {}

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
  @Query(() => PaginatedWorkplaceResponse, { description: 'Gets all workplaces' })
  async workplaces(
    @Args() { skip, take }: PaginationArgs,
    @Arg('search', () => String, { nullable: true }) search: string,
  ): Promise<PaginatedWorkplaceResponse> {
    if (search) {
      const [items, count] = await createQueryBuilder(Workplace)
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
    const [items, count] = await Workplace.findAndCount({ skip, take });
    return {
      items,
      total: count,
      hasMore: count - skip - take > 0,
    };
  }

  @Authorized('teacher', 'student')
  @Mutation(() => Workplace, { description: 'Adds a new workplace to the database' })
  async addWorkplace(
    @Arg('workplace', { description: "New workplace's data" }) workplace: AddWorkplace,
    @Arg('address', { description: "New workplace's address" }) address: AddAddress,
  ): Promise<Workplace> {
    const existing = await Workplace.findOne({ where: { name: workplace.name } });
    if (existing) throw new Error(`Workplace is already in the database`);

    const errors: Partial<AddWorkplace & AddAddress> = {};

    if (workplace.name.trim() === '') errors.name = "Name can't be empty";
    if (workplace.description.trim() === '') errors.description = "Description can't be empty";
    if (address.city.trim() === '') errors.city = "City can't be empty";
    if (address.postal_code.trim() === '') errors.postal_code = "Postal code can't be empty";
    if (address.street.trim() === '') errors.street = "Street address can't be empty";

    if (Object.keys(errors).length > 0) {
      throw new UserInputError('Invalid arguments', errors);
    }

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

    const errors: Partial<EditWorkplace> = {};

    if (edit.name?.trim() === '') errors.name = "Name can't be empty";
    if (edit.description?.trim() === '') errors.description = "Description can't be empty";

    if (Object.keys(errors).length > 0) {
      throw new UserInputError('Invalid arguments', errors);
    }

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

  @FieldResolver(() => [Period])
  async periods(@Root() parent: Workplace): Promise<Period[]> {
    return Period.find({ where: { workplace_id: parent.id } });
  }
}

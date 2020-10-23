import { UserInputError } from 'apollo-server-express';
import { Arg, Authorized, ID, Mutation, Resolver } from 'type-graphql';

import Address from './Address.entity';
import EditAddress from './EditAddress.input';

@Resolver(Address)
export default class AddressResolver {
  @Authorized()
  @Mutation(() => Address, { description: 'Edit an existing address' })
  async editAddress(
    @Arg('id', () => ID, { description: 'ID of the address to edit' }) id: string,
    @Arg('edit', { description: 'Edited data' }) edit: EditAddress,
  ): Promise<Address> {
    const address = await Address.findOne(id);
    if (!address) throw new Error(`An address could not be found with ID: "${id}"`);

    const errors: Partial<EditAddress> = {};

    if (edit.city === '') errors.city = "City can't be empty";
    if (edit.postal_code === '') errors.postal_code = "Postal code can't be empty";
    if (edit.street === '') errors.street = "Street address can't be empty";

    if (Object.keys(errors).length > 0) {
      throw new UserInputError('Invalid arguments', errors);
    }

    if (edit.city) address.city = edit.city;
    if (edit.postal_code) address.postal_code = edit.postal_code;
    if (edit.street) address.street = edit.street;

    return address.save();
  }
}

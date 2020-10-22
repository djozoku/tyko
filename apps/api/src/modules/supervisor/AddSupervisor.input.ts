import { Field, InputType } from 'type-graphql';

import { IAddSupervisor } from './Supervisor.interface';

@InputType()
export default class AddSupervisor implements IAddSupervisor {
  @Field()
  name!: string;

  @Field()
  phone!: string;

  @Field()
  email!: string;

  @Field()
  workplace_id!: string;
}

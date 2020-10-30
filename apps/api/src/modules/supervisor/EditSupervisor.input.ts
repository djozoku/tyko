import { Field, InputType } from 'type-graphql';

import { IEditSupervisor } from './Supervisor.interface';

@InputType()
export default class EditSupervisor implements IEditSupervisor {
  @Field()
  name?: string;

  @Field()
  phone?: string;

  @Field()
  email?: string;
}

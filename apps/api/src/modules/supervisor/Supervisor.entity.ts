import { Field, ID, Int, ObjectType } from 'type-graphql';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { ISupervisor } from './Supervisor.interface';

@ObjectType()
@Entity()
export default class Supervisor extends BaseEntity implements ISupervisor {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column('text')
  name!: string;

  @Field()
  @Column('text')
  phone!: string;

  @Field()
  @Column('text')
  email!: string;

  @Field(() => Int, { nullable: true })
  @Column('int')
  workplace_id!: number;

  @Column('tsvector', { select: false })
  name_search_doc!: any;
}

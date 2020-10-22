import { ObjectType, Field, ID } from 'type-graphql';
import { Entity, BaseEntity, PrimaryGeneratedColumn, Column } from 'typeorm';

import { IGroup } from './Group.interface';

@ObjectType()
@Entity()
export default class Group extends BaseEntity implements IGroup {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column('text')
  name!: string;

  @Column('tsvector', { select: false })
  name_search_doc!: any;
}

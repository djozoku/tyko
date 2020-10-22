import { ObjectType, Field, ID, Int } from 'type-graphql';
import { Entity, BaseEntity, PrimaryGeneratedColumn, Column } from 'typeorm';

import { IWorkplace } from './Workplace.interface';

@ObjectType()
@Entity()
export default class Workplace extends BaseEntity implements IWorkplace {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column('text')
  name!: string;

  @Field()
  @Column('text')
  description!: string;

  @Field()
  @Column('text')
  phone!: string;

  @Field()
  @Column('text')
  url!: string;

  @Field()
  @Column('text')
  email!: string;

  @Field(() => Int)
  @Column('int')
  address_id!: number;

  @Column('tsvector', { select: false })
  name_search_doc!: any;
}

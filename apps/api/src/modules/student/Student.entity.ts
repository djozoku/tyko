import { ObjectType, Field, ID, Int } from 'type-graphql';
import { Entity, BaseEntity, PrimaryGeneratedColumn, Column } from 'typeorm';

import { IStudent } from './Student.interface';

@ObjectType()
@Entity()
export default class Student extends BaseEntity implements IStudent {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column('text')
  name!: string;

  @Field(() => Int)
  @Column('int')
  user_id!: number;

  @Field(() => Int)
  @Column('int')
  group_id!: number;

  @Column('tsvector', { select: false })
  name_search_doc!: any;
}

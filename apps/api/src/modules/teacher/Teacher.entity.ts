import { ObjectType, Field, ID, Int } from 'type-graphql';
import { Entity, BaseEntity, PrimaryGeneratedColumn, Column } from 'typeorm';

import { ITeacher } from './Teacher.interface';

@ObjectType()
@Entity()
export default class Teacher extends BaseEntity implements ITeacher {
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

  @Field(() => Int)
  @Column('int')
  user_id!: number;

  @Column('tsvector', { select: false })
  name_search_doc!: any;
}

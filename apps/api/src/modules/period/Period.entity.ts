import { ObjectType, Field, ID, Int } from 'type-graphql';
import { Entity, BaseEntity, PrimaryGeneratedColumn, Column } from 'typeorm';

import { IPeriod } from './Period.interface';

@ObjectType()
@Entity()
export default class Period extends BaseEntity implements IPeriod {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  start_date!: Date;

  @Field()
  @Column()
  end_date!: Date;

  @Field(() => Int, { nullable: true })
  @Column('int')
  student_id!: number;

  @Field(() => Int, { nullable: true })
  @Column('int')
  supervisor_id!: number;

  @Field(() => Int, { nullable: true })
  @Column('int')
  workplace_id!: number;

  @Field(() => Int, { nullable: true })
  @Column('int')
  teacher_id!: number;
}

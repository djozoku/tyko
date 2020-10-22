import { ObjectType, Field, ID } from 'type-graphql';
import { Entity, BaseEntity, PrimaryGeneratedColumn, Column } from 'typeorm';

import { IAddress } from './Address.interface';

@ObjectType()
@Entity()
export default class Address extends BaseEntity implements IAddress {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column('text')
  street!: string;

  @Field()
  @Column('text')
  city!: string;

  @Field()
  @Column('text')
  postal_code!: string;
}

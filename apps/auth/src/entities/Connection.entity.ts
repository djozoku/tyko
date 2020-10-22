import { Entity, BaseEntity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export default class Connection extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('text')
  provider!: string;

  @Column('text', { unique: true })
  provider_id!: string;

  @Column('text')
  name!: string;

  @Column('text')
  email!: string;

  @Column('text')
  avatar!: string;

  @Column('text')
  token!: string;

  @Column('int')
  account_id!: number;
}

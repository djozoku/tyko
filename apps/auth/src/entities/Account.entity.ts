import { Entity, BaseEntity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export default class Account extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('text')
  avatar!: string;

  @Column('text')
  name!: string;

  @Column('text', { unique: true })
  email!: string;

  @Column('text')
  type!: string;
}

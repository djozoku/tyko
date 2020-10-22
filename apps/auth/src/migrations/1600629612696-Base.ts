import { MigrationInterface, QueryRunner } from 'typeorm';

export class Base1600629612696 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE account (id serial PRIMARY KEY NOT NULL, avatar text NOT NULL, name text NOT NULL, email text NOT NULL, type text NOT NULL, student_id int, teacher_id int);
    `);
    await queryRunner.query(`
      CREATE TABLE connection (id serial PRIMARY KEY NOT NULL, provider text NOT NULL, provider_id text UNIQUE NOT NULL, name text NOT NULL, email text NOT NULL, avatar text NOT NULL, token text NOT NULL, account_id int NOT NULL);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE account;
      DROP TABLE connection;
    `);
  }
}

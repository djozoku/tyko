import { MigrationInterface, QueryRunner } from 'typeorm';

export class Base1600629612696 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE FUNCTION name_tsvector_trigger() RETURNS trigger AS $$
      begin
        new.name_search_doc := to_tsvector(new.name);
        return new;
      end
      $$ LANGUAGE plpgsql;
    `);
    await queryRunner.query(`
      CREATE TABLE address (id serial PRIMARY KEY NOT NULL, street text NOT NULL, city text NOT NULL, postal_code text NOT NULL);
    `);
    await queryRunner.query(`
      CREATE TABLE "group" (id serial PRIMARY KEY NOT NULL, name text NOT NULL, name_search_doc tsvector NOT NULL);
    `);
    await queryRunner.query(`
      CREATE INDEX group_name_search_doc_index ON "group" USING GIN (name_search_doc);
    `);
    await queryRunner.query(`
      CREATE TRIGGER name_update BEFORE INSERT OR UPDATE ON "group" FOR EACH ROW EXECUTE PROCEDURE name_tsvector_trigger();
    `);
    await queryRunner.query(`
      CREATE TABLE student (id serial PRIMARY KEY NOT NULL, name text NOT NULL, user_id int NOT NULL, group_id int NOT NULL, name_search_doc tsvector NOT NULL);
    `);
    await queryRunner.query(`
      CREATE INDEX student_name_search_doc_index ON student USING GIN (name_search_doc);
    `);
    await queryRunner.query(`
      CREATE TRIGGER name_update BEFORE INSERT OR UPDATE ON student FOR EACH ROW EXECUTE PROCEDURE name_tsvector_trigger();
    `);
    await queryRunner.query(`
      CREATE TABLE period (id serial PRIMARY KEY NOT NULL, start_date timestamp NOT NULL, end_date timestamp NOT NULL, student_id int NOT NULL, supervisor_id int NOT NULL, workplace_id int NOT NULL, teacher_id int NOT NULL);
    `);
    await queryRunner.query(`
      CREATE TABLE supervisor (id serial PRIMARY KEY NOT NULL, name text NOT NULL, phone text NOT NULL, email text NOT NULL, workplace_id int NOT NULL, name_search_doc tsvector NOT NULL);
    `);
    await queryRunner.query(`
      CREATE INDEX supervisor_name_search_doc_index ON supervisor USING GIN (name_search_doc);
    `);
    await queryRunner.query(`
      CREATE TRIGGER name_update BEFORE INSERT OR UPDATE ON supervisor FOR EACH ROW EXECUTE PROCEDURE name_tsvector_trigger();
    `);
    await queryRunner.query(`
      CREATE TABLE teacher (id serial PRIMARY KEY NOT NULL, name text NOT NULL, phone text NOT NULL, email text NOT NULL, user_id int NOT NULL, name_search_doc tsvector NOT NULL);
    `);
    await queryRunner.query(`
      CREATE INDEX teacher_name_search_doc_index ON teacher USING GIN (name_search_doc);
    `);
    await queryRunner.query(`
      CREATE TRIGGER name_update BEFORE INSERT OR UPDATE ON teacher FOR EACH ROW EXECUTE PROCEDURE name_tsvector_trigger();
    `);
    await queryRunner.query(`
      CREATE TABLE workplace (id serial PRIMARY KEY NOT NULL, name text NOT NULL, description text NOT NULL, phone text NOT NULL, url text NOT NULL, email text NOT NULL, address_id int NOT NULL, name_search_doc tsvector NOT NULL);
    `);
    await queryRunner.query(`
      CREATE INDEX workplace_name_search_doc_index ON workplace USING GIN (name_search_doc);
    `);
    await queryRunner.query(`
      CREATE TRIGGER name_update BEFORE INSERT OR UPDATE ON workplace FOR EACH ROW EXECUTE PROCEDURE name_tsvector_trigger();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE address;
    `);
    await queryRunner.query(`
      DROP TABLE "group";
    `);
    await queryRunner.query(`
      DROP TABLE period;
    `);
    await queryRunner.query(`
      DROP TABLE student;
    `);
    await queryRunner.query(`
      DROP TABLE supervisor;
    `);
    await queryRunner.query(`
      DROP TABLE teacher;
    `);
    await queryRunner.query(`
      DROP TABLE workplace;
    `);
    await queryRunner.query(`
      DROP FUNCTION name_tsvector_trigger();
    `);
  }
}

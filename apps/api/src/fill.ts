import faker from 'faker';

import { bootstrap } from './server';
import Workplace from './modules/workplace/Workplace.entity';
import Address from './modules/address/Address.entity';
import Student from './modules/student/Student.entity';
import Group from './modules/group/Group.entity';
import Teacher from './modules/teacher/Teacher.entity';
import Supervisor from './modules/supervisor/Supervisor.entity';
import Period from './modules/period/Period.entity';

const main = async () => {
  await bootstrap();

  for (let i = 0; i < 60; i++) {
    const address = await Address.create({
      city: faker.address.city(),
      postal_code: faker.address.zipCode(),
      street: faker.address.streetAddress(),
    }).save();

    const workplace = await Workplace.create({
      name: faker.company.companyName(),
      description: faker.lorem.paragraph(),
      phone: faker.phone.phoneNumber(),
      url: faker.internet.url(),
      email: faker.internet.email(),
      address_id: address.id,
    }).save();

    await Supervisor.create({
      name: faker.name.findName(),
      phone: faker.phone.phoneNumber(),
      email: faker.internet.email(),
      workplace_id: workplace.id,
    }).save();
  }

  for (let i = 0; i < 10; i++) {
    await Group.create({
      name: faker.git.shortSha().toUpperCase(),
    }).save();
  }

  for (let i = 0; i < 30; i++) {
    await Teacher.create({
      name: faker.name.findName(),
      phone: faker.phone.phoneNumber(),
      email: faker.internet.email(),
      user_id: 0,
    }).save();
  }

  for (let i = 0; i < 200; i++) {
    const student = await Student.create({
      name: faker.name.findName(),
      user_id: 0,
      group_id: faker.random.number({ min: 1, max: 10, precision: 1 }),
    }).save();

    const placeId = faker.random.number({ min: 1, max: 60, precision: 1 });

    await Period.create({
      start_date: faker.date.soon(),
      end_date: faker.date.future(),
      student_id: student.id,
      supervisor_id: placeId,
      workplace_id: placeId,
      teacher_id: faker.random.number({ min: 1, max: 30, precision: 1 }),
    }).save();
  }

  setTimeout(() => process.exit(), 2000);
};

main();

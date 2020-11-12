import React, { useState } from 'react';
import {
  Container,
  createStyles,
  makeStyles,
  Toolbar,
  Typography,
  Button,
  Grid,
} from '@material-ui/core';
import { Formik, Form, FormikErrors } from 'formik';
import { useRouter } from 'next/router';

import Layout from '../../lib/Layout';
import { useGuard } from '../../hooks/useGuard';
import { useLogin } from '../../lib/LoginContext';
import { useGroupsQuery } from '../../gql/group/groups.graphql';
import { useAddStudentMutation } from '../../gql/student/addStudent.graphql';
import { useAddTeacherMutation } from '../../gql/teacher/addTeacher.graphql';
import SelectInput, { SelectItem } from '../../components/input/SelectInput';
import TextInput from '../../components/input/TextInput';
import { FormOnSubmit } from '../../lib/types';

const useStyles = makeStyles(() =>
  createStyles({
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
    },
  }),
);

interface StudentRegisterForm {
  name: string;
  group: string;
}

const StudentRegister = () => {
  const [groups, setGroups] = useState<SelectItem[]>([]);
  const { user, setComplete } = useLogin();
  useGroupsQuery({
    onCompleted: (data) => {
      setGroups(data.groups.items.map((group) => ({ name: group.name, value: group.id })));
    },
  });
  const [addStudent] = useAddStudentMutation();
  const router = useRouter();

  const submit: FormOnSubmit<StudentRegisterForm> = async (values, helpers) => {
    helpers.setSubmitting(true);
    await addStudent({ variables: values });
    helpers.setSubmitting(false);
    setComplete();
    router.push('/');
  };

  const validate = async (
    values: StudentRegisterForm,
  ): Promise<FormikErrors<StudentRegisterForm>> => {
    const errors: FormikErrors<StudentRegisterForm> = {};

    if (values.name === '') errors.name = 'Nimi ei saa olla tyhjä';
    if (values.group === '') errors.group = 'Ryhmä ei saa olla tyhjä';

    return errors;
  };

  return (
    <Formik<StudentRegisterForm>
      initialValues={{
        name: user?.name ?? '',
        group: '',
      }}
      onSubmit={submit}
      validate={validate}
    >
      {() => (
        <Form>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextInput name="name" label="Nimi" />
            </Grid>
            <Grid item xs={12}>
              <SelectInput name="group" label="Ryhmä" items={groups} />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" color="primary" fullWidth type="submit">
                Valmis
              </Button>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );
};

interface TeacherRegisterForm {
  name: string;
  email: string;
  phone: string;
}

const TeacherRegister = () => {
  const { user, setComplete } = useLogin();
  const [addTeacher] = useAddTeacherMutation();
  const router = useRouter();

  const submit: FormOnSubmit<TeacherRegisterForm> = async (values, helpers) => {
    helpers.setSubmitting(true);
    await addTeacher({ variables: values });
    helpers.setSubmitting(false);
    setComplete();
    router.push('/');
  };

  const validate = async (
    values: TeacherRegisterForm,
  ): Promise<FormikErrors<TeacherRegisterForm>> => {
    const errors: FormikErrors<TeacherRegisterForm> = {};

    if (values.name === '') errors.name = 'Nimi ei saa olla tyhjä';
    if (values.email === '') errors.email = 'Sähköposti ei saa olla tyhjä';
    if (values.phone === '') errors.phone = 'Puhelin ei saa olla tyhjä';

    return errors;
  };

  return (
    <Formik<TeacherRegisterForm>
      initialValues={{
        name: user?.name ?? '',
        email: user?.email ?? '',
        phone: '',
      }}
      onSubmit={submit}
      validate={validate}
    >
      {() => (
        <Form>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextInput name="name" label="Nimi" />
            </Grid>
            <Grid item xs={12}>
              <TextInput name="email" label="Sähköposti" />
            </Grid>
            <Grid item xs={12}>
              <TextInput name="phone" label="Puhelin" />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" color="primary" fullWidth type="submit">
                Valmis
              </Button>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );
};

const Complete = () => {
  const classes = useStyles();
  const { user } = useLogin();
  useGuard();
  const type = user?.type ?? '';

  return (
    <Layout>
      <Container maxWidth="xl" className={classes.container}>
        <Toolbar />
        <Grid container justify="center" spacing={6}>
          <Grid item xs={12}>
            <Typography component="h2" variant="h4" gutterBottom align="center">
              Viimeistele Rekisteröityminen
            </Typography>
          </Grid>
          <Grid item xs={12} sm={8} md={6} lg={5} xl={3}>
            {type === 'student' && <StudentRegister />}
            {type === 'teacher' && <TeacherRegister />}
          </Grid>
        </Grid>
      </Container>
    </Layout>
  );
};

export default Complete;

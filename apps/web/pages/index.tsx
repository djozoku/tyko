import React, { useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  Toolbar,
  createStyles,
  makeStyles,
  Button,
  Card,
  CardContent,
  Grid,
} from '@material-ui/core';
import { useApolloClient } from '@apollo/client';
import { useRouter } from 'next/router';
import { Column } from 'material-table';
import { FormikErrors, useFormikContext } from 'formik';

import Layout from '../lib/Layout';
import { useLogin } from '../lib/LoginContext';
import { useGuard } from '../hooks/useGuard';
import DataTable, { defaultMenuItems } from '../components/DataTable';
import {
  MeStudentPeriodsQuery,
  MeStudentPeriodsQueryVariables,
  MeStudentPeriodsDocument,
  useMeStudentPeriodsQuery,
} from '../gql/meStudentPeriods.graphql';
import { useIdDialog } from '../hooks/useDialog';
import FormDialog from '../components/FormDialog';
import { EditPeriod, useEditPeriodMutation } from '../gql/period/editPeriod.graphql';
import DatePickerInput from '../components/input/DatePickerInput';
import SelectInput from '../components/input/SelectInput';
import ConfirmDialog from '../components/ConfirmDialog';
import { FormOnSubmit, FormValidate, TableRef } from '../lib/types';
import { useDeletePeriodMutation } from '../gql/period/deletePeriod.graphql';
import { useStudentWithPeriodsLazyQuery } from '../gql/student/studentWithPeriods.graphql';
import { useTeachersQuery } from '../gql/teacher/teachers.graphql';

const useStyles = makeStyles(() =>
  createStyles({
    logo: {
      width: '256px',
      height: '256px',
      paddingBottom: 16,
    },
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
    },
    box: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
      margin: 20,
    },
    or: {
      marginTop: 8,
      marginBottom: 8,
    },
    moreGutter: {
      marginBottom: 24,
    },
    center: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
      height: '80vh',
    },
    card: {
      minHeight: '470px',
    },
    spacing: {
      marginBottom: '16px',
    },
  }),
);

const PeriodEditFormData = ({ id, student_id }: { id?: string; student_id?: string }) => {
  const formik = useFormikContext();
  const [load] = useStudentWithPeriodsLazyQuery({
    onCompleted: (data) => {
      Object.entries(data.student?.periods.find((period) => period.id === id) ?? {}).forEach(
        ([key, value]) => {
          formik.setFieldValue(key, value, false);
        },
      );
    },
  });
  useEffect(() => {
    load({ variables: { id: student_id ?? '' } });
  }, [id]);

  return <></>;
};

interface StudentPeriod {
  id: string;
  start_date: string;
  end_date: string;
  workplace_id: string;
  workplace: string;
}

const periodColumns: Column<StudentPeriod>[] = [
  {
    field: 'workplace',
    title: 'TJK-paikka',
  },
  {
    field: 'start_date',
    title: 'Aloitus Päivä',
  },
  {
    field: 'end_date',
    title: 'Lopetus Päivä',
  },
];

const HomepageStudent = () => {
  const router = useRouter();
  const { loggedInPromise, user } = useLogin();
  const { data: periodsData } = useMeStudentPeriodsQuery();
  const currentPeriod = periodsData?.me?.student?.periods.find(
    (p) =>
      new Date(p.start_date).getTime() < Date.now() && new Date(p.end_date).getTime() > Date.now(),
  );
  const client = useApolloClient();
  const editDialog = useIdDialog();
  const deleteDialog = useIdDialog();
  const classes = useStyles();
  const { data: teachersData } = useTeachersQuery({
    variables: { skip: 0, take: 1000 },
    fetchPolicy: 'network-only',
  });
  const [editPeriod] = useEditPeriodMutation();
  const [deletePeriod] = useDeletePeriodMutation();
  const tableRef = useRef<TableRef>(null);

  const editValidate: FormValidate<EditPeriod> = (values) => {
    const errors: FormikErrors<EditPeriod> = {};

    if (new Date(values.end_date).getTime() <= new Date(values.start_date).getTime())
      errors.end_date = 'TJK-jakso ei voi loppua ennen kuin se alkaa';

    return;
  };

  const editSubmit: FormOnSubmit<EditPeriod> = async (values, helpers) => {
    helpers.setSubmitting(true);
    await editPeriod({ variables: { ...values, id: editDialog.id } });
    helpers.setSubmitting(false);
    tableRef.current?.onQueryChange();
    editDialog.handleClose();
  };

  const deleteAction = async () => {
    await deletePeriod({ variables: { id: deleteDialog.id } });
    tableRef.current?.onQueryChange();
    deleteDialog.handleClose();
  };

  return (
    <Grid container spacing={2}>
      <Grid container item xs={12} md={6}>
        <Grid item xs={12} className={classes.spacing}>
          <Card>
            <CardContent>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={() => router.push('/workplaces')}
                  >
                    TJK-paikat
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={() => router.push('/account')}
                  >
                    Tili
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card className={classes.card}>
            <CardContent>
              <Typography component="h2" variant="h4" gutterBottom>
                Tämänhetkinen TJK-jakso
              </Typography>
              {currentPeriod ? (
                <>
                  <Typography component="p" variant="body1">
                    {currentPeriod.workplace.name}
                  </Typography>
                  <Typography component="p" variant="body1">
                    {`${new Date(currentPeriod.start_date).toLocaleDateString()} - ${new Date(
                      currentPeriod.end_date,
                    ).toLocaleDateString()}`}
                  </Typography>
                </>
              ) : (
                <Typography component="p" variant="body1">
                  Ei meneillä olevaa TJK-jaksoa
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Grid item xs={12} md={6}>
        <DataTable<StudentPeriod>
          columns={periodColumns}
          defaultSize={8}
          data={async (query) => {
            await loggedInPromise();
            const { data } = await client.query<
              MeStudentPeriodsQuery,
              MeStudentPeriodsQueryVariables
            >({
              query: MeStudentPeriodsDocument,
              fetchPolicy: 'network-only',
            });
            return {
              data:
                data.me?.student?.periods.map((p) => ({
                  id: p.id,
                  start_date: new Date(p.start_date).toLocaleDateString(),
                  end_date: new Date(p.end_date).toLocaleDateString(),
                  workplace: p.workplace.name,
                  workplace_id: p.workplace.id,
                })) ?? [],
              page: query.page,
              totalCount: data.me?.student?.periods.length ?? 0,
            };
          }}
          title="TJK-jaksot"
          emptyMsg="Ei näytettäviä TJK-jaksoja"
          onRowClick={(_e, data) => {
            router.push(`/workplaces/${data?.workplace_id}`);
          }}
          menuItems={defaultMenuItems({
            editRow: editDialog.open,
            deleteRow: deleteDialog.open,
          })}
        />
        <FormDialog<EditPeriod>
          initial={{
            start_date: new Date(),
            end_date: new Date(),
            supervisor_id: '',
            teacher_id: '',
            workplace_id: '',
          }}
          validate={editValidate}
          submit={editSubmit}
          title="Muokkaa TJK-jaksoa"
          titleId="period-edit-dialog-title"
          DataHelper={({ id }) => <PeriodEditFormData id={id} student_id={user?.student?.id} />}
          {...editDialog}
        >
          <Grid item xs={12}>
            <DatePickerInput name="start_date" label="Aloitus Päivä" />
          </Grid>
          <Grid item xs={12}>
            <DatePickerInput name="end_date" label="Lopetus Päivä" />
          </Grid>
          <Grid item xs={12}>
            <SelectInput
              name="teacher_id"
              label="Vastuuopettaja"
              items={
                teachersData?.teachers.items.map((t) => ({
                  name: t.name,
                  value: t.id,
                })) ?? []
              }
            />
          </Grid>
        </FormDialog>
        <ConfirmDialog
          action={deleteAction}
          confirm="Poista"
          confirmText="Oletko varma että haluat poistaa tämän oppilaan TJK-jakson?"
          title="Poista TJK-jakso"
          titleId="period-delete-dialog-title"
          {...deleteDialog}
        />
      </Grid>
    </Grid>
  );
};

const HomepageTeacher = () => {
  const classes = useStyles();

  return (
    <Card>
      <CardContent className={classes.center}>
        <Typography component="h2" variant="h4">
          Kertokaa mitä haluatte tähän sivulle
        </Typography>
      </CardContent>
    </Card>
  );
};

const Index = () => {
  const classes = useStyles();
  useGuard();
  const { loggedIn, login, register, completed, user } = useLogin();
  const isTeacher = user?.type === 'teacher';

  return (
    <Layout sidebar={loggedIn && completed} breadcrumbs={loggedIn && completed}>
      {loggedIn ? (
        isTeacher ? (
          <HomepageTeacher />
        ) : (
          <HomepageStudent />
        )
      ) : (
        <Container fixed className={classes.container}>
          <Toolbar />
          <Card>
            <CardContent>
              <div className={classes.box}>
                <img src="/Gradient.png" className={classes.logo} />
                <Typography gutterBottom component="h2" variant="h5" align="center">
                  Tyko
                </Typography>
                <Typography
                  component="h3"
                  variant="subtitle1"
                  align="center"
                  className={classes.moreGutter}
                >
                  TJK Hallinnointi
                </Typography>
                <Button variant="contained" color="primary" onClick={login} fullWidth>
                  Kirjaudu Sisään
                </Button>
                <br />
                <Button variant="contained" color="primary" onClick={register} fullWidth>
                  Rekisteröidy
                </Button>
              </div>
            </CardContent>
          </Card>
        </Container>
      )}
    </Layout>
  );
};

export default Index;

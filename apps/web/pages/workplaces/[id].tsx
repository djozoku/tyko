import React, { useEffect, useRef } from 'react';
import { useApolloClient } from '@apollo/client';
import { useRouter } from 'next/router';
import { FormikErrors, useFormikContext } from 'formik';
import { Column } from 'material-table';
import {
  Typography,
  createStyles,
  makeStyles,
  Card,
  CardContent,
  Grid,
  CircularProgress,
} from '@material-ui/core';

import Layout from '../../lib/Layout';
import { FormOnSubmit, FormValidate, TableRef } from '../../lib/types';
import { serverAuthHandle } from '../../lib/serverHandles';
import { useLogin } from '../../lib/LoginContext';
import { useGuard } from '../../hooks/useGuard';
import { useDialog, useIdDialog } from '../../hooks/useDialog';
import {
  useWorkplaceQuery,
  WorkplaceDocument,
  WorkplaceQuery,
  WorkplaceQueryVariables,
} from '../../gql/workplace/workplace.graphql';
import {
  StudentsByWorkplaceDocument,
  StudentsByWorkplaceQuery,
  StudentsByWorkplaceQueryVariables,
} from '../../gql/student/studentsByWorkplace.graphql';
import {
  AddSupervisor,
  useAddSupervisorMutation,
} from '../../gql/supervisor/addSupervisor.graphql';
import {
  EditSupervisor,
  useEditSupervisorMutation,
} from '../../gql/supervisor/editSupervisor.graphql';
import { useDeleteSupervisorMutation } from '../../gql/supervisor/deleteSupervisor.graphql';
import { useSupervisorLazyQuery } from '../../gql/supervisor/supervisor.graphql';
import { AddPeriod, useAddPeriodMutation } from '../../gql/period/addPeriod.graphql';
import { EditPeriod, useEditPeriodMutation } from '../../gql/period/editPeriod.graphql';
import { useDeletePeriodMutation } from '../../gql/period/deletePeriod.graphql';
import { useStudentWithPeriodsLazyQuery } from '../../gql/student/studentWithPeriods.graphql';
import { useTeachersQuery } from '../../gql/teacher/teachers.graphql';
import { useStudentsQuery } from '../../gql/student/students.graphql';
import DataTable, { defaultMenuItems } from '../../components/DataTable';
import ConfirmDialog from '../../components/ConfirmDialog';
import FormDialog from '../../components/FormDialog';
import Link from '../../components/Link';
import DatePickerInput from '../../components/input/DatePickerInput';
import SelectInput from '../../components/input/SelectInput';
import TextInput from '../../components/input/TextInput';

const useStyles = makeStyles(() =>
  createStyles({
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
    },
    card: {
      flexGrow: 1,
      minHeight: '360px',
    },
    workplaceInfo: {
      marginBottom: '16px',
    },
  }),
);

interface SupervisorInfo {
  id: string;
  name: string;
}

const supervisorColumns = [
  {
    field: 'name',
    title: 'Nimi',
  },
  {
    field: 'email',
    title: 'Sähköposti',
  },
  {
    field: 'phone',
    title: 'Puhelinnumero',
  },
];

const SupervisorEditFormData = ({ id }: { id?: string }) => {
  const formik = useFormikContext();
  const [load] = useSupervisorLazyQuery({
    onCompleted: (data) => {
      Object.entries(data?.supervisor ?? {}).forEach(([key, value]) => {
        formik.setFieldValue(key, value, false);
      });
    },
  });
  useEffect(() => {
    load({ variables: { id: id ?? '' } });
  }, [id]);

  return <></>;
};

const SupervisorTable = () => {
  const router = useRouter();
  const id = router.query.id as string;
  const { loggedInPromise, user } = useLogin();
  const isTeacher = user?.type === 'teacher';
  const client = useApolloClient();
  const addDialog = useDialog();
  const editDialog = useIdDialog();
  const deleteDialog = useIdDialog();
  const [addSupervisor] = useAddSupervisorMutation();
  const [editSupervisor] = useEditSupervisorMutation();
  const [deleteSupervisor] = useDeleteSupervisorMutation();
  const tableRef = useRef<TableRef>(null);

  const addValidate: FormValidate<AddSupervisor> = (values) => {
    const errors: FormikErrors<AddSupervisor> = {};

    if (values.name.trim() === '') errors.name = 'Nimi ei voi olla tyhjä';
    if (values.email.trim() === '') errors.email = 'Sähköposti ei voi olla tyhjä';
    if (values.phone.trim() === '') errors.phone = 'Puhelinnumero ei voi olla tyhjä';

    return errors;
  };

  const addSubmit: FormOnSubmit<AddSupervisor> = async (values, helpers) => {
    helpers.setSubmitting(true);
    await addSupervisor({ variables: { ...values, workplace_id: id } });
    helpers.setSubmitting(false);
    tableRef.current?.onQueryChange();
    addDialog.handleClose();
  };

  const editValidate: FormValidate<EditSupervisor> = (values) => {
    const errors: FormikErrors<EditSupervisor> = {};

    if (values.name.trim() === '') errors.name = 'Nimi ei voi olla tyhjä';
    if (values.email.trim() === '') errors.email = 'Sähköposti ei voi olla tyhjä';
    if (values.phone.trim() === '') errors.phone = 'Puhelinnumero ei voi olla tyhjä';

    return;
  };

  const editSubmit: FormOnSubmit<EditSupervisor> = async (values, helpers) => {
    helpers.setSubmitting(true);
    await editSupervisor({ variables: { ...values, id: editDialog.id } });
    helpers.setSubmitting(false);
    tableRef.current?.onQueryChange();
    editDialog.handleClose();
  };

  const deleteAction = async () => {
    await deleteSupervisor({ variables: { id: deleteDialog.id } });
    tableRef.current?.onQueryChange();
    deleteDialog.handleClose();
  };

  return (
    <>
      <DataTable<SupervisorInfo>
        columns={supervisorColumns}
        defaultSize={5}
        data={async (query) => {
          await loggedInPromise();
          const { data } = await client.query<WorkplaceQuery, WorkplaceQueryVariables>({
            query: WorkplaceDocument,
            variables: {
              id,
            },
            fetchPolicy: 'network-only',
          });
          return {
            data: data.workplace?.supervisors.map((s) => ({ ...s })) ?? [],
            page: query.page,
            totalCount: data.workplace?.supervisors.length ?? 0,
          };
        }}
        title="Ohjaajat"
        emptyMsg="Ei näytettäviä ohjaajia"
        tableRef={tableRef}
        addRow={addDialog.open}
        menuItems={defaultMenuItems({
          editRow: editDialog.open,
          deleteRow: isTeacher ? deleteDialog.open : undefined,
        })}
      />
      <FormDialog<AddSupervisor>
        initial={{
          name: '',
          email: '',
          phone: '',
          workplace_id: '',
        }}
        validate={addValidate}
        submit={addSubmit}
        title="Lisää ohjaaja"
        titleId="supervisor-add-dialog-title"
        {...addDialog}
      >
        {supervisorColumns.map((c) => (
          <Grid item xs={12} key={c.field}>
            <TextInput name={c.field} label={c.title} />
          </Grid>
        ))}
      </FormDialog>
      <FormDialog<EditSupervisor>
        initial={{
          name: '',
          email: '',
          phone: '',
        }}
        validate={editValidate}
        submit={editSubmit}
        title="Muokkaa ohjaajaa"
        titleId="supervisor-edit-dialog-title"
        DataHelper={SupervisorEditFormData}
        {...editDialog}
      >
        {supervisorColumns.map((c) => (
          <Grid item xs={12} key={c.field}>
            <TextInput name={c.field} label={c.title} />
          </Grid>
        ))}
      </FormDialog>
      <ConfirmDialog
        action={deleteAction}
        confirm="Poista"
        confirmText="Oletko varma että haluat poistaa tämän ohjaajan?"
        title="Poista Ohjaaja"
        titleId="supervisor-delete-dialog-title"
        {...deleteDialog}
      />
    </>
  );
};

interface StudentInfo {
  id: string;
  name: string;
  start_date: string;
}

const studentColumns: Column<StudentInfo>[] = [
  {
    field: 'name',
    title: 'Nimi',
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

type PeriodAdd = Omit<AddPeriod, 'workplace_id'> & { student_id: string };

type PeriodEdit = Omit<EditPeriod, 'workplace_id'>;

const PeriodEditFormData = ({ id, workplace_id }: { id?: string; workplace_id?: string }) => {
  const formik = useFormikContext();
  const [load] = useStudentWithPeriodsLazyQuery({
    onCompleted: (data) => {
      Object.entries(
        data?.student?.periods.filter((period) => period.workplace_id === workplace_id) ?? {},
      ).forEach(([key, value]) => {
        formik.setFieldValue(key, value, false);
      });
    },
  });
  useEffect(() => {
    load({ variables: { id: id ?? '' } });
  }, [id]);

  return <></>;
};

const StudentPeriodTable = () => {
  const router = useRouter();
  const workplace_id = router.query.id as string;
  const { loggedInPromise, user } = useLogin();
  const isTeacher = user?.type === 'teacher';
  const client = useApolloClient();
  const addDialog = useDialog();
  const editDialog = useIdDialog();
  const deleteDialog = useIdDialog();
  const { data: workplaceData } = useWorkplaceQuery({
    variables: { id: workplace_id },
  });
  const { data: teachersData } = useTeachersQuery({
    variables: { skip: 0, take: 1000 },
    fetchPolicy: 'network-only',
  });
  const { data: studentsData } = useStudentsQuery({
    variables: { skip: 0, take: 20000 },
    fetchPolicy: 'network-only',
  });
  const [addPeriod] = useAddPeriodMutation();
  const [editPeriod] = useEditPeriodMutation();
  const [deletePeriod] = useDeletePeriodMutation();
  const tableRef = useRef<TableRef>(null);

  const addValidate: FormValidate<PeriodAdd> = (values) => {
    const errors: FormikErrors<PeriodAdd> = {};

    if (new Date(values.end_date).getTime() <= new Date(values.start_date).getTime())
      errors.end_date = 'TJK-jakso ei voi loppua ennen kuin se alkaa';
    if (values.supervisor_id === '') errors.supervisor_id = 'Ohjaaja ei voi olla tyhjä';
    if (values.teacher_id === '') errors.teacher_id = 'Vastuuopettaja ei voi olla tyhjä';
    if (isTeacher && values.student_id === '') errors.student_id = 'Oppilas ei voi olla tyhjä';

    return errors;
  };

  const addSubmit: FormOnSubmit<PeriodAdd> = async (values, helpers) => {
    const { start_date, end_date, supervisor_id, teacher_id, student_id } = values;
    helpers.setSubmitting(true);
    await addPeriod({
      variables: {
        start_date,
        end_date,
        supervisor_id,
        teacher_id,
        id: isTeacher ? student_id : user?.student?.id ?? '',
        workplace_id,
      },
    });
    helpers.setSubmitting(false);
    tableRef.current?.onQueryChange();
    addDialog.handleClose();
  };

  const editValidate: FormValidate<PeriodEdit> = (values) => {
    const errors: FormikErrors<PeriodEdit> = {};

    if (new Date(values.end_date).getTime() <= new Date(values.start_date).getTime())
      errors.end_date = 'TJK-jakso ei voi loppua ennen kuin se alkaa';

    return;
  };

  const editSubmit: FormOnSubmit<PeriodEdit> = async (values, helpers) => {
    helpers.setSubmitting(true);
    await editPeriod({ variables: { ...values, id: editDialog.id, workplace_id } });
    helpers.setSubmitting(false);
    tableRef.current?.onQueryChange();
    editDialog.handleClose();
  };

  const deleteAction = async () => {
    await deletePeriod({ variables: { id: deleteDialog.id } });
    tableRef.current?.onQueryChange();
    deleteDialog.handleClose();
  };

  const PeriodFields = () => (
    <>
      {' '}
      <Grid item xs={12}>
        <DatePickerInput name="start_date" label="Aloitus Päivä" />
      </Grid>
      <Grid item xs={12}>
        <DatePickerInput name="end_date" label="Lopetus Päivä" />
      </Grid>
      <Grid item xs={12}>
        <SelectInput
          name="supervisor_id"
          label="Ohjaaja"
          items={
            workplaceData?.workplace?.supervisors.map((s) => ({
              name: s.name,
              value: s.id,
            })) ?? []
          }
        />
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
    </>
  );

  return (
    <>
      <DataTable<StudentInfo>
        columns={studentColumns}
        defaultSize={12}
        data={async (query) => {
          await loggedInPromise();
          const { data } = await client.query<
            StudentsByWorkplaceQuery,
            StudentsByWorkplaceQueryVariables
          >({
            query: StudentsByWorkplaceDocument,
            variables: {
              id: workplace_id,
              skip: query.page * query.pageSize,
              take: query.pageSize,
            },
            fetchPolicy: 'network-only',
          });
          return {
            data: data.students.items.map((s) => {
              const p = s.periods.find(
                (period) => period.workplace_id?.toString() === workplace_id,
              );
              return {
                id: s.id,
                name: s.name,
                start_date: new Date(p?.start_date ?? '').toLocaleDateString(),
                end_date: new Date(p?.end_date ?? '').toLocaleDateString(),
              };
            }),
            page: query.page,
            totalCount: data.students.total,
          };
        }}
        tableRef={tableRef}
        title="Opiskelijat"
        emptyMsg="Ei näytettäviä oppilaita"
        onRowClick={(_e, data) => {
          router.push(`/students/${data?.id}`);
        }}
        addRow={addDialog.open}
        menuItems={defaultMenuItems(
          isTeacher
            ? {
                editRow: editDialog.open,
                deleteRow: deleteDialog.open,
              }
            : {},
        )}
      />
      <FormDialog<PeriodAdd>
        initial={{
          start_date: new Date(),
          end_date: new Date(),
          supervisor_id: '',
          teacher_id: '',
          student_id: '',
        }}
        validate={addValidate}
        submit={addSubmit}
        title="Lisää TJK-jakso"
        titleId="period-add-dialog-title"
        {...addDialog}
      >
        <PeriodFields />
        {isTeacher && (
          <Grid item xs={12}>
            <SelectInput
              name="student_id"
              label="Oppilas"
              items={
                studentsData?.students.items.map((s) => ({
                  name: s.name,
                  value: s.id,
                })) ?? []
              }
            />
          </Grid>
        )}
      </FormDialog>
      <FormDialog<PeriodEdit>
        initial={{
          start_date: new Date(),
          end_date: new Date(),
          supervisor_id: '',
          teacher_id: '',
        }}
        validate={editValidate}
        submit={editSubmit}
        title="Muokkaa TJK-jaksoa"
        titleId="period-edit-dialog-title"
        DataHelper={({ id }) => <PeriodEditFormData id={id} workplace_id={workplace_id} />}
        {...editDialog}
      >
        <PeriodFields />
      </FormDialog>
      <ConfirmDialog
        action={deleteAction}
        confirm="Poista"
        confirmText="Oletko varma että haluat poistaa tämän oppilaan TJK-jakson?"
        title="Poista TJK-jakso"
        titleId="period-delete-dialog-title"
        {...deleteDialog}
      />
    </>
  );
};

const WorkplaceID = () => {
  const router = useRouter();
  const id = router.query.id as string;
  const { data } = useWorkplaceQuery({ variables: { id } });
  const classes = useStyles();
  useGuard();

  return (
    <Layout sidebar breadcrumb={data?.workplace?.name ?? id} title={data?.workplace?.name}>
      <Grid container spacing={2}>
        <Grid item container xs={12} md={6}>
          <Grid item xs={12} className={classes.workplaceInfo}>
            <Card className={classes.card}>
              <CardContent>
                {!data && (
                  <div
                    style={{
                      minHeight: '320px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CircularProgress />
                  </div>
                )}
                {data && (
                  <>
                    <Typography component="h2" variant="h4" gutterBottom>
                      {data.workplace?.name}
                    </Typography>
                    <Typography component="p" variant="body1" gutterBottom>
                      {data.workplace?.description}
                    </Typography>
                    <Typography component="p" variant="subtitle2">
                      Puhelinnumero
                    </Typography>
                    <Typography component="p" variant="body1" gutterBottom>
                      {data.workplace?.phone}
                    </Typography>
                    <Typography component="p" variant="subtitle2">
                      Sähköposti
                    </Typography>
                    <Typography component="p" variant="body1" gutterBottom>
                      {data.workplace?.email}
                    </Typography>
                    {data.workplace?.url && (
                      <>
                        <Typography component="p" variant="subtitle2">
                          URL
                        </Typography>
                        <Typography component="p" variant="body1" gutterBottom>
                          <Link
                            color="inherit"
                            target="_blank"
                            rel="noreferrer"
                            href={data.workplace.url}
                          >
                            {data.workplace.url}
                          </Link>
                        </Typography>
                      </>
                    )}
                    <Typography component="p" variant="subtitle2">
                      Osoite
                    </Typography>
                    <Typography component="p" variant="body1">
                      {data.workplace?.address.street}
                    </Typography>
                    <Typography component="p" variant="body1">
                      {data.workplace?.address.postal_code} {data.workplace?.address.city}
                    </Typography>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <SupervisorTable />
          </Grid>
        </Grid>
        <Grid item xs={12} md={6}>
          <StudentPeriodTable />
        </Grid>
      </Grid>
    </Layout>
  );
};

export const getServerSideProps = serverAuthHandle;

export default WorkplaceID;

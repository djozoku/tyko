import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  createStyles,
  makeStyles,
  Theme,
} from '@material-ui/core';
import { useApolloClient } from '@apollo/client';
import { FormikErrors, useFormikContext } from 'formik';
import { Column } from 'material-table';

import Layout from '../../lib/Layout';
import { serverAuthHandle } from '../../lib/serverHandles';
import { useGuard } from '../../hooks/useGuard';
import LoadingCard from '../../components/LoadingCard';
import { useTeacherQuery } from '../../gql/teacher/teacher.graphql';
import {
  PeriodsByTeacherQuery,
  PeriodsByTeacherQueryVariables,
  PeriodsByTeacherDocument,
} from '../../gql/period/periodsByTeacher.graphql';
import DataTable, { defaultMenuItems } from '../../components/DataTable';
import ConfirmDialog from '../../components/ConfirmDialog';
import FormDialog from '../../components/FormDialog';
import DatePickerInput from '../../components/input/DatePickerInput';
import SelectInput from '../../components/input/SelectInput';
import { useDeletePeriodMutation } from '../../gql/period/deletePeriod.graphql';
import { EditPeriod, useEditPeriodMutation } from '../../gql/period/editPeriod.graphql';
import { useTeachersQuery } from '../../gql/teacher/teachers.graphql';
import { useDialog, useIdDialog } from '../../hooks/useDialog';
import { useLogin } from '../../lib/LoginContext';
import { TableRef, FormValidate, FormOnSubmit } from '../../lib/types';
import { useStudentWithPeriodsLazyQuery } from '../../gql/student/studentWithPeriods.graphql';

const useStyles = makeStyles((theme: Theme) =>
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
    infoCard: {
      [theme.breakpoints.down('xs')]: {
        marginBottom: '40px',
      },
      [theme.breakpoints.up('sm')]: {
        marginBottom: '16px',
      },
    },
  }),
);

const PeriodEditFormData = ({ id }: { id?: string }) => {
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
    load({ variables: { id: id ?? '' } });
  }, [id]);

  return <></>;
};

interface StudentInfo {
  id: string;
  student: string;
  student_id: string;
  workplace: string;
  workplace_id: string;
  start_date: string;
  end_date: string;
}

const studentColumns: Column<StudentInfo>[] = [
  {
    field: 'student',
    title: 'Oppilas',
  },
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

const StudentPeriodTable = () => {
  const router = useRouter();
  const teacher_id = router.query.id as string;
  const { loggedInPromise, user } = useLogin();
  const isTeacher = user?.type === 'teacher';
  const client = useApolloClient();
  const addDialog = useDialog();
  const editDialog = useIdDialog();
  const deleteDialog = useIdDialog();
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
    <>
      <DataTable<StudentInfo>
        columns={studentColumns}
        defaultSize={12}
        data={async (query) => {
          await loggedInPromise();
          const { data } = await client.query<
            PeriodsByTeacherQuery,
            PeriodsByTeacherQueryVariables
          >({
            query: PeriodsByTeacherDocument,
            variables: {
              teacher_id,
              skip: query.page * query.pageSize,
              take: query.pageSize,
            },
            fetchPolicy: 'network-only',
          });
          return {
            data: data.periods.items.map((period) => ({
              id: period.id,
              student: period.student.name,
              student_id: period.student.id,
              start_date: new Date(period.start_date ?? '').toLocaleDateString(),
              end_date: new Date(period.end_date ?? '').toLocaleDateString(),
              workplace: period.workplace.name,
              workplace_id: period.workplace.id,
            })),
            page: query.page,
            totalCount: data.periods.total,
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
        DataHelper={PeriodEditFormData}
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
    </>
  );
};

const TeacherID = () => {
  const router = useRouter();
  const id = router.query.id as string;
  const { data } = useTeacherQuery({ variables: { id } });
  const classes = useStyles();
  useGuard();

  return (
    <Layout sidebar breadcrumb={data?.teacher?.name ?? id} title={data?.teacher?.name}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card className={classes.card}>
            <CardContent>
              {!data && <LoadingCard />}
              {data && (
                <>
                  <Typography component="h2" variant="h4" gutterBottom>
                    {data.teacher?.name}
                  </Typography>
                  <div style={{ height: '24px' }} />
                  <Typography component="p" variant="subtitle2">
                    Puhelinnumero
                  </Typography>
                  <Typography component="p" variant="body1" gutterBottom>
                    {data.teacher?.phone}
                  </Typography>
                  <Typography component="p" variant="subtitle2">
                    Sähköposti
                  </Typography>
                  <Typography component="p" variant="body1" gutterBottom>
                    {data.teacher?.email}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <StudentPeriodTable />
        </Grid>
      </Grid>
    </Layout>
  );
};

export const getServerSideProps = serverAuthHandle;

export default TeacherID;

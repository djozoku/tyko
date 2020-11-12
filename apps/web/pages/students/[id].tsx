import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import {
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Typography,
  createStyles,
  makeStyles,
  Theme,
} from '@material-ui/core';
import PersonIcon from '@material-ui/icons/Person';
import { FormikErrors, useFormikContext } from 'formik';
import { useApolloClient } from '@apollo/client';
import { Column } from 'material-table';

import Layout from '../../lib/Layout';
import { useGuard } from '../../hooks/useGuard';
import { serverAuthHandle } from '../../lib/serverHandles';
import {
  StudentDocument,
  StudentQuery,
  StudentQueryVariables,
  useStudentQuery,
} from '../../gql/student/student.graphql';
import DataTable, {
  DefaultMenuItems,
  defaultMenuItems,
  MenuItem,
  RowAction,
} from '../../components/DataTable';
import DatePickerInput from '../../components/input/DatePickerInput';
import SelectInput from '../../components/input/SelectInput';
import { FormOnSubmit, FormValidate, TableRef } from '../../lib/types';
import { useLogin } from '../../lib/LoginContext';
import { useIdDialog } from '../../hooks/useDialog';
import { useTeachersQuery } from '../../gql/teacher/teachers.graphql';
import { EditPeriod, useEditPeriodMutation } from '../../gql/period/editPeriod.graphql';
import { useDeletePeriodMutation } from '../../gql/period/deletePeriod.graphql';
import { useStudentWithPeriodsLazyQuery } from '../../gql/student/studentWithPeriods.graphql';
import FormDialog from '../../components/FormDialog';
import ConfirmDialog from '../../components/ConfirmDialog';

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

interface PeriodMenuItems extends DefaultMenuItems {
  goToTeacher: RowAction;
}

const periodMenuItems = ({ goToTeacher, ...items }: PeriodMenuItems): MenuItem[] => {
  return [
    {
      text: 'Vastuuopettaja',
      icon: () => <PersonIcon />,
      action: goToTeacher,
    },
    ...defaultMenuItems(items),
  ];
};

interface StudentInfo {
  id: string;
  workplace: string;
  workplace_id: string;
  start_date: string;
  end_date: string;
  teacher: string;
  teacher_id: string;
}

const studentColumns: Column<StudentInfo>[] = [
  {
    field: 'workplace',
    title: 'TJK-paikka',
  },
  {
    field: 'teacher',
    title: 'Vastuuopettaja',
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

type PeriodEdit = Omit<EditPeriod, 'workplace_id'>;

const PeriodEditFormData = ({ id }: { id?: string }) => {
  const formik = useFormikContext();
  const [load] = useStudentWithPeriodsLazyQuery({
    onCompleted: (data) => {
      Object.entries(data.student?.periods.find((period) => period.id === id) ?? {}).forEach(
        ([key, value]) => {
          console.log(key, value);
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

const StudentPeriodTable = ({ student_id }: { student_id: string }) => {
  const router = useRouter();
  const workplace_id = router.query.id as string;
  const { loggedInPromise, user } = useLogin();
  const isTeacher = user?.type === 'teacher';
  const client = useApolloClient();
  const editDialog = useIdDialog();
  const deleteDialog = useIdDialog();
  const { data: studentData } = useStudentQuery({
    variables: { id: student_id },
  });
  const { data: teachersData } = useTeachersQuery({
    variables: { skip: 0, take: 1000 },
    fetchPolicy: 'network-only',
  });
  const [editPeriod] = useEditPeriodMutation();
  const [deletePeriod] = useDeletePeriodMutation();
  const tableRef = useRef<TableRef>(null);

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

  const goToTeacher = (id: string) => {
    const teacher_id = studentData?.student?.periods.find((period) => period.id === id)?.teacher.id;
    router.push(`/teachers/${teacher_id}`);
  };

  return (
    <>
      <DataTable<StudentInfo>
        columns={studentColumns}
        defaultSize={12}
        data={async (query) => {
          await loggedInPromise();
          try {
            const { data } = await client.query<StudentQuery, StudentQueryVariables>({
              query: StudentDocument,
              variables: {
                id: student_id,
              },
              fetchPolicy: 'network-only',
            });
            const periods = data.student?.periods ?? [];
            return {
              data:
                periods.map((p) => ({
                  id: p.id,
                  workplace: p.workplace.name,
                  workplace_id: p.workplace.id,
                  start_date: new Date(p.start_date ?? '').toLocaleDateString(),
                  end_date: new Date(p.end_date ?? '').toLocaleDateString(),
                  teacher: p.teacher.name,
                  teacher_id: p.teacher.id,
                })) ?? [],
              page: query.page,
              totalCount: periods.length,
            };
          } catch (err) {
            console.log(err);
            throw err;
          }
        }}
        tableRef={tableRef}
        title="TJK-jaksot"
        emptyMsg="Ei näytettäviä TJK-jaksoja"
        onRowClick={(_e, data) => {
          router.push(`/workplaces/${data?.id}`);
        }}
        menuItems={periodMenuItems({
          goToTeacher,
          editRow: isTeacher ? editDialog.open : undefined,
          deleteRow: isTeacher ? deleteDialog.open : undefined,
        })}
      />
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

const StudentID = () => {
  const router = useRouter();
  const id = router.query.id as string;
  const { data } = useStudentQuery({ variables: { id } });
  const classes = useStyles();
  useGuard();

  return (
    <Layout sidebar breadcrumb={data?.student?.name ?? id} title={data?.student?.name}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
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
                    {data.student?.name}
                  </Typography>
                  <div style={{ height: '24px' }} />
                  <Typography component="p" variant="subtitle2">
                    Ryhmä
                  </Typography>
                  <Typography component="p" variant="body1" gutterBottom>
                    {data.student?.group.name}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <StudentPeriodTable student_id={id} />
        </Grid>
      </Grid>
    </Layout>
  );
};

export const getServerSideProps = serverAuthHandle;

export default StudentID;

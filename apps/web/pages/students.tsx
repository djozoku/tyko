import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useApolloClient } from '@apollo/client';
import { FormikErrors, useFormikContext } from 'formik';
import { Grid } from '@material-ui/core';

import Layout from '../lib/Layout';
import DataTable, { defaultMenuItems } from '../components/DataTable';
import FormDialog from '../components/FormDialog';
import ConfirmDialog from '../components/ConfirmDialog';
import TextInput from '../components/input/TextInput';
import SelectInput from '../components/input/SelectInput';
import { useGuard } from '../hooks/useGuard';
import { useLogin } from '../lib/LoginContext';
import { FormOnSubmit, FormValidate } from '../lib/types';
import { useGroupsQuery } from '../gql/group/groups.graphql';
import { serverQueryHandle } from '../lib/serverHandles';
import { useIdDialog } from '../hooks/useDialog';
import {
  StudentsDocument,
  StudentsQuery,
  StudentsQueryVariables,
} from '../gql/student/students.graphql';
import { useStudentLazyQuery } from '../gql/student/student.graphql';
import { useEditStudentMutation, EditStudent } from '../gql/student/editStudent.graphql';
import { useDeleteStudentMutation } from '../gql/student/deleteStudent.graphql';

const columns = [
  {
    title: 'Nimi',
    field: 'name',
  },
];

const StudentEditFormData = ({ id }: { id?: string }) => {
  const formik = useFormikContext();
  const [load] = useStudentLazyQuery({
    onCompleted: (data) => {
      Object.entries(data?.student ?? {}).forEach(([key, value]) => {
        formik.setFieldValue(key, value, false);
      });
    },
  });
  useEffect(() => {
    load({ variables: { id: id ?? '' } });
  }, [id]);

  return <></>;
};

interface StudentInfo {
  id: string;
  name: string;
}

const Students = () => {
  const { loggedInPromise, user } = useLogin();
  const isTeacher = user?.type === 'teacher';
  const client = useApolloClient();
  useGuard();
  const router = useRouter();
  const editDialog = useIdDialog();
  const deleteDialog = useIdDialog();
  const [editStudent] = useEditStudentMutation();
  const [deleteStudent] = useDeleteStudentMutation();
  const { data } = useGroupsQuery();

  const editSubmit: FormOnSubmit<EditStudent> = async (values, helpers) => {
    helpers.setSubmitting(true);
    await editStudent({ variables: { ...values, id: editDialog.id } });
    helpers.setSubmitting(false);
    editDialog.handleClose();
  };

  const editValidate: FormValidate<EditStudent> = (values) => {
    const errors: FormikErrors<EditStudent> = {};

    if (values.name.trim() === '') errors.name = 'Nimi ei voi olla tyhjä';
    if (values.group_id.trim() === '') errors.name = 'Ryhmä ei voi olla tyhjä';

    return;
  };

  const deleteAction = async () => {
    await deleteStudent({ variables: { id: deleteDialog.id } });
    deleteDialog.handleClose();
  };

  return (
    <Layout title="Opiskelijat">
      <DataTable<StudentInfo>
        columns={columns}
        data={async (query) => {
          await loggedInPromise();
          try {
            const { data } = await client.query<StudentsQuery, StudentsQueryVariables>({
              query: StudentsDocument,
              variables: {
                skip: query.page * query.pageSize,
                take: query.pageSize,
              },
              fetchPolicy: 'network-only',
            });
            return {
              data: data.students.items.map((g) => ({ ...g })),
              page: query.page,
              totalCount: data.students.total,
            };
          } catch (err) {
            console.log(err);
            throw err;
          }
        }}
        title="Opiskelijat"
        emptyMsg="Ei näytettäviä oppilaita"
        onRowClick={(_e, data) => {
          router.push(`/students/${data?.id}`);
        }}
        menuItems={defaultMenuItems(
          isTeacher
            ? {
                editRow: editDialog.open,
                deleteRow: deleteDialog.open,
              }
            : {},
        )}
      />
      <FormDialog<EditStudent>
        initial={{
          name: '',
          group_id: '',
        }}
        validate={editValidate}
        submit={editSubmit}
        title="Muokkaa Oppilasta"
        titleId="student-edit-dialog-title"
        DataHelper={StudentEditFormData}
        {...editDialog}
      >
        {columns.map((c) => (
          <Grid item xs={12} key={c.field}>
            <TextInput name={c.field} label={c.title} />
          </Grid>
        ))}
        <Grid item xs={12}>
          <SelectInput
            name="group_id"
            label="Ryhmä"
            items={data?.groups.items.map((g) => ({ name: g.name, value: g.id })) ?? []}
          />
        </Grid>
      </FormDialog>
      <ConfirmDialog
        action={deleteAction}
        confirm="Poista"
        confirmText="Oletko varma että haluat poistaa tämän oppilaan?"
        title="Poista Oppilas"
        titleId="student-delete-dialog-title"
        {...deleteDialog}
      />
    </Layout>
  );
};

export const getServerSideProps = serverQueryHandle(StudentsDocument);

export default Students;

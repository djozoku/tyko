import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useApolloClient } from '@apollo/client';
import { FormikErrors, useFormikContext } from 'formik';
import { Grid } from '@material-ui/core';

import Layout from '../../lib/Layout';
import DataTable, { defaultMenuItems } from '../../components/DataTable';
import FormDialog from '../../components/FormDialog';
import ConfirmDialog from '../../components/ConfirmDialog';
import TextInput from '../../components/input/TextInput';
import SelectInput from '../../components/input/SelectInput';
import { useGuard } from '../../hooks/useGuard';
import { useLogin } from '../../lib/LoginContext';
import { FormOnSubmit, FormValidate } from '../../lib/types';
import { serverAuthHandle } from '../../lib/serverHandles';
import { useIdDialog } from '../../hooks/useDialog';
import { useGroupsQuery } from '../../gql/group/groups.graphql';
import { useStudentLazyQuery } from '../../gql/student/student.graphql';
import { useEditStudentMutation, EditStudent } from '../../gql/student/editStudent.graphql';
import { useDeleteStudentMutation } from '../../gql/student/deleteStudent.graphql';
import {
  StudentsByGroupDocument,
  StudentsByGroupQuery,
  StudentsByGroupQueryVariables,
} from '../../gql/student/studentsByGroup.graphql';
import { useGroupQuery } from '../../gql/group/group.graphql';

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
      formik.setFieldValue('name', data.student?.name ?? '');
      formik.setFieldValue('group_id', data.student?.group.id);
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

const GroupID = () => {
  const { loggedInPromise, user } = useLogin();
  const isTeacher = user?.type === 'teacher';
  const client = useApolloClient();
  useGuard();
  const router = useRouter();
  const group_id = router.query.id as string;
  const { data } = useGroupQuery({ variables: { id: group_id } });
  const editDialog = useIdDialog();
  const deleteDialog = useIdDialog();
  const [editStudent] = useEditStudentMutation();
  const [deleteStudent] = useDeleteStudentMutation();
  const { data: groupsData } = useGroupsQuery();

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
    <Layout title={data?.group?.name} breadcrumb={data?.group?.name ?? group_id}>
      <DataTable<StudentInfo>
        columns={columns}
        data={async (query) => {
          await loggedInPromise();
          const { data } = await client.query<StudentsByGroupQuery, StudentsByGroupQueryVariables>({
            query: StudentsByGroupDocument,
            variables: {
              skip: query.page * query.pageSize,
              take: query.pageSize,
              group_id,
            },
            fetchPolicy: 'network-only',
          });
          return {
            data: data.students.items.map((g) => ({ ...g })),
            page: query.page,
            totalCount: data.students.total,
          };
        }}
        title={data?.group?.name ?? 'Opiskelijat'}
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
        <Grid item xs={12}>
          <TextInput name="name" label="Nimi" />
        </Grid>
        <Grid item xs={12}>
          <SelectInput
            name="group_id"
            label="Ryhmä"
            items={groupsData?.groups.items.map((g) => ({ name: g.name, value: g.id })) ?? []}
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

export const getServerSideProps = serverAuthHandle;

export default GroupID;

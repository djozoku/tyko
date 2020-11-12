import { useApolloClient } from '@apollo/client';
import { useRouter } from 'next/router';
import React from 'react';

import Layout from '../lib/Layout';
import DataTable, { defaultMenuItems } from '../components/DataTable';
import { useGuard } from '../hooks/useGuard';
import { useLogin } from '../lib/LoginContext';
import {
  TeachersDocument,
  TeachersQuery,
  TeachersQueryVariables,
} from '../gql/teacher/teachers.graphql';
import { useDeleteTeacherMutation } from '../gql/teacher/deleteTeacher.graphql';
import ConfirmDialog from '../components/ConfirmDialog';
import { serverQueryHandle } from '../lib/serverHandles';
import { useIdDialog } from '../hooks/useDialog';

const columns = [
  {
    title: 'Nimi',
    field: 'name',
  },
];

interface TeacherInfo {
  id: string;
  name: string;
}

const Teachers = () => {
  const { loggedInPromise, user } = useLogin();
  const isTeacher = user?.type === 'teacher';
  const client = useApolloClient();
  useGuard();
  const router = useRouter();
  const deleteDialog = useIdDialog();
  const [deleteTeacher] = useDeleteTeacherMutation();

  const deleteAction = async () => {
    await deleteTeacher({ variables: { id: deleteDialog.id } });
    deleteDialog.handleClose();
  };

  return (
    <Layout title="Vastuuopettajat">
      <DataTable<TeacherInfo>
        columns={columns}
        data={async (query) => {
          await loggedInPromise();
          const { data } = await client.query<TeachersQuery, TeachersQueryVariables>({
            query: TeachersDocument,
            variables: {
              skip: query.page * query.pageSize,
              take: query.pageSize,
            },
            fetchPolicy: 'network-only',
          });
          return {
            data: data.teachers.items.map((g) => ({ ...g })),
            page: query.page,
            totalCount: data.teachers.total,
          };
        }}
        title="Vastuuopettajat"
        emptyMsg="Ei näytettäviä opettajia"
        onRowClick={(_e, data) => {
          router.push(`/teachers/${data?.id}`);
        }}
        menuItems={defaultMenuItems({
          deleteRow: isTeacher ? deleteDialog.open : undefined,
        })}
      />
      <ConfirmDialog
        action={deleteAction}
        confirm="Poista"
        confirmText="Oletko varma että haluat poistaa tämän opettajan?"
        title="Poista Opettaja"
        titleId="teacher-delete-dialog-title"
        {...deleteDialog}
      />
    </Layout>
  );
};

export const getServerSideProps = serverQueryHandle(TeachersDocument);

export default Teachers;

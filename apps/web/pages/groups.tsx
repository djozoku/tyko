import { useApolloClient } from '@apollo/client';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { Grid } from '@material-ui/core';
import { FormikErrors, useFormikContext } from 'formik';

import Layout from '../lib/Layout';
import DataTable, { defaultMenuItems } from '../components/DataTable';
import { useGuard } from '../hooks/useGuard';
import { useLogin } from '../lib/LoginContext';
import { GroupsDocument, GroupsQuery, GroupsQueryVariables } from '../gql/group/groups.graphql';
import { useAddGroupMutation, AddGroup } from '../gql/group/addGroup.graphql';
import { useEditGroupMutation, EditGroup } from '../gql/group/editGroup.graphql';
import { useGroupLazyQuery } from '../gql/group/group.graphql';
import { useDeleteGroupMutation } from '../gql/group/deleteGroup.graphql';
import FormDialog from '../components/FormDialog';
import TextInput from '../components/input/TextInput';
import { FormOnSubmit, FormValidate } from '../lib/types';
import ConfirmDialog from '../components/ConfirmDialog';
import { serverQueryHandle } from '../lib/serverHandles';
import { useDialog, useIdDialog } from '../hooks/useDialog';

const columns = [
  {
    title: 'Nimi',
    field: 'name',
  },
];

const GroupEditFormData = ({ id }: { id?: string }) => {
  const formik = useFormikContext();
  const [load] = useGroupLazyQuery({
    onCompleted: (data) => {
      Object.entries(data?.group ?? {}).forEach(([key, value]) => {
        formik.setFieldValue(key, value, false);
      });
    },
  });
  useEffect(() => {
    load({ variables: { id: id ?? '' } });
  }, [id]);

  return <></>;
};

interface GroupInfo {
  id: string;
  name: string;
}

const Groups = () => {
  const { loggedInPromise, user } = useLogin();
  const isTeacher = user?.type === 'teacher';
  const client = useApolloClient();
  useGuard();
  const router = useRouter();
  const addDialog = useDialog();
  const editDialog = useIdDialog();
  const deleteDialog = useIdDialog();
  const [addGroup] = useAddGroupMutation();
  const [editGroup] = useEditGroupMutation();
  const [deleteGroup] = useDeleteGroupMutation();

  const addValidate: FormValidate<AddGroup> = (values) => {
    const errors: FormikErrors<AddGroup> = {};

    if (values.name.trim() === '') errors.name = 'Nimi ei voi olla tyhjä';

    return errors;
  };

  const addSubmit: FormOnSubmit<AddGroup> = async (values, helpers) => {
    helpers.setSubmitting(true);
    await addGroup({ variables: values });
    helpers.setSubmitting(false);
    addDialog.handleClose();
  };

  const editValidate: FormValidate<EditGroup> = (values) => {
    const errors: FormikErrors<EditGroup> = {};

    if (values.name === '') errors.name = 'Nimi ei voi olla tyhjä';

    return;
  };

  const editSubmit: FormOnSubmit<EditGroup> = async (values, helpers) => {
    helpers.setSubmitting(true);
    await editGroup({ variables: { ...values, id: editDialog.id } });
    helpers.setSubmitting(false);
    editDialog.handleClose();
  };

  const deleteAction = async () => {
    await deleteGroup({ variables: { id: deleteDialog.id } });
    deleteDialog.handleClose();
  };

  return (
    <Layout title="Ryhmät">
      <DataTable<GroupInfo>
        columns={columns}
        data={async (query) => {
          await loggedInPromise();
          const { data } = await client.query<GroupsQuery, GroupsQueryVariables>({
            query: GroupsDocument,
            variables: {
              skip: query.page * query.pageSize,
              take: query.pageSize,
            },
            fetchPolicy: 'network-only',
          });
          return {
            data: data.groups.items.map((g) => ({ ...g })),
            page: query.page,
            totalCount: data.groups.total,
          };
        }}
        title="Ryhmät"
        emptyMsg="Ei näytettäviä ryhmiä"
        onRowClick={(_e, data) => {
          router.push(`/groups/${data?.id}`);
        }}
        addRow={isTeacher ? addDialog.open : undefined}
        menuItems={defaultMenuItems(
          isTeacher
            ? {
                editRow: editDialog.open,
                deleteRow: deleteDialog.open,
              }
            : {},
        )}
      />
      <FormDialog<AddGroup>
        initial={{ name: '' }}
        validate={addValidate}
        submit={addSubmit}
        title="Lisää Ryhmä"
        titleId="group-add-dialog-title"
        {...addDialog}
      >
        {columns.map((c) => (
          <Grid item xs={12} key={c.field}>
            <TextInput name={c.field} label={c.title} />
          </Grid>
        ))}
      </FormDialog>
      <FormDialog<EditGroup>
        initial={{
          name: '',
        }}
        validate={editValidate}
        submit={editSubmit}
        title="Muokkaa Ryhmää"
        titleId="group-edit-dialog-title"
        DataHelper={GroupEditFormData}
        {...editDialog}
      >
        {columns.map((c) => (
          <Grid item xs={12} key={c.field}>
            <TextInput name={c.field} label={c.title} />
          </Grid>
        ))}
      </FormDialog>
      <ConfirmDialog
        action={deleteAction}
        confirm="Poista"
        confirmText="Oletko varma että haluat poistaa tämän ryhmän?"
        title="Poista Ryhmä"
        titleId="group-delete-dialog-title"
        {...deleteDialog}
      />
    </Layout>
  );
};

export const getServerSideProps = serverQueryHandle(GroupsDocument);

export default Groups;

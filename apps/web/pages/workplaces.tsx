import { useApolloClient } from '@apollo/client';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { Grid } from '@material-ui/core';
import { FormikErrors, useFormikContext } from 'formik';

import Layout from '../lib/Layout';
import DataTable, { defaultMenuItems } from '../components/DataTable';
import { useGuard } from '../hooks/useGuard';
import { useLogin } from '../lib/LoginContext';
import {
  WorkplacesDocument,
  WorkplacesQuery,
  WorkplacesQueryVariables,
} from '../gql/workplace/workplaces.graphql';
import {
  useAddWorkplaceMutation,
  AddWorkplace,
  AddAddress,
} from '../gql/workplace/addWorkplace.graphql';
import { useEditWorkplaceMutation, EditWorkplace } from '../gql/workplace/editWorkplace.graphql';
import { useWorkplaceLazyQuery } from '../gql/workplace/workplace.graphql';
import { useDeleteWorkplaceMutation } from '../gql/workplace/deleteWorkplace.graphql';
import FormDialog from '../components/FormDialog';
import TextInput from '../components/input/TextInput';
import { Field, FormOnSubmit, FormValidate } from '../lib/types';
import ConfirmDialog from '../components/ConfirmDialog';
import { serverQueryHandle } from '../lib/serverHandles';
import { useDialog, useIdDialog } from '../hooks/useDialog';

const columns = [
  {
    title: 'Nimi',
    field: 'name',
  },
];

const workplaceFields: Field[] = [
  {
    label: 'Nimi',
    name: 'name',
  },
  {
    label: 'Kuvaus',
    name: 'description',
    multiline: true,
  },
  {
    label: 'Sähköposti',
    name: 'email',
  },
  {
    label: 'Puhelinnumero',
    name: 'phone',
  },
  {
    label: 'URL',
    name: 'url',
  },
];

const addressFields: Field[] = [
  {
    label: 'Katuosoite',
    name: 'street',
  },
  {
    label: 'Kaupunki',
    name: 'city',
  },
  {
    label: 'Postinumero',
    name: 'postal_code',
  },
];

const WorkplaceEditFormData = ({ id }: { id?: string }) => {
  const formik = useFormikContext();
  const [load] = useWorkplaceLazyQuery({
    onCompleted: (data) => {
      Object.entries(data?.workplace ?? {}).forEach(([key, value]) => {
        formik.setFieldValue(key, value, false);
      });
    },
  });
  useEffect(() => {
    load({ variables: { id: id ?? '' } });
  }, [id]);

  return <></>;
};

interface WorkplaceInfo {
  id: string;
  name: string;
}

const Workplaces = () => {
  const { loggedInPromise, user } = useLogin();
  const isTeacher = user?.type === 'teacher';
  const client = useApolloClient();
  useGuard();
  const router = useRouter();
  const addDialog = useDialog();
  const editDialog = useIdDialog();
  const deleteDialog = useIdDialog();
  const [addWorkplace] = useAddWorkplaceMutation();
  const [editWorkplace] = useEditWorkplaceMutation();
  const [deleteWorkplace] = useDeleteWorkplaceMutation();

  const addSubmit: FormOnSubmit<AddWorkplace & AddAddress> = async (values, helpers) => {
    helpers.setSubmitting(true);
    await addWorkplace({ variables: values });
    helpers.setSubmitting(false);
    addDialog.handleClose();
  };

  const addValidate: FormValidate<AddWorkplace & AddAddress> = (values) => {
    const errors: FormikErrors<AddWorkplace & AddAddress> = {};

    if (values.name.trim() === '') errors.name = 'Nimi ei voi olla tyhjä';
    if (values.city.trim() === '') errors.city = 'Kaupunki ei voi olla tyhjä';
    if (values.street.trim() === '') errors.street = 'Katuosoite ei voi olla tyhjä';
    if (values.description.trim() === '') errors.description = 'Kuvaus ei voi olla tyhjä';
    if (values.postal_code.trim() === '') errors.postal_code = 'Postinumero ei voi olla tyhjä';

    return errors;
  };

  const editSubmit: FormOnSubmit<EditWorkplace> = async (values, helpers) => {
    helpers.setSubmitting(true);
    await editWorkplace({ variables: { ...values, id: editDialog.id } });
    helpers.setSubmitting(false);
    editDialog.handleClose();
  };

  const editValidate: FormValidate<EditWorkplace> = (values) => {
    const errors: FormikErrors<EditWorkplace> = {};

    if (values.name.trim() === '') errors.name = 'Nimi ei voi olla tyhjä';
    if (values.description.trim() === '') errors.description = 'Kuvaus ei voi olla tyhjä';

    return;
  };

  const deleteAction = async () => {
    await deleteWorkplace({ variables: { id: deleteDialog.id } });
    deleteDialog.handleClose();
  };

  return (
    <Layout title="TJK-paikat">
      <DataTable<WorkplaceInfo>
        columns={columns}
        data={async (query) => {
          await loggedInPromise();
          const { data } = await client.query<WorkplacesQuery, WorkplacesQueryVariables>({
            query: WorkplacesDocument,
            variables: {
              skip: query.page * query.pageSize,
              take: query.pageSize,
            },
            fetchPolicy: 'network-only',
          });
          return {
            data: data.workplaces.items.map((g) => ({ ...g })),
            page: query.page,
            totalCount: data.workplaces.total,
          };
        }}
        title="TJK-paikat"
        emptyMsg="Ei näytettäviä TJK-paikkoja"
        onRowClick={(_e, data) => {
          router.push(`/workplaces/${data?.id}`);
        }}
        addRow={addDialog.open}
        menuItems={defaultMenuItems({
          editRow: editDialog.open,
          deleteRow: isTeacher ? deleteDialog.open : undefined,
        })}
      />
      <FormDialog<AddWorkplace & AddAddress>
        initial={{
          name: '',
          description: '',
          email: '',
          phone: '',
          url: '',
          city: '',
          postal_code: '',
          street: '',
        }}
        validate={addValidate}
        submit={addSubmit}
        title="Lisää TJK-paikka"
        titleId="workplace-add-dialog-title"
        {...addDialog}
      >
        {workplaceFields.map((c) => (
          <Grid item xs={12} key={c.name}>
            <TextInput name={c.name} label={c.label} multiline={c.multiline} />
          </Grid>
        ))}
        {addressFields.map((c) => (
          <Grid item xs={12} key={c.name}>
            <TextInput name={c.name} label={c.label} />
          </Grid>
        ))}
      </FormDialog>
      <FormDialog<EditWorkplace>
        initial={{
          name: '',
          description: '',
          email: '',
          phone: '',
          url: '',
        }}
        validate={editValidate}
        submit={editSubmit}
        title="Muokkaa TJK-paikkaa"
        titleId="workplace-edit-dialog-title"
        DataHelper={WorkplaceEditFormData}
        {...editDialog}
      >
        {workplaceFields.map((c) => (
          <Grid item xs={12} key={c.name}>
            <TextInput name={c.name} label={c.label} multiline={c.multiline} />
          </Grid>
        ))}
      </FormDialog>
      <ConfirmDialog
        action={deleteAction}
        confirm="Poista"
        confirmText="Oletko varma että haluat poistaa tämän TJK-paikan?"
        title="Poista TJK-paikka"
        titleId="workplace-delete-dialog-title"
        {...deleteDialog}
      />
    </Layout>
  );
};

export const getServerSideProps = serverQueryHandle(WorkplacesDocument);

export default Workplaces;

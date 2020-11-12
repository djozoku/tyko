import React from 'react';
import { Form, Formik, FormikValues } from 'formik';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid } from '@material-ui/core';

import { FormOnSubmit, FormValidate } from '../lib/types';

interface FormDialogProps<T extends FormikValues> {
  isOpen: boolean;
  handleClose: () => void;
  titleId: string;
  title: string;
  initial: T;
  submit: FormOnSubmit<T>;
  validate?: FormValidate<T>;
  DataHelper?: (props: { id?: string }) => JSX.Element;
  children: React.ReactNode;
  id?: string;
}

const FormDialog = <T extends FormikValues>(props: FormDialogProps<T>) => {
  const {
    isOpen,
    handleClose,
    titleId,
    title,
    initial,
    submit,
    DataHelper,
    children,
    id,
    validate,
  } = props;

  return (
    <Dialog open={isOpen} onClose={handleClose} aria-labelledby={titleId} fullWidth maxWidth="sm">
      <DialogTitle id={titleId}>{title}</DialogTitle>
      <Formik<T> initialValues={initial} onSubmit={submit} validate={validate}>
        {() => (
          <Form>
            {DataHelper && <DataHelper id={id} />}
            <DialogContent>
              <Grid container spacing={2}>
                {children}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} color="secondary">
                Peruuta
              </Button>
              <Button color="primary" type="submit">
                Tallenna
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default FormDialog;

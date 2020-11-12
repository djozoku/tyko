import { FormikErrors, FormikHelpers } from 'formik';

export type FormOnSubmit<T> = (values: T, formikHelpers: FormikHelpers<T>) => void | Promise<any>;

export type FormValidate<T> = (values: T) => void | FormikErrors<T> | Promise<FormikErrors<T>>;

export interface Field {
  label: string;
  name: string;
  multiline?: boolean;
}

export interface TableRef {
  onQueryChange: () => void;
}

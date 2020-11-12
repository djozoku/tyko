import { TextField } from '@material-ui/core';
import { useField } from 'formik';
import React from 'react';

export interface TextInputProps {
  name: string;
  label: string;
  multiline?: boolean;
}

const TextInput = (props: TextInputProps) => {
  const { name, label, multiline = false } = props;
  const [field, meta] = useField(name);
  return (
    <TextField
      {...field}
      error={meta.touched && !!meta.error}
      label={label}
      multiline={multiline}
      rowsMax={multiline ? 4 : 1}
      helperText={meta.touched && meta.error}
      variant="outlined"
      fullWidth
    />
  );
};

export default TextInput;

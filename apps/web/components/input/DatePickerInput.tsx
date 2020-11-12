import React from 'react';
import { KeyboardDatePicker } from '@material-ui/pickers';
import { useField } from 'formik';
import { Theme, useMediaQuery } from '@material-ui/core';

interface DatePickerInputProps {
  name: string;
  label: string;
}

const DatePickerInput = (props: DatePickerInputProps) => {
  const { name, label } = props;
  const [field, meta] = useField(name);
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('xs'));
  return (
    <KeyboardDatePicker
      {...field}
      onChange={(date) => field.onChange({ target: { value: date, name } } as any)}
      autoOk={!isMobile}
      variant={isMobile ? 'dialog' : 'inline'}
      label={label}
      format="DD/MM/YYYY"
      InputAdornmentProps={{ position: 'start' }}
      error={meta.touched && !!meta.error}
      helperText={meta.touched && meta.error}
      inputVariant="outlined"
      fullWidth
    />
  );
};

export default DatePickerInput;

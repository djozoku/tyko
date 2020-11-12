import React from 'react';
import { useField } from 'formik';
import { FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@material-ui/core';

import { TextInputProps } from './TextInput';

export interface SelectItem {
  name: string;
  value: string;
}

export interface SelectInputProps extends TextInputProps {
  items: SelectItem[];
}

const SelectInput = (props: SelectInputProps) => {
  const { name, label, items } = props;
  const [field, meta] = useField(name);
  return (
    <FormControl variant="outlined" error={meta.touched && !!meta.error} fullWidth>
      <InputLabel id={`${name}-label`}>{label}</InputLabel>
      <Select labelId={`${name}-label`} label={label} id={name} {...field}>
        {items.map((item) => (
          <MenuItem key={item.name} value={item.value}>
            {item.name}
          </MenuItem>
        ))}
      </Select>
      {meta.touched && meta.error && <FormHelperText>{meta.error}</FormHelperText>}
    </FormControl>
  );
};

export default SelectInput;

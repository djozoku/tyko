import React from 'react';
import { Avatar, createStyles, makeStyles, Theme } from '@material-ui/core';
import { deepOrange } from '@material-ui/core/colors';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    avatar: {
      color: theme.palette.getContrastText(deepOrange[500]),
      backgroundColor: deepOrange[500],
    },
  }),
);

const LetterAvatar = ({ name, className }: { name: string; className?: string }) => {
  const classes = useStyles();
  return (
    <Avatar className={classes.avatar + ` ${className}`}>{name.split(' ').map((w) => w[0])}</Avatar>
  );
};

export default LetterAvatar;

import {
  Grid,
  Typography,
  List,
  ListItem,
  ListItemText,
  createStyles,
  makeStyles,
  Card,
  CardContent,
  Theme,
  IconButton,
  //  useMediaQuery,
} from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import React from 'react';

import LetterAvatar from '../components/LetterAvatar';
import { useGuard } from '../hooks/useGuard';
import Layout from '../lib/Layout';
import { useLogin } from '../lib/LoginContext';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
    },
    avatar: {
      [theme.breakpoints.down('sm')]: {
        width: theme.spacing(6),
        height: theme.spacing(6),
      },
      width: theme.spacing(10),
      height: theme.spacing(10),
    },
  }),
);

const AccountList = () => {
  return (
    <List>
      <ListItem button selected>
        <ListItemText primary="Tiedot" />
      </ListItem>
      <ListItem button>
        <ListItemText primary="Yhteydet" />
      </ListItem>
    </List>
  );
};

const Account = () => {
  //const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('xs'));
  const classes = useStyles();
  const { user } = useLogin();
  useGuard();

  return (
    <Layout title="Tili" custom={<AccountList />}>
      <Grid container justify="center" spacing={2}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Grid container direction="row" spacing={2}>
                <Grid item>
                  <LetterAvatar name={user?.name ?? ''} className={classes.avatar} />
                </Grid>
                <Grid item style={{ flexGrow: 1 }}>
                  <Typography component="h3" variant="h5">
                    {user?.name ?? ''}
                  </Typography>
                  <Typography color="textSecondary" component="h4" variant="subtitle1">
                    {user?.email ?? ''}
                  </Typography>
                  <Typography color="textSecondary" component="h4" variant="subtitle1" gutterBottom>
                    {user?.type && (user.type !== 'teacher' ? 'Oppilas' : 'Opettaja')}
                  </Typography>
                </Grid>
                <Grid item>
                  <IconButton>
                    <EditIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default Account;

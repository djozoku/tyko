import React from 'react';
import { Toolbar, Typography } from '@material-ui/core';

import Layout from '../lib/Layout';
import { useLogin } from '../lib/LoginContext';

const Error404 = () => {
  const { loggedIn, completed } = useLogin();

  return (
    <Layout title="Virhe 404" sidebar={loggedIn && completed}>
      <Toolbar />
      <Typography component="h2" variant="h3" align="center" gutterBottom>
        Virhe 404
      </Typography>
      <Typography component="h3" variant="h5" align="center">
        Sivua ei löydy
      </Typography>
    </Layout>
  );
};

export default Error404;

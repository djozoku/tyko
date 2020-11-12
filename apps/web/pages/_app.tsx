import React, { useEffect } from 'react';
import Head from 'next/head';
import { AppProps } from 'next/app';
import { ApolloProvider } from '@apollo/client';
import { ThemeProvider, CssBaseline, useMediaQuery } from '@material-ui/core';
import { createMuiTheme } from '@material-ui/core/styles';
import moment from 'moment';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import 'moment/locale/fi';

import { useApollo } from '../lib/apollo';
import { LoginProvider } from '../lib/LoginContext';

moment.locale('fi');

export default function App({ Component, pageProps }: AppProps) {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = createMuiTheme({
    palette: {
      type: prefersDarkMode ? 'dark' : 'light',
    },
    overrides: {
      MuiCssBaseline: {
        '@global': {
          html: {
            overflow: 'hidden',
          },
          '*': {
            '& ::-webkit-scrollbar': {
              '-webkit-appearance': 'none',
            },
            '& ::-webkit-scrollbar:vertical': {
              width: 8,
            },
            '& ::-webkit-scrollbar-thumb': {
              borderRadius: 4,
              backgroundColor: prefersDarkMode ? 'rgba(255, 255, 255, .15)' : 'rgba(0, 0, 0, .15)',
            },
          },
        },
      },
    },
  });

  const apolloClient = useApollo(pageProps.initialApolloState);

  useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement?.removeChild(jssStyles);
    }
  }, []);

  return (
    <>
      <Head>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
        <meta name="theme-color" content={theme.palette.primary.main} />
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <MuiPickersUtilsProvider utils={MomentUtils} locale="fi" libInstance={moment}>
          <ApolloProvider client={apolloClient}>
            <LoginProvider>
              <Component {...pageProps} />
            </LoginProvider>
          </ApolloProvider>
        </MuiPickersUtilsProvider>
      </ThemeProvider>
    </>
  );
}

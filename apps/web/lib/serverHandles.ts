import { DocumentNode } from '@apollo/client/core';
import { GetServerSideProps } from 'next';

import { getLoginSession } from './auth';
import { initializeSsrApollo } from './ssrApollo';

export const serverQueryHandle = (document: DocumentNode): GetServerSideProps => async ({
  req,
  res,
}) => {
  const session = await getLoginSession(req);

  if (!session) {
    console.log('no session');
    res.writeHead(302, { Location: '/' }).end();
    return { props: {} };
  }

  const apolloClient = initializeSsrApollo(session.token);

  try {
    await apolloClient.query({
      query: document,
    });

    return {
      props: {
        initialApolloState: apolloClient.cache.extract(),
      },
    };
  } catch (err) {
    console.log(err);
    res.writeHead(302, { Location: '/' }).end();
    return { props: {} };
  }
};

export const serverAuthHandle: GetServerSideProps = async ({ req, res }) => {
  const session = await getLoginSession(req);
  if (!session) {
    res.writeHead(302, { Location: '/' }).end();
  }
  return { props: {} };
};

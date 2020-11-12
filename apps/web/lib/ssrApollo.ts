import { ApolloClient, createHttpLink } from '@apollo/client';
import { InMemoryCache } from '@apollo/client/cache';
import { setContext } from '@apollo/client/link/context';

export function initializeSsrApollo(token?: string) {
  const httpLink = createHttpLink({
    uri: `${process.env.NEXT_PUBLIC_API_SERVER}/graphql`,
  });

  const authLink = setContext((_, { headers }) => {
    // return the headers to the context so httpLink can read them
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
      },
    };
  });

  return new ApolloClient({
    ssrMode: true,
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
  });
}

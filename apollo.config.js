module.exports = {
  client: {
    service: {
      url: 'http://localhost:5000/graphql',
    },
    includes: ['./apps/web/gql/**/*.graphql'],
  },
};

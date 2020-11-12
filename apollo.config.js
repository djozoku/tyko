module.exports = {
  client: {
    service: {
      url: 'http://localhost:5000/api/graphql',
    },
    includes: ['./apps/web/gql/**/*.graphql'],
  },
};

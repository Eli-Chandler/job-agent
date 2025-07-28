export default {
  api: {
    input: './openapi.json',
    output: {
      target: './src/api/orval-api.ts',
      mode: 'tags-split',
      schemas: 'src/api/models',
      client: 'react-query',
      // disable hardcoding the baseUrl in generated functions
      override: {
        mutator: {
          path: './src/api/custom-axios.ts',
          name: 'customAxios',
        },
      },
    },
  },
};

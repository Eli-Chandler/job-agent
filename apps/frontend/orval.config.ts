export default {
  api: {
    input: './openapi.json',
    output: {
      target: './src/api/orval-api.ts',
      mode: 'tags-split',
      schemas: 'src/api/models',
      client: 'react-query',
    },
  },
};

import { OIS } from '@airnode/ois';

export function buildOIS(overrides?: Partial<OIS>): OIS {
  return {
    oisFormat: '1.0.0',
    version: '1.2.3',
    title: 'currency-converter-ois',
    apiSpecifications: {
      servers: [
        {
          url: 'http://localhost:5000',
        },
      ],
      paths: {
        '/convert': {
          get: {
            parameters: [
              {
                in: 'query',
                name: 'from',
              },
              {
                in: 'query',
                name: 'to',
              },
              {
                in: 'query',
                name: 'amount',
              },
              {
                in: 'query',
                name: 'date',
              },
            ],
          },
        },
      },
      components: {
        securitySchemes: {
          myapiApiScheme: {
            in: 'query',
            type: 'apiKey',
            name: 'access_key',
          },
        },
      },
      security: {
        myapiApiScheme: [],
      },
    },
    endpoints: [
      {
        name: 'convertToUSD',
        operation: {
          method: 'get',
          path: '/convert',
        },
        fixedOperationParameters: [
          {
            operationParameter: {
              in: 'query',
              name: 'to',
            },
            value: 'USD',
          },
        ],
        reservedParameters: [
          {
            name: '_type',
            fixed: 'int256',
          },
          {
            name: '_path',
            fixed: 'result',
          },
          {
            name: '_times',
            default: '100000',
          },
        ],
        parameters: [
          {
            name: 'f',
            default: 'EUR',
            operationParameter: {
              in: 'query',
              name: 'from',
            },
          },
          {
            name: 'amount',
            default: '1',
            operationParameter: {
              name: 'amount',
              in: 'query',
            },
          },
        ],
      },
    ],
    ...overrides,
  };
}

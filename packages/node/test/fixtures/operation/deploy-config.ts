import { ethers } from 'ethers';
import { Config } from '@airnode/operation';

export function buildDeployConfig(config?: Partial<Config>): Config {
  return {
    deployerIndex: 0,
    airnodes: {
      CurrencyConverterAPI: {
        airnodeAdmin: '0x5e0051B74bb4006480A1b548af9F1F0e0954F410',
        // We need to create a new mnemonic each time otherwise E2E tests
        // will share the same Airnode wallet
        mnemonic: ethers.Wallet.createRandom().mnemonic.phrase,
        authorizers: ['public'],
        endpoints: {
          convertToUSD: {
            oisTitle: 'currency-converter-ois',
          },
        },
        templates: {
          'template-1': {
            endpoint: 'convertToUSD',
            oisTitle: 'currency-converter-ois',
            parameters: [
              { type: 'bytes32', name: 'to', value: 'USD' },
              { type: 'bytes32', name: '_type', value: 'uint256' },
              { type: 'bytes32', name: '_path', value: 'result' },
              { type: 'bytes32', name: '_times', value: '100000' },
            ],
          },
        },
      },
    },
    authorizers: {
      public: '0x0000000000000000000000000000000000000000',
    },
    clients: {
      MockAirnodeRrpClient: { endorsers: ['bob'] },
    },
    requesters: [
      {
        id: 'alice',
        airnodes: {
          CurrencyConverterAPI: { ethBalance: '2' },
        },
      },
      {
        id: 'bob',
        airnodes: {
          CurrencyConverterAPI: { ethBalance: '5' },
        },
      },
    ],
    requests: [
      {
        requesterId: 'bob',
        type: 'regular',
        airnode: 'CurrencyConverterAPI',
        template: 'template-1',
        client: 'MockAirnodeRrpClient',
        fulfillFunctionName: 'fulfill',
        parameters: [{ type: 'bytes32', name: 'from', value: 'ETH' }],
      },
      {
        requesterId: 'bob',
        type: 'full',
        airnode: 'CurrencyConverterAPI',
        endpoint: 'convertToUSD',
        oisTitle: 'currency-converter-ois',
        client: 'MockAirnodeRrpClient',
        fulfillFunctionName: 'fulfill',
        parameters: [
          { type: 'bytes32', name: 'from', value: 'ETH' },
          { type: 'bytes32', name: 'to', value: 'USD' },
          { type: 'bytes32', name: '_type', value: 'int256' },
          { type: 'bytes32', name: '_path', value: 'result' },
          { type: 'bytes32', name: '_times', value: '100000' },
        ],
      },
    ],
    ...config,
  };
}

import { ethers } from 'ethers';
import { initializeProvider } from './initialize-provider';
import * as fixtures from 'test/fixtures';

const getProviderAndBlockNumberMock = jest.fn();
const getTemplatesMock = jest.fn();
jest.mock('ethers', () => ({
  ethers: {
    ...jest.requireActual('ethers'),
    Contract: jest.fn().mockImplementation(() => ({
      getProviderAndBlockNumber: getProviderAndBlockNumberMock,
      getTemplates: getTemplatesMock,
    })),
  },
}));

describe('initializeProvider', () => {
  it('fetches, maps and authorizes requests', async () => {
    const fullRequest = fixtures.evm.buildFullClientRequest();
    const withdrawal = fixtures.evm.buildWithdrawalRequest();
    const getLogsSpy = jest.spyOn(ethers.providers.JsonRpcProvider.prototype, 'getLogs');
    getLogsSpy.mockResolvedValueOnce([fullRequest, withdrawal]);

    getProviderAndBlockNumberMock.mockResolvedValueOnce({
      admin: '0x5e0051B74bb4006480A1b548af9F1F0e0954F410',
      blockNumber: ethers.BigNumber.from('12'),
      xpub:
        'xpub661MyMwAqRbcGeCE1g3KTUVGZsFDE3jMNinRPGCQGQsAp1nwinB9Pi16ihKPJw7qtaaTFuBHbRPeSc6w3AcMjxiHkAPfyp1hqQRbthv4Ryx',
    });

    const state = fixtures.buildEVMProviderState();
    const res = await initializeProvider(state);
    expect(res).toEqual([]);
  });
});

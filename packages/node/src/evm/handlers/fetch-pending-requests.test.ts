import { ethers } from 'ethers';
import { fetchPendingRequests } from './fetch-pending-requests';
import * as blocking from '../requests/blocking';
import * as verification from '../verification';
import { unfreezeImport } from '../../../test/helpers';
import * as fixtures from 'test/fixtures';

unfreezeImport(verification, 'verifyApiCallIds');

describe('fetchPendingRequests', () => {
  it('maps and groups requests', async () => {
    const fullRequest = fixtures.evm.logs.buildFullClientRequest();
    const withdrawal = fixtures.evm.logs.buildWithdrawalRequest();
    const getLogsSpy = jest.spyOn(ethers.providers.JsonRpcProvider.prototype, 'getLogs');
    getLogsSpy.mockResolvedValueOnce([fullRequest, withdrawal]);
    const state = fixtures.buildEVMProviderState();
    const res = await fetchPendingRequests(state);
    expect(getLogsSpy).toHaveBeenCalledTimes(1);
    expect(res).toEqual({
      apiCalls: [
        {
          airnodeId: '0x19255a4ec31e89cea54d1f125db7536e874ab4a96b4d4f6438668b6bb10a6adb',
          chainId: '31337',
          clientAddress: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
          designatedWallet: '0x1c5b7e13fe3977a384397b17b060Ec96Ea322dEc',
          encodedParameters:
            '0x31626262626200000000000000000000000000000000000000000000000000005f74797065000000000000000000000000000000000000000000000000000000696e7432353600000000000000000000000000000000000000000000000000005f70617468000000000000000000000000000000000000000000000000000000726573756c7400000000000000000000000000000000000000000000000000005f74696d65730000000000000000000000000000000000000000000000000000313030303030000000000000000000000000000000000000000000000000000066726f6d000000000000000000000000000000000000000000000000000000004554480000000000000000000000000000000000000000000000000000000000746f0000000000000000000000000000000000000000000000000000000000005553440000000000000000000000000000000000000000000000000000000000',
          endpointId: '0x3c8e59646e688707ddd3b1f07c4dbc5ab55a0257362a18569ac2644ccf6faddb',
          fulfillAddress: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
          fulfillFunctionId: '0x48a4157c',
          id: '0xc4a19131d2318ea0554b636b8d33e32a91d8412ff5a11f3371e08c7fb97664dd',
          metadata: {
            blockNumber: 16,
            currentBlock: null,
            ignoreBlockedRequestsAfterBlocks: 20,
            transactionHash: '0xa4ccd606e7a2d167d8c3cc8dc04343398b85da0dfa96560245dfb68291f31127',
          },
          parameters: {
            _path: 'result',
            _times: '100000',
            _type: 'int256',
            from: 'ETH',
            to: 'USD',
          },
          requestCount: '1',
          requesterIndex: '10',
          status: 'Pending',
          templateId: null,
          type: 'full',
        },
      ],
      withdrawals: [
        {
          airnodeId: '0x19255a4ec31e89cea54d1f125db7536e874ab4a96b4d4f6438668b6bb10a6adb',
          designatedWallet: '0x34e9A78D63c9ca2148C95e880c6B1F48AE7F121E',
          destinationAddress: '0x6812efaf684AA899949212A2A6785305EC0F1474',
          id: '0xd9db6b416bbd9a87f4e693d66a0323eafde6591cae537727cd1f4e7ff0b53d5a',
          metadata: {
            blockNumber: 18,
            currentBlock: null,
            ignoreBlockedRequestsAfterBlocks: 20,
            transactionHash: '0xac3aa3683548a631dd7561cfa32d4e003f43bfc061bb40adc9920c9c1d4d6a60',
          },
          requesterIndex: '1',
          status: 'Pending',
        },
      ],
    });
  });

  it('verifies API calls', async () => {
    const fullRequest = fixtures.evm.logs.buildFullClientRequest();
    const getLogsSpy = jest.spyOn(ethers.providers.JsonRpcProvider.prototype, 'getLogs');
    getLogsSpy.mockResolvedValueOnce([fullRequest]);
    const verificationSpy = jest.spyOn(verification, 'verifyApiCallIds');
    const state = fixtures.buildEVMProviderState();
    await fetchPendingRequests(state);
    expect(verificationSpy).toHaveBeenCalledTimes(1);
  });

  it('blocks API calls linked to withdrawals', async () => {
    const fullRequest = fixtures.evm.logs.buildFullClientRequest();
    const withdrawal = fixtures.evm.logs.buildFullClientRequest();
    const getLogsSpy = jest.spyOn(ethers.providers.JsonRpcProvider.prototype, 'getLogs');
    getLogsSpy.mockResolvedValueOnce([fullRequest, withdrawal]);
    const blockingSpy = jest.spyOn(blocking, 'blockRequestsWithWithdrawals');
    const state = fixtures.buildEVMProviderState();
    await fetchPendingRequests(state);
    expect(blockingSpy).toHaveBeenCalledTimes(1);
  });
});

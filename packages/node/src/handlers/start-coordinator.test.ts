import fs from 'fs';
import { ethers } from 'ethers';
import * as adapter from '@airnode/adapter';
import { startCoordinator } from './start-coordinator';
import * as fixtures from 'test/fixtures';

const checkAuthorizationStatusesMock = jest.fn();
const getAirnodeParametersAndBlockNumberMock = jest.fn();
const getTemplatesMock = jest.fn();
const estimateGasWithdrawalMock = jest.fn();
const failMock = jest.fn();
const fulfillMock = jest.fn();
const fulfillWithdrawalMock = jest.fn();
const staticFulfillMock = jest.fn();
jest.mock('ethers', () => ({
  ethers: {
    ...jest.requireActual('ethers'),
    Contract: jest.fn().mockImplementation(() => ({
      callStatic: {
        fulfill: staticFulfillMock,
      },
      estimateGas: {
        fulfillWithdrawal: estimateGasWithdrawalMock,
      },
      checkAuthorizationStatuses: checkAuthorizationStatusesMock,
      fail: failMock,
      fulfill: fulfillMock,
      fulfillWithdrawal: fulfillWithdrawalMock,
      getAirnodeParametersAndBlockNumber: getAirnodeParametersAndBlockNumberMock,
      getTemplates: getTemplatesMock,
    })),
  },
}));

describe('startCoordinator', () => {
  it('fetches and processes requests', async () => {
    const config = fixtures.buildConfig();
    jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(config));

    getAirnodeParametersAndBlockNumberMock.mockResolvedValueOnce({
      admin: '0x5e0051B74bb4006480A1b548af9F1F0e0954F410',
      authorizers: [ethers.constants.AddressZero],
      blockNumber: ethers.BigNumber.from('12'),
      xpub:
        'xpub661MyMwAqRbcGeCE1g3KTUVGZsFDE3jMNinRPGCQGQsAp1nwinB9Pi16ihKPJw7qtaaTFuBHbRPeSc6w3AcMjxiHkAPfyp1hqQRbthv4Ryx',
    });

    const regularRequest = fixtures.evm.logs.buildClientRequest();
    const getLogsSpy = jest.spyOn(ethers.providers.JsonRpcProvider.prototype, 'getLogs');
    getLogsSpy.mockResolvedValueOnce([regularRequest]);

    const executeSpy = jest.spyOn(adapter, 'buildAndExecuteRequest') as jest.SpyInstance;
    executeSpy.mockResolvedValue({
      data: { result: '443.76381' },
      status: 200,
    });

    getTemplatesMock.mockResolvedValueOnce(fixtures.evm.airnodeRrp.getTemplates());
    checkAuthorizationStatusesMock.mockResolvedValueOnce([true]);

    const gasPrice = ethers.BigNumber.from(1000);
    const gasPriceSpy = jest.spyOn(ethers.providers.JsonRpcProvider.prototype, 'getGasPrice');
    gasPriceSpy.mockResolvedValueOnce(gasPrice);

    const txCountSpy = jest.spyOn(ethers.providers.JsonRpcProvider.prototype, 'getTransactionCount');
    txCountSpy.mockResolvedValueOnce(212);

    const balanceSpy = jest.spyOn(ethers.providers.JsonRpcProvider.prototype, 'getBalance');
    balanceSpy.mockResolvedValueOnce(ethers.BigNumber.from(250_000_000));

    const contract = new ethers.Contract('address', ['ABI']);
    (contract.estimateGas.fulfillWithdrawal as jest.Mock).mockResolvedValueOnce(ethers.BigNumber.from(50_000));
    (contract.callStatic.fulfill as jest.Mock).mockResolvedValueOnce({ callSuccess: true });
    contract.fulfill.mockResolvedValueOnce({
      hash: '0xad33fe94de7294c6ab461325828276185dff6fed92c54b15ac039c6160d2bac3',
    });

    await startCoordinator(config);

    // API call was submitted
    expect(contract.fulfill).toHaveBeenCalledTimes(1);
    expect(contract.fulfill).toHaveBeenCalledWith(
      '0x2f5bbfb2ad81ba5f426067d0a6942a400f70532e75484acec51f0cfd5f423ee5',
      '0x19255a4ec31e89cea54d1f125db7536e874ab4a96b4d4f6438668b6bb10a6adb',
      ethers.BigNumber.from('0'),
      '0x0000000000000000000000000000000000000000000000000000000002a5213d',
      '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
      '0x48a4157c',
      { gasLimit: 500_000, gasPrice, nonce: 212 }
    );
  });

  it('returns early if there are no processable requests', async () => {
    const config = fixtures.buildConfig();
    jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(config));

    getAirnodeParametersAndBlockNumberMock.mockResolvedValueOnce({
      admin: '0x5e0051B74bb4006480A1b548af9F1F0e0954F410',
      authorizers: [ethers.constants.AddressZero],
      blockNumber: ethers.BigNumber.from('12'),
      xpub:
        'xpub661MyMwAqRbcGeCE1g3KTUVGZsFDE3jMNinRPGCQGQsAp1nwinB9Pi16ihKPJw7qtaaTFuBHbRPeSc6w3AcMjxiHkAPfyp1hqQRbthv4Ryx',
    });

    const getLogsSpy = jest.spyOn(ethers.providers.JsonRpcProvider.prototype, 'getLogs');
    getLogsSpy.mockResolvedValueOnce([]);

    getTemplatesMock.mockResolvedValueOnce(fixtures.evm.airnodeRrp.getTemplates());
    checkAuthorizationStatusesMock.mockResolvedValueOnce([true]);

    const gasPriceSpy = jest.spyOn(ethers.providers.JsonRpcProvider.prototype, 'getGasPrice');
    const executeSpy = jest.spyOn(adapter, 'buildAndExecuteRequest') as jest.SpyInstance;
    const txCountSpy = jest.spyOn(ethers.providers.JsonRpcProvider.prototype, 'getTransactionCount');
    const balanceSpy = jest.spyOn(ethers.providers.JsonRpcProvider.prototype, 'getBalance');

    const contract = new ethers.Contract('address', ['ABI']);

    await startCoordinator(config);

    expect(gasPriceSpy).not.toHaveBeenCalled();
    expect(executeSpy).not.toHaveBeenCalled();
    expect(txCountSpy).not.toHaveBeenCalled();
    expect(balanceSpy).not.toHaveBeenCalled();
    expect(contract.fulfill).not.toHaveBeenCalled();
  });
});

import * as wallet from '../evm/wallet';
import { randomString } from '../utils/string-utils';
import { Config, CoordinatorSettings, CoordinatorState } from '../types';

export function create(config: Config): CoordinatorState {
  const id = randomString(8);
  const masterHDNode = wallet.getMasterHDNode();

  const settings: CoordinatorSettings = {
    airnodeId: wallet.getAirnodeId(masterHDNode),
    airnodeIdShort: wallet.getAirnodeIdShort(masterHDNode),
    logFormat: config.nodeSettings.logFormat,
    region: config.nodeSettings.region,
    stage: config.nodeSettings.stage,
  };

  return {
    id,
    config,
    settings,
    aggregatedApiCallsById: {},
    EVMProviders: [],
  };
}

export function update(state: CoordinatorState, newState: Partial<CoordinatorState>): CoordinatorState {
  return { ...state, ...newState };
}

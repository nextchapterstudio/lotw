import type {
  ConnectorOptions,
  InjectedProvider,
  InjectedWalletProvider,
} from '../types'

import { BaseInjectedConnector } from './injected'

function isCoinbaseWallet(eth: InjectedProvider) {
  const isCoinbaseWallet = !!eth.isCoinbaseWallet

  if (!isCoinbaseWallet) return

  return eth
}

const COINBASE_CONNECTOR_ID = 'Coinbase'
export class CoinbaseConnector extends BaseInjectedConnector<
  typeof COINBASE_CONNECTOR_ID
> {
  constructor(options?: ConnectorOptions) {
    super(COINBASE_CONNECTOR_ID, options)
  }

  protected override getEthereumObject(): InjectedWalletProvider {
    let ethereum = window.ethereum

    if (ethereum?.providers?.length) {
      ethereum = ethereum.providers.find((eth) => isCoinbaseWallet(eth))
    }

    if (!ethereum || !isCoinbaseWallet(ethereum)) {
      throw 'Coinbase not found'
    }

    return ethereum
  }
}

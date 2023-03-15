import type { InjectedProvider, InjectedWalletProvider } from '../types'

import { BaseInjectedConnector } from './injected'

// From 'wagmi' package: https://github.com/tmm/wagmi/blob/main/packages/core/src/connectors/metaMask.ts
// It has a good check, so lets borrow it!
function isMetaMask(eth: InjectedProvider) {
  const isMetaMask = !!eth.isMetaMask

  if (!isMetaMask) return
  if (eth.isBraveWallet && !eth._events && !eth._state) return
  if (eth.isTokenPocket) return
  if (eth.isTokenary) return

  return eth
}

const METAMASK_CONNECTOR_ID = 'MetaMask'
export class MetaMaskConnector extends BaseInjectedConnector<
  typeof METAMASK_CONNECTOR_ID
> {
  constructor() {
    super(METAMASK_CONNECTOR_ID)
  }

  protected override getEthereumObject(): InjectedWalletProvider {
    let ethereum = window.ethereum

    if (ethereum?.providers?.length) {
      ethereum = ethereum.providers.find((eth) => isMetaMask(eth))
    }

    if (!ethereum || !isMetaMask(ethereum)) {
      throw 'MetaMask not found'
    }

    return ethereum
  }
}

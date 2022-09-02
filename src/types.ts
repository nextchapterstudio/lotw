import type { ExternalProvider } from '@ethersproject/providers'
import type { Web3Provider } from './helpers'

export type InjectedProvider = ExternalProvider & {
  isCoinbaseWallet?: boolean
  isBraveWallet?: boolean
  isTokenPocket?: boolean
  isTokenary?: boolean
  _events?: any
  _state?: any
}

export type InjectedWalletProvider = InjectedProvider & {
  providers?: InjectedProvider[]
}

declare global {
  interface Window {
    ethereum?: InjectedWalletProvider
  }
}

export type ChainData = {
  chainId: string
  chainName: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  rpcUrls: string[]
  blockExplorerUrls: string[]
}

export type ChainInfo = ChainData | string | number

export type ConnectionData = {
  accounts: string[]
  chainId: string
}

export interface LotwConnector<Id extends string> {
  id(): Id
  getProvider(): Web3Provider
  connect(chainInfo?: ChainInfo): Promise<ConnectionData>
  reconnect(): Promise<ConnectionData>
  disconnect(): void
  on(event: 'accountsChanged', callback: (accounts: string[]) => void): void
  on(event: 'chainChanged', callback: (chainId: string) => void): void
}

export type ConnectorOptions = {
  /**
   * One of:
   * - Chain id as hex (`'0x1'`)
   * - Chain id as decimal (`1`)
   * - ChainData object
   */
  chainInfo?: ChainInfo
}

export type RegisteredConnectorsMap<Id extends string> = Map<
  Id,
  LotwConnector<Id>
>

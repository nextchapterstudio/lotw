import type { BrowserProvider, Eip1193Provider } from 'ethers'

export type InjectedProvider = Eip1193Provider & {
  isMetaMask?: boolean
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

export type Connection = {
  data: {
    accounts: string[]
    chainId: string
  }
  provider: BrowserProvider
}

export interface LotwConnector<Id extends string> {
  id(): Id
  connect(chainInfo?: ChainInfo): Promise<Connection>
  reconnect(): Promise<Connection>
  disconnect(): void

  on(event: 'accountsChanged', callback: (accounts: string[]) => void): void
  on(event: 'chainChanged', callback: (chainId: string) => void): void
  on(event: 'disconnect', callback: (error: unknown) => void): void
  on(
    event: 'connect',
    callback: (connectInfo: { chainId: string }) => void
  ): void

  off(event: 'accountsChanged', callback: (accounts: string[]) => void): void
  off(event: 'chainChanged', callback: (chainId: string) => void): void
  off(event: 'disconnect', callback: (error: unknown) => void): void
  off(
    event: 'connect',
    callback: (connectInfo: { chainId: string }) => void
  ): void

  once(event: 'accountsChanged', callback: (accounts: string[]) => void): void
  once(event: 'chainChanged', callback: (chainId: string) => void): void
  once(event: 'disconnect', callback: (error: unknown) => void): void
  once(
    event: 'connect',
    callback: (connectInfo: { chainId: string }) => void
  ): void
}

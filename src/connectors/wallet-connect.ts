import type {
  ChainInfo,
  LotwConnectorOptions,
  ConnectionData,
  LotwConnector,
} from '../types'
import type { IWalletConnectProviderOptions } from '@walletconnect/types'

import WalletConnectProvider from '@walletconnect/web3-provider'

import { Web3Provider, chainIdFromChainInfo } from '../helpers'

type WalletConnectOptions = IWalletConnectProviderOptions & LotwConnectorOptions

export class WalletConnectConnector implements LotwConnector<'WalletConnect'> {
  options: WalletConnectOptions
  wcProvider: WalletConnectProvider | null = null
  provider: Web3Provider | null = null

  constructor(options: WalletConnectOptions) {
    this.options = options
  }

  protected _getWCProvider(): WalletConnectProvider {
    if (this.wcProvider) {
      return this.wcProvider
    }

    return (this.wcProvider = new WalletConnectProvider(this.options))
  }

  getProvider(): Web3Provider {
    if (this.provider) {
      return this.provider
    }

    return (this.provider = new Web3Provider(this._getWCProvider()))
  }

  id() {
    return 'WalletConnect' as const
  }

  async connect(chainInfo?: ChainInfo | undefined): Promise<ConnectionData> {
    const wcProvider = this._getWCProvider()
    const provider = this.getProvider()

    try {
      await wcProvider.enable()
    } catch (error) {
      console.log('Failed to enable provider')
      // Disconnect and null out WC Provider
      // This resets the qr code modal
      await wcProvider.disconnect()
      this.wcProvider = null
      throw error
    }

    const accounts = wcProvider.accounts
    const chainId = `0x${wcProvider.chainId.toString(16)}`

    const targetChainInfo = chainInfo ?? this.options.chainInfo
    const desiredChainId = targetChainInfo
      ? chainIdFromChainInfo(targetChainInfo)
      : undefined

    if (!desiredChainId || chainId === desiredChainId) {
      return {
        accounts,
        chainId,
      }
    }

    try {
      await provider.send('wallet_switchEthereumChain', [
        { chainId: parseInt(desiredChainId!, 16) },
      ])
    } catch (error: any) {
      if (typeof targetChainInfo === 'object') {
        await provider.send('wallet_addEthereumChain', [targetChainInfo])
      }
    }

    return {
      accounts,
      chainId,
    }
  }

  async reconnect(): Promise<ConnectionData> {
    const wcProvider = this._getWCProvider()

    await wcProvider.enable()

    return {
      accounts: wcProvider.accounts,
      chainId: `0x${wcProvider.chainId.toString(16)}`,
    }
  }

  disconnect(): void {
    localStorage.removeItem('walletconnect')
  }

  on(event: 'accountsChanged', callback: (accounts: string[]) => void): void
  on(event: 'chainChanged', callback: (chainId: string) => void): void
  on(event: 'disconnect', callback: (arg: unknown) => void): void
  on(
    event: 'connect',
    callback: (connectInfo: { chainId: string }) => void
  ): void
  on(event: string, callback: (...args: any[]) => void): void {
    const provider = this.getProvider()

    // @ts-expect-error
    provider?.provider.on(event, callback)
  }

  off(event: 'accountsChanged', callback: (accounts: string[]) => void): void
  off(event: 'chainChanged', callback: (chainId: string) => void): void
  off(event: 'disconnect', callback: (arg: unknown) => void): void
  off(
    event: 'connect',
    callback: (connectInfo: { chainId: string }) => void
  ): void
  off(event: string, callback: (...args: any[]) => void): void {
    const provider = this.getProvider()

    // @ts-expect-error
    provider?.provider.off(event, callback)
  }

  once(event: 'accountsChanged', callback: (accounts: string[]) => void): void
  once(event: 'chainChanged', callback: (chainId: string) => void): void
  once(event: 'disconnect', callback: (arg: unknown) => void): void
  once(
    event: 'connect',
    callback: (connectInfo: { chainId: string }) => void
  ): void
  once(event: string, callback: (...args: any[]) => void): void {
    const provider = this.getProvider()

    // @ts-expect-error
    provider?.provider.once(event, callback)
  }
}

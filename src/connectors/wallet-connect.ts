import { BrowserProvider } from 'ethers'
import WalletConnectProvider from '@walletconnect/web3-provider'

import type { ChainInfo, Connection, LotwConnector } from '../types'

import { chainIdFromChainInfo } from '../helpers'

type WalletConnectOptions = ConstructorParameters<
  typeof WalletConnectProvider
>[0]

export class WalletConnectConnector implements LotwConnector<'WalletConnect'> {
  options: WalletConnectOptions
  wcProvider: WalletConnectProvider | null = null
  provider: BrowserProvider | null = null

  constructor(options: WalletConnectOptions) {
    this.options = options
  }

  protected _getWCProvider(): WalletConnectProvider {
    if (this.wcProvider) {
      return this.wcProvider
    }

    return (this.wcProvider = new WalletConnectProvider(this.options))
  }

  getProvider(): BrowserProvider {
    if (this.provider) {
      return this.provider
    }

    return (this.provider = new BrowserProvider(this._getWCProvider()))
  }

  id() {
    return 'WalletConnect' as const
  }

  async connect(targetChainInfo: ChainInfo): Promise<Connection> {
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

    const desiredChainId = targetChainInfo
      ? chainIdFromChainInfo(targetChainInfo)
      : undefined

    if (!desiredChainId || chainId === desiredChainId) {
      return {
        data: {
          accounts,
          chainId,
        },
        provider,
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
      data: {
        accounts,
        chainId,
      },
      provider,
    }
  }

  async reconnect(): Promise<Connection> {
    const wcProvider = this._getWCProvider()

    await wcProvider.enable()

    return {
      data: {
        accounts: wcProvider.accounts,
        chainId: `0x${wcProvider.chainId.toString(16)}`,
      },
      provider: this.getProvider(),
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

    provider?.provider.once(event, callback)
  }
}

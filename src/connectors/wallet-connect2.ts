import type {
  EthereumProviderOptions,
  EthereumProvider as EthereumProviderType,
} from '@walletconnect/ethereum-provider/dist/types/EthereumProvider'
import type { Eip1193Provider } from 'ethers'

import { BrowserProvider } from 'ethers'
import { EthereumProvider } from '@walletconnect/ethereum-provider'

import type { ChainInfo, Connection, LotwConnector } from '../types'

import { chainIdFromChainInfo } from '../helpers'

export class WalletConnectConnector implements LotwConnector<'WalletConnect'> {
  options: EthereumProviderOptions
  ethereumProvider: EthereumProviderType | null = null
  browserProvider: BrowserProvider | null = null

  constructor(options: EthereumProviderOptions) {
    this.options = options
  }

  async #getEthereumProvider(): Promise<{
    ethereumProvider: EthereumProviderType
    browserProvider: BrowserProvider
  }> {
    if (this.ethereumProvider) {
      return {
        ethereumProvider: this.ethereumProvider,
        browserProvider: this.browserProvider!,
      }
    }

    const ethereumProvider = await EthereumProvider.init(this.options)
    const browserProvider = new BrowserProvider(
      ethereumProvider as Eip1193Provider
    )

    this.ethereumProvider = ethereumProvider
    this.browserProvider = browserProvider

    return {
      ethereumProvider,
      browserProvider,
    }
  }

  id() {
    return 'WalletConnect' as const
  }

  async connect(targetChainInfo?: ChainInfo): Promise<Connection> {
    const { ethereumProvider, browserProvider } =
      await this.#getEthereumProvider()

    try {
      await ethereumProvider.enable()
    } catch (error) {
      console.log('Failed to enable provider')
      // Disconnect and null out WC Provider
      // This resets the qr code modal
      await ethereumProvider.disconnect()
      throw error
    }

    const accounts = ethereumProvider.accounts
    const chainId = `0x${ethereumProvider.chainId.toString(16)}`

    const desiredChainId = targetChainInfo
      ? chainIdFromChainInfo(targetChainInfo)
      : undefined

    if (!desiredChainId || chainId === desiredChainId) {
      return {
        data: {
          accounts,
          chainId,
        },
        provider: browserProvider,
      }
    }

    try {
      await ethereumProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: parseInt(desiredChainId!, 16) }],
      })
    } catch (error: any) {
      if (typeof targetChainInfo === 'object') {
        await ethereumProvider.request({
          method: 'wallet_addEthereumChain',
          params: [targetChainInfo],
        })
      }
    }

    return {
      data: {
        accounts,
        chainId,
      },
      provider: browserProvider,
    }
  }

  async reconnect(): Promise<Connection> {
    const { ethereumProvider, browserProvider } =
      await this.#getEthereumProvider()

    await ethereumProvider.enable()

    return {
      data: {
        accounts: ethereumProvider.accounts,
        chainId: `0x${ethereumProvider.chainId.toString(16)}`,
      },
      provider: browserProvider,
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
    const provider = this.browserProvider

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
    const provider = this.browserProvider

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
    const provider = this.browserProvider

    provider?.provider.once(event, callback)
  }
}

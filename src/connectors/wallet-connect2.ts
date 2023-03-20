import type {
  EthereumProviderOptions,
  EthereumProvider as EthereumProviderType,
} from '@walletconnect/ethereum-provider/dist/types/EthereumProvider'

import { BrowserProvider } from 'ethers'
import { EthereumProvider } from '@walletconnect/ethereum-provider'

import type { ChainInfo, Connection, LotwConnector } from '../types'

import { chainIdFromChainInfo } from '../helpers'

export class WalletConnect2Connector
  implements LotwConnector<'WalletConnect2'>
{
  options: EthereumProviderOptions
  ethereumProvider: EthereumProviderType | null = null

  constructor(options: EthereumProviderOptions) {
    this.options = options
  }

  async #getEthereumProvider(): Promise<EthereumProviderType> {
    if (this.ethereumProvider) {
      return this.ethereumProvider
    }

    const ethereumProvider = await EthereumProvider.init(this.options)

    return (this.ethereumProvider = ethereumProvider)
  }

  id() {
    return 'WalletConnect2' as const
  }

  async connect(targetChainInfo?: ChainInfo): Promise<Connection> {
    const ethereumProvider = await this.#getEthereumProvider()

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
        provider: new BrowserProvider(ethereumProvider),
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
      provider: new BrowserProvider(ethereumProvider),
    }
  }

  async reconnect(): Promise<Connection> {
    const ethereumProvider = await this.#getEthereumProvider()

    await ethereumProvider.enable()

    return {
      data: {
        accounts: ethereumProvider.accounts,
        chainId: `0x${ethereumProvider.chainId.toString(16)}`,
      },
      provider: new BrowserProvider(ethereumProvider),
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
  on(
    event: 'accountsChanged' | 'chainChanged' | 'connect' | 'disconnect',
    callback: (...args: any[]) => void
  ): void {
    const provider = this.ethereumProvider

    provider?.on(event, callback)
  }

  off(event: 'accountsChanged', callback: (accounts: string[]) => void): void
  off(event: 'chainChanged', callback: (chainId: string) => void): void
  off(event: 'disconnect', callback: (arg: unknown) => void): void
  off(
    event: 'connect',
    callback: (connectInfo: { chainId: string }) => void
  ): void
  off(
    event: 'accountsChanged' | 'chainChanged' | 'connect' | 'disconnect',
    callback: (...args: any[]) => void
  ): void {
    const provider = this.ethereumProvider

    provider?.off(event, callback)
  }

  once(event: 'accountsChanged', callback: (accounts: string[]) => void): void
  once(event: 'chainChanged', callback: (chainId: string) => void): void
  once(event: 'disconnect', callback: (arg: unknown) => void): void
  once(
    event: 'connect',
    callback: (connectInfo: { chainId: string }) => void
  ): void
  once(
    event: 'accountsChanged' | 'chainChanged' | 'connect' | 'disconnect',
    callback: (...args: any[]) => void
  ): void {
    const provider = this.ethereumProvider

    provider?.once(event, callback)
  }
}

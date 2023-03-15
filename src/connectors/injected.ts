import { BrowserProvider } from 'ethers'

import type {
  ChainInfo,
  Connection,
  InjectedWalletProvider,
  LotwConnector,
} from '../types'

import { chainIdFromChainInfo } from '../helpers'
import { LotwError } from '../lotw-error'

export class BaseInjectedConnector<Id extends string>
  implements LotwConnector<Id>
{
  provider: BrowserProvider | null = null
  _id: Id

  constructor(id: Id) {
    this._id = id
  }

  id(): Id {
    return this._id
  }

  protected getEthereumObject(): InjectedWalletProvider {
    const ethereum = window.ethereum

    if (!ethereum) {
      throw 'No ethereum provider found'
    }

    return ethereum
  }

  getProvider(): BrowserProvider {
    if (this.provider) return this.provider

    let ethereum = this.getEthereumObject()

    return (this.provider = new BrowserProvider(ethereum))
  }

  async connect(targetChainInfo?: ChainInfo): Promise<Connection> {
    const provider = this.getProvider()

    try {
      const [accounts, chainId]: [string[], string] = await Promise.all([
        provider.send('eth_requestAccounts', []),
        provider.send('eth_chainId', []),
      ])

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
          { chainId: desiredChainId },
        ])
      } catch (error: any) {
        if (
          (error.code === 4902 || error.data?.originalError?.code === 4902) &&
          typeof targetChainInfo === 'object'
        ) {
          await provider.send('wallet_addEthereumChain', [targetChainInfo])
        }
      }

      return {
        data: {
          accounts,
          chainId: desiredChainId,
        },
        provider,
      }
    } catch (err: any) {
      if (
        (err?.code === 4001 && typeof err?.message === 'string') ||
        err?.message === 'User closed modal'
      ) {
        const error = new LotwError({ code: 'USER_REJECTED', cause: err })

        throw error
      }

      const error = new LotwError({
        code: 'CONNECTOR_ERROR',
        cause: err,
      })

      throw error
    }
  }

  async reconnect(): Promise<Connection> {
    const provider = this.getProvider()

    const [accounts, chainId] = await Promise.all([
      provider.send('eth_accounts', []),
      provider.send('eth_chainId', []),
    ])

    return {
      data: {
        accounts,
        chainId,
      },
      provider,
    }
  }

  disconnect(): void {}

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

const INJECTED_CONNECTOR_ID = 'Injected'
export class InjectedConnector extends BaseInjectedConnector<
  typeof INJECTED_CONNECTOR_ID
> {
  constructor() {
    super(INJECTED_CONNECTOR_ID)
  }
}

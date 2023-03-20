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

  async connect(targetChainInfo?: ChainInfo): Promise<Connection> {
    const desiredChainId = targetChainInfo
      ? chainIdFromChainInfo(targetChainInfo)
      : undefined

    const ethereum = this.getEthereumObject()

    try {
      const [accounts, chainId]: [string[], string] = await Promise.all([
        ethereum.request({ method: 'eth_requestAccounts' }),
        ethereum.request({ method: 'eth_chainId' }),
      ])

      if (!desiredChainId || chainId === desiredChainId) {
        return {
          data: {
            accounts,
            chainId,
          },
          provider: new BrowserProvider(ethereum),
        }
      }

      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: desiredChainId }],
        })
      } catch (error: any) {
        if (
          (error.code === 4902 || error.data?.originalError?.code === 4902) &&
          typeof targetChainInfo === 'object'
        ) {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [targetChainInfo],
          })
        }
      }

      return {
        data: {
          accounts,
          chainId: desiredChainId,
        },
        provider: new BrowserProvider(ethereum),
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
    const ethereum = this.getEthereumObject()

    const [accounts, chainId] = await Promise.all([
      ethereum.request({ method: 'eth_accounts' }),
      ethereum.request({ method: 'eth_chainId' }),
    ])

    return {
      data: {
        accounts,
        chainId,
      },
      provider: new BrowserProvider(ethereum),
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
    // @ts-ignore
    this.getEthereumObject().on(event, callback)
  }

  off(event: 'accountsChanged', callback: (accounts: string[]) => void): void
  off(event: 'chainChanged', callback: (chainId: string) => void): void
  off(event: 'disconnect', callback: (arg: unknown) => void): void
  off(
    event: 'connect',
    callback: (connectInfo: { chainId: string }) => void
  ): void
  off(event: string, callback: (...args: any[]) => void): void {
    // @ts-expect-error
    this.getEthereumObject().removeListener(event, callback)
  }

  once(event: 'accountsChanged', callback: (accounts: string[]) => void): void
  once(event: 'chainChanged', callback: (chainId: string) => void): void
  once(event: 'disconnect', callback: (arg: unknown) => void): void
  once(
    event: 'connect',
    callback: (connectInfo: { chainId: string }) => void
  ): void
  once(event: string, callback: (...args: any[]) => void): void {
    // @ts-expect-error
    this.getEthereumObject().once(event, callback)
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

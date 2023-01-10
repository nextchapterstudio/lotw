import type {
  ChainInfo,
  ConnectionData,
  LotwConnectorOptions,
  InjectedWalletProvider,
  LotwConnector,
} from '../types'

import { Web3Provider, chainIdFromChainInfo } from '../helpers'

export class BaseInjectedConnector<Id extends string>
  implements LotwConnector<Id>
{
  chainInfo?: ChainInfo
  provider: Web3Provider | null = null
  _id: Id

  constructor(id: Id, options?: LotwConnectorOptions) {
    this._id = id
    this.chainInfo = options?.chainInfo
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

  getProvider(): Web3Provider {
    if (this.provider) return this.provider

    let ethereum = this.getEthereumObject()

    return (this.provider = new Web3Provider(ethereum))
  }

  async connect(chainInfo?: ChainInfo | undefined): Promise<ConnectionData> {
    const provider = this.getProvider()

    const [accounts, chainId]: [string[], string] = await Promise.all([
      provider.send('eth_requestAccounts', []),
      provider.send('eth_chainId', []),
    ])

    const targetChainInfo = chainInfo ?? this.chainInfo
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
      accounts,
      chainId: desiredChainId,
    }
  }

  async reconnect(): Promise<ConnectionData> {
    const provider = this.getProvider()

    const [accounts, chainId] = await Promise.all([
      provider.send('eth_accounts', []),
      provider.send('eth_chainId', []),
    ])

    return { accounts, chainId }
  }

  disconnect(): void {}

  on(event: 'accountsChanged', callback: (accounts: string[]) => void): void
  on(event: 'chainChanged', callback: (chainId: string) => void): void
  on(event: 'disconnect', callback: (arg: unknown) => void): void
  on(
    event: 'connect',
    callback: (connectInfo: { chainId: string }) => void
  ): void
  on(event: unknown, callback: unknown): void {
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
  off(event: unknown, callback: unknown): void {
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
  once(event: unknown, callback: unknown): void {
    const provider = this.getProvider()

    // @ts-expect-error
    provider?.provider.once(event, callback)
  }
}

const INJECTED_CONNECTOR_ID = 'Injected'
export class InjectedConnector extends BaseInjectedConnector<
  typeof INJECTED_CONNECTOR_ID
> {
  constructor(options?: LotwConnectorOptions) {
    super(INJECTED_CONNECTOR_ID, options)
  }
}

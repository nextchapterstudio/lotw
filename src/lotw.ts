import type { ChainInfo, LotwConnector } from './types'

import { interpret, type InterpreterFrom, type StateValueFrom } from 'xstate'

import { makeWalletMachine } from './wallet.machine'

type WalletStateValue<Id extends string> = StateValueFrom<
  ReturnType<typeof makeWalletMachine<Id>>
>

export class Lotw<Id extends string> {
  private _walletActor: InterpreterFrom<
    ReturnType<typeof makeWalletMachine<Id>>
  >

  constructor(connectors: LotwConnector<Id>[], _options?: {}) {
    this._walletActor = interpret(makeWalletMachine(connectors)).start()
  }

  is(stateValue: WalletStateValue<Id>) {
    this._walletActor.state.matches(stateValue)
  }

  connectWallet(connector: Id, chainInfo?: ChainInfo) {
    return new Promise<void>((resolve, reject) => {
      this._walletActor.send({
        type: 'CONNECT',
        connector,
        chain: chainInfo,
        successCallback: resolve,
        failureCallback: reject,
      })
    })
  }

  disconnectWallet() {
    this._walletActor.send({ type: 'DISCONNECT' })
  }

  switchNetwork(chainInfo: ChainInfo) {
    return new Promise<void>((resolve, reject) => {
      this._walletActor.send({
        type: 'SWITCH_NETWORK',
        chain: chainInfo,
        successCallback: resolve,
        failureCallback: reject,
      })
    })
  }

  getConnector() {
    return this._walletActor.state.context.connector
  }

  getConnectorId() {
    return this.getConnector()?.id() ?? null
  }

  getProvider() {
    return this.getConnector()?.getProvider() ?? null
  }

  private get _emitter() {
    return this._walletActor.state.context.emitter
  }

  on(
    event: 'connected',
    callback: (accounts: string[], chainId: string) => void
  ): void
  on(event: 'disconnected', callback: () => void): void
  on(event: 'accountsChanged', callback: (accounts: string[]) => void): void
  on(event: 'chainChanged', callback: (chainId: string) => void): void
  on(event: string, callback: (...args: any[]) => void) {
    this._emitter.on(event, callback)
  }

  once(
    event: 'connected',
    callback: (accounts: string[], chainId: string) => void
  ): void
  once(event: 'disconnected', callback: () => void): void
  once(event: 'accountsChanged', callback: (accounts: string[]) => void): void
  once(event: 'chainChanged', callback: (chainId: string) => void): void
  once(event: string, callback: (...args: any[]) => void) {
    this._emitter.once(event, callback)
  }

  off(
    event: 'connected',
    callback: (accounts: string[], chainId: string) => void
  ): void
  off(event: 'disconnected', callback: () => void): void
  off(event: 'accountsChanged', callback: (accounts: string[]) => void): void
  off(event: 'chainChanged', callback: (chainId: string) => void): void
  off(event: string, callback: (...args: any[]) => void) {
    this._emitter.off(event, callback)
  }

  /**
   * Internal use only
   */
  getWalletActor() {
    return this._walletActor
  }
}

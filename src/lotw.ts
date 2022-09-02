import type { InterpreterFrom } from 'xstate'
import type { ChainInfo, LotwConnector } from './types'

import { interpret } from 'xstate'

import { LotwError } from './lotw-error'
import { makeWalletMachine } from './wallet.machine'

export class Lotw<Id extends string> {
  private static _instance: Lotw<string> | null = null
  private _walletActor: InterpreterFrom<
    ReturnType<typeof makeWalletMachine<Id>>
  >

  constructor(connectors: LotwConnector<Id>[], _options?: {}) {
    if (Lotw._instance) {
      throw new LotwError({
        code: 'MULTIPLE_INSTANTIATIONS',
        message:
          'You can only have one instance of Lotw, but you tried to instantiate a second one!',
      })
    }

    // Set the current instance so we can check it later
    // Cast to any because we don't actually need the type, just the value
    Lotw._instance = this as any

    this._walletActor = interpret(makeWalletMachine(connectors)).start()
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

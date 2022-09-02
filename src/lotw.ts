import type { InterpreterFrom } from 'xstate'
import type {
  ChainInfo,
  ConnectorConfig,
  RegisteredConnectorsMap,
} from './types'

import { interpret } from 'xstate'
import { LotwError } from './lotw-error'
import { walletMachine } from './wallet.machine'

export class Lotw<Id extends string> {
  private static _instance: Lotw<string> | null = null
  private _registeredConnectors: RegisteredConnectorsMap<Id> = new Map()
  private _walletActor: InterpreterFrom<typeof walletMachine>

  constructor(connectors: ConnectorConfig<Id>[], _options?: {}) {
    if (Lotw._instance) {
      throw new LotwError({
        code: 'MULTIPLE_INSTANTIATIONS',
        message:
          'You can only have one instance of Lotw, but you tried to instantiate a second one!',
      })
    }

    connectors.forEach((connector) => {
      this._registeredConnectors.set(connector.id(), connector)
    })

    this._walletActor = interpret(
      walletMachine.withContext({
        registeredConnectors: this._registeredConnectors,
        accounts: [],
        connector: null,
        chainId: null,
      })
    ).start()
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

  /**
   * Internal use only
   */
  getWalletActor() {
    return this._walletActor
  }
}

import type { BrowserProvider, Signer } from 'ethers'

import { getAddress as getChecksumAddress } from 'ethers'

import type { ChainInfo, Connection, LotwConnector } from './types'

import { LotwError } from './lotw-error'
import { chainIdFromChainInfo } from './helpers'

export type InferConnectorIds<T extends LotwPocket<string>> =
  T extends LotwPocket<infer Id> ? Id : never

export type LotwPocketOptions = {
  /**
   * One of:
   * - Chain id as hex (`'0x1'`)
   * - Chain id as decimal (`1`)
   * - ChainData object
   */
  chain?: ChainInfo
}

export type LotwEvent<ConnectorId extends string> =
  | Initiailizing
  | Disconnected
  | Connecting
  | Omit<Connected<ConnectorId>, 'connector'>
  | Omit<Switching<ConnectorId>, 'connector'>

export type LotwPocketListener<ConnectorId extends string> = (
  event: LotwEvent<ConnectorId>
) => void

type LotwPocketState<ConnectorId extends string> =
  | Initiailizing
  | Disconnected
  | Connecting
  | Connected<ConnectorId>
  | Switching<ConnectorId>

type Initiailizing = { status: 'initializing' }
type Disconnected = { status: 'disconnected' }
type Connecting = { status: 'connecting' }
type Connected<ConnectorId extends string> = {
  status: 'connected'
  connector: LotwConnector<ConnectorId>
  provider: BrowserProvider
  signer: Signer
  unsubscribe: () => void
  data: Connection['data']
}
type Switching<ConnectorId extends string> = {
  status: 'switching'
  connector: LotwConnector<ConnectorId>
  provider: BrowserProvider
  signer: Signer
  unsubscribe: () => void
  data: Connection['data']
}

export class LotwPocket<ConnectorId extends string> {
  #LOTW_CONNECTOR_KEY = 'lotw::connector'

  #connectors: Map<ConnectorId, LotwConnector<ConnectorId>>
  #options: LotwPocketOptions

  #connectionState: LotwPocketState<ConnectorId>

  private _listeners: LotwPocketListener<ConnectorId>[]

  constructor(
    connectors: LotwConnector<ConnectorId>[],
    options?: LotwPocketOptions
  ) {
    this.#connectors = connectors.reduce((map, connector) => {
      map.set(connector.id(), connector)
      return map
    }, new Map())

    this.#options = options ?? {}
    this._listeners = []
    this.#connectionState = { status: 'initializing' }

    if (typeof window !== 'undefined') {
      this.#init()
    }
  }

  async connectWith(
    connectorId: ConnectorId,
    chain?: ChainInfo
  ): Promise<void> {
    if (
      this.#connectionState.status !== 'connected' &&
      this.#connectionState.status !== 'disconnected'
    ) {
      return
    }

    const connector = this.#connectors.get(connectorId)

    if (!connector) {
      throw new LotwError({
        code: 'CONNECTOR_NOT_REGISTERED',
        message: `No connector registered with id '${connectorId}'`,
      })
    }

    const previousState = this.#connectionState

    if (previousState.status === 'connected') {
      this.#setConnectionState({
        ...previousState,
        status: 'switching',
      })
    } else {
      this.#setConnectionState({ status: 'connecting' })
    }

    try {
      const connection = await connector.connect(chain ?? this.#options.chain)

      if (this.#connectionState) {
        this.disconnect()
      }

      localStorage.setItem(this.#LOTW_CONNECTOR_KEY, connector.id())

      this.#setConnectionState({
        status: 'connected',
        connector: connector,
        provider: connection.provider,
        signer: await connection.provider.getSigner(),
        unsubscribe: this.#subscribe(connector),
        data: connection.data,
      })
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

      this.#setConnectionState(previousState)

      throw error
    }
  }

  disconnect(): void {
    if (this.#connectionState.status !== 'connected') {
      return
    }

    localStorage.removeItem(this.#LOTW_CONNECTOR_KEY)

    this.#connectionState.unsubscribe()
    this.#connectionState.connector.disconnect()

    this.#setConnectionState({ status: 'disconnected' })
  }

  async switchNetwork(chain: ChainInfo): Promise<void> {
    if (this.#connectionState.status !== 'connected') {
      return
    }

    try {
      const connector = this.#connectionState!.connector

      await connector.connect(chain)

      await new Promise<void>((resolve, _) => {
        connector.once('connect', () => {
          resolve()
        })
      })
    } catch (err) {
      throw new LotwError({ code: 'CONNECTOR_ERROR', cause: err })
    }
  }

  /**
   *
   * The current status.
   *
   * Status changes as follows:
   * ```
   * +--------------+  init   +--------------+
   * | Initializing | ------> | Disconnected |<-
   * +--------------+         +--------------+  \
   *       |      disconnect  ^     |            |
   *  init |  /--------------/      | connect    |
   *       v  |                     v            | cancel
   * +-------------+   connected  +------------+ |
   * |  Connected  | <----------- | Connecting |-/
   * +-------------+              +------------+
   *          |  ^
   *  connect |   \
   *          v    | connected/cancel
   * +-----------+ |
   * | Switching |-/
   * +-----------+
   * ```
   */
  status(): LotwPocketState<ConnectorId>['status'] {
    return this.#connectionState.status
  }

  /**
   *
   * Returns the current browser provider. Returns `null` if status is not `connected`.
   */
  provider(): BrowserProvider | null {
    if (this.#connectionState.status === 'connected') {
      return this.#connectionState.provider
    }

    return null
  }

  signer(): Signer | null {
    if (this.#connectionState.status === 'connected') {
      return this.#connectionState.signer
    }

    return null
  }

  /**
   *
   * The ID of the current connector. Returns `null` if status is not `connected`.
   */
  connectorId(): ConnectorId | null {
    if (
      this.#connectionState.status === 'connected' ||
      this.#connectionState.status === 'switching'
    ) {
      return this.#connectionState.connector.id()
    }

    return null
  }

  /**
   *
   * The current accounts. Returns `[]` if status is not `connected`.
   */
  accounts(): string[] {
    if (
      this.#connectionState.status === 'connected' ||
      this.#connectionState.status === 'switching'
    ) {
      return this.#connectionState.data.accounts
    }

    return []
  }

  /**
   *
   * The current chain ID. Returns `null` if status is not `connected`.
   */
  chainId(): string | null {
    if (
      this.#connectionState.status === 'connected' ||
      this.#connectionState.status === 'switching'
    ) {
      return this.#connectionState.data.chainId
    }

    return null
  }

  /**
   *
   * Subscribe to connection state changes.
   */
  subscribe(listener: LotwPocketListener<ConnectorId>): () => void {
    this._listeners.push(listener)

    return () => {
      this._listeners = this._listeners.filter((l) => l !== listener)
    }
  }

  async #init() {
    const connectorId = localStorage.getItem(
      this.#LOTW_CONNECTOR_KEY
    ) as ConnectorId | null

    if (!connectorId) {
      console.error(
        new LotwError({
          code: 'CONNECTOR_NOT_REGISTERED',
          message: `No connector registered with id '${connectorId}'`,
        })
      )
    }

    // Cast to ConnectorId so TS is happy
    // We handle the null case because there is no connector associated to null
    const connector = this.#connectors.get(connectorId as ConnectorId)

    if (!connector) {
      this.#setConnectionState({ status: 'disconnected' })

      return
    }

    try {
      const connection = await connector.reconnect()

      this.#setConnectionState({
        status: 'connected',
        connector,
        provider: connection.provider,
        signer: await connection.provider.getSigner(),
        unsubscribe: this.#subscribe(connector),
        data: connection.data,
      })
    } catch {
      this.#setConnectionState({ status: 'disconnected' })
    }
  }

  #subscribe(connector: LotwConnector<ConnectorId>) {
    const chainChanged = async (rawChainId: string) => {
      if (this.#connectionState.status === 'connected') {
        this.#setConnectionState({
          ...this.#connectionState,
          data: {
            accounts: this.#connectionState.data.accounts,
            chainId: chainIdFromChainInfo(rawChainId),
          },
        })
      }
    }
    const accountsChanged = async (rawAccounts: string[]) => {
      if (rawAccounts.length === 0) {
        this.disconnect()
        return
      }

      if (this.#connectionState.status === 'connected') {
        this.#setConnectionState({
          ...this.#connectionState,
          signer: await this.#connectionState.provider.getSigner(),
          data: {
            chainId: this.#connectionState.data.chainId,
            accounts: rawAccounts.map((account) => getChecksumAddress(account)),
          },
        })
      }
    }

    connector.on('chainChanged', chainChanged)
    connector.on('accountsChanged', accountsChanged)

    return () => {
      connector.off('chainChanged', chainChanged)
      connector.off('accountsChanged', accountsChanged)
    }
  }

  #emit(event: LotwEvent<ConnectorId>) {
    console.info('[lotw]', event.status, event)

    for (const listener of this._listeners) {
      listener(Object.assign({}, event))
    }
  }

  #setConnectionState(newState: LotwPocketState<ConnectorId>) {
    this.#connectionState = newState
    this.#emit(newState)
  }
}

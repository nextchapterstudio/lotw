import type {
  ChainInfo,
  LotwConnector as BaseConnector,
  RegisteredConnectorsMap,
} from './types'

import { createMachine, assign } from 'xstate'
import { TinyEmitter as Emitter } from 'tiny-emitter'

import { LotwError } from './lotw-error'

const LOTW_CONNECTOR_KEY = 'lotw::connector'

type CallbackFunction = () => void

export function makeWalletMachine<Id extends string>(
  connectors: BaseConnector<Id>[]
) {
  type LotwConnector = BaseConnector<Id>

  type WalletEvent =
    | {
      type: 'CONNECT'
      connector: Id
      chain?: ChainInfo
      successCallback?: CallbackFunction
      failureCallback?: (error: unknown) => void
    }
    | { type: 'DISCONNECT' }
    | { type: 'CHANGE_CHAIN'; data: { chainId: string } }
    | { type: 'CHANGE_ACCOUNTS'; data: { accounts: string[] } }
    | {
      type: 'SWITCH_NETWORK'
      chain: ChainInfo
      successCallback?: CallbackFunction
      failureCallback?: (error: unknown) => void
    }

  type WalletContext = {
    emitter: Emitter
    registeredConnectors: RegisteredConnectorsMap<Id>
    connector: LotwConnector | null
    accounts: string[]
    chainId: string | null
  }

  type WalletServices = {
    checkConnectedAccounts: {
      data: {
        connector: LotwConnector
        accounts: string[]
        chainId: string
      }
    }
    connectWallet: {
      data: {
        connector: LotwConnector
        accounts: string[]
        chainId: string
        successCallback?: CallbackFunction
      }
    }
    handleChainOrAccountChange: {
      data: void
    }
    switchNetwork: {
      data: {
        successCallback?: CallbackFunction
      }
    }
  }

  const registeredConnectors = new Map()
  connectors.forEach((connector) =>
    registeredConnectors.set(connector.id(), connector)
  )

  return createMachine(
    {
      // Options
      id: 'Wallet Machine',
      predictableActionArguments: true,
      tsTypes: {} as import('./wallet.machine.typegen').Typegen0,
      schema: {
        events: {} as WalletEvent,
        context: {} as WalletContext,
        services: {} as WalletServices,
      },
      // Actual Machine
      context: {
        emitter: new Emitter(),
        registeredConnectors: registeredConnectors,
        connector: null,
        accounts: [],
        chainId: null,
      },
      initial: 'SSR Check',
      states: {
        'SSR Check': {
          always: {
            target: 'Init',
            cond: 'isClientSide',
          },
        },
        Init: {
          always: {
            target: 'Disconnected',
            cond: 'noProvider',
          },
          invoke: {
            id: 'checkConnectedAccounts',
            src: 'checkConnectedAccounts',
            onDone: [
              {
                target: 'Connected',
                cond: 'hasAccounts',
                actions: [
                  'saveAccountsToContext',
                  'saveChainIdToContext',
                  'saveConnectorToContext',
                ],
              },
              {
                target: 'Disconnected',
              },
            ],
            onError: {
              target: 'Disconnected',
            },
          },
        },
        Disconnected: {
          entry: ['clearContext', 'clearProviderTypeFromLocalStorage'],
          on: {
            CONNECT: {
              target: 'Connecting',
            },
          },
        },
        Connecting: {
          invoke: {
            id: 'connectWallet',
            src: 'connectWallet',
            onDone: {
              target: 'Connected',
              actions: [
                'disconnect',
                'emitDisconnectedEvent',
                'saveAccountsToContext',
                'saveChainIdToContext',
                'saveConnectorToContext',
                'executeSuccessCallback',
                'saveProviderTypeToLocalStorage',
              ],
            },
            onError: {
              target: 'Disconnected',
            },
          },
        },
        Connected: {
          entry: ['emitConnectedEvent'],
          invoke: {
            id: 'handleChainOrAccountChange',
            src: 'handleChainOrAccountChange',
          },
          on: {
            CONNECT: {
              target: 'Connecting',
            },
            DISCONNECT: {
              target: 'Disconnected',
              actions: ['disconnect', 'emitDisconnectedEvent'],
            },
            CHANGE_CHAIN: {
              actions: ['saveChainIdToContext', 'emitChainChangedEvent'],
            },
            CHANGE_ACCOUNTS: {
              actions: ['saveAccountsToContext', 'emitAccountsChangedEvent'],
            },
          },
          initial: 'Idle',
          states: {
            Idle: {
              on: {
                SWITCH_NETWORK: {
                  target: 'Switching Network',
                },
              },
            },
            'Switching Network': {
              invoke: {
                id: 'switchNetwork',
                src: 'switchNetwork',
                onDone: {
                  target: 'Idle',
                  actions: ['executeSuccessCallback'],
                },
                onError: {
                  target: 'Idle',
                },
              },
            },
          },
        },
      },
    },
    {
      actions: {
        clearContext: assign((_c, _e) => {
          return {
            chainId: null,
            accounts: [],
            connector: null,
          }
        }),
        clearProviderTypeFromLocalStorage: () => {
          localStorage.removeItem(LOTW_CONNECTOR_KEY)
        },
        saveAccountsToContext: assign((_, e) => {
          return {
            accounts: e.data.accounts,
          }
        }),
        saveChainIdToContext: assign((_, e) => {
          return {
            chainId: e.data.chainId,
          }
        }),
        saveConnectorToContext: assign((_, e) => {
          return {
            connector: e.data.connector,
          }
        }),
        saveProviderTypeToLocalStorage: (_, e) => {
          localStorage.removeItem(LOTW_CONNECTOR_KEY)
          localStorage.setItem(LOTW_CONNECTOR_KEY, e.data.connector.id())
        },
        executeSuccessCallback: (_, e) => {
          const callback = e.data.successCallback
          callback?.()
        },
        disconnect: (c) => {
          c.connector?.disconnect()
        },
        emitConnectedEvent: (c, e) => {
          c.emitter.emit('connected', e.data.accounts, e.data.chainId)
        },
        emitDisconnectedEvent: (c) => {
          c.emitter.emit('disconnected')
        },
        emitAccountsChangedEvent: (c, e) => {
          c.emitter.emit('accountsChanged', e.data.accounts)
        },
        emitChainChangedEvent: (c, e) => {
          c.emitter.emit('chainChanged', e.data.chainId)
        },
      },
      guards: {
        isClientSide: () => {
          return typeof window !== 'undefined'
        },
        hasAccounts: (_, e) => {
          return !!e.data.accounts.length
        },
        noProvider: () => {
          const connectorId = localStorage.getItem(LOTW_CONNECTOR_KEY)

          const hasProvider = !!connectorId

          return !hasProvider
        },
      },
      services: {
        checkConnectedAccounts: async (c) => {
          const connectorId = localStorage.getItem(
            LOTW_CONNECTOR_KEY
          ) as Id | null

          // Error if no connector stored so we go to disconnected state
          if (connectorId === null) throw 'NO_CONNECTOR'

          const connector = c.registeredConnectors.get(connectorId)

          // FIXME: Need to handle asynchronous injection
          if (!connector) {
            throw new LotwError({
              code: 'CONNECTOR_NOT_REGISTERED',
              message: `No connector registered with id '${connectorId}'`,
            })
          }

          const data = await connector.reconnect()

          return { ...data, connector, connectorId }
        },
        connectWallet: async (c, e) => {
          try {
            const connector = c.registeredConnectors.get(e.connector)

            if (!connector) {
              throw new LotwError({
                code: 'CONNECTOR_NOT_REGISTERED',
                message: `No connector registered with id '${e.connector}'`,
              })
            }

            const data = await connector.connect(e.chain)

            return {
              ...data,
              connector,
              connectorId: e.connector,
              successCallback: e.successCallback,
            }
          } catch (err: any) {
            if (
              (err?.code === 4001 && typeof err?.message === 'string') ||
              err?.message === 'User closed modal'
            ) {
              const error = new LotwError({ code: 'USER_REJECTED', cause: err })
              e.failureCallback?.(error)
              throw error
            }

            const error = new LotwError({
              code: 'CONNECTOR_ERROR',
              cause: err,
            })
            e.failureCallback?.(error)
            throw error
          }
        },
        handleChainOrAccountChange: (c) => (send) => {
          c.connector?.on('chainChanged', (chainId) => {
            send({ type: 'CHANGE_CHAIN', data: { chainId } })
          })
          c.connector?.on('accountsChanged', (accounts) => {
            if (accounts.length) {
              send({ type: 'CHANGE_ACCOUNTS', data: { accounts } })
            } else {
              send({ type: 'DISCONNECT' })
            }
          })
          c.connector?.on('disconnect', () => {
            send({ type: 'DISCONNECT' })
          })
        },
        switchNetwork: async (c, e) => {
          try {
            const connector = c.connector!

            await connector.connect(e.chain)

            return {
              successCallback: e.successCallback,
            }
          } catch (err) {
            const error = new LotwError({ code: 'CONNECTOR_ERROR', cause: err })
            e.failureCallback?.(error)
            throw error
          }
        },
      },
    }
  )
}

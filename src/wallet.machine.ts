import type {
  ChainInfo,
  LotwConnector as BaseConnector,
  RegisteredConnectorsMap,
} from './types'

import { createMachine, assign } from 'xstate'
import { TinyEmitter as Emitter } from 'tiny-emitter'
import { getAddress as getChecksumAddress } from '@ethersproject/address'

import { LotwError } from './lotw-error'
import { chainIdFromChainInfo } from './helpers'

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
            onDone: [
              {
                target: 'Connected',
                cond: 'ifCurrentlyConnected',
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
              {
                target: 'Connected',
                actions: [
                  'saveAccountsToContext',
                  'saveChainIdToContext',
                  'saveConnectorToContext',
                  'executeSuccessCallback',
                  'saveProviderTypeToLocalStorage',
                ],
              },
            ],
            onError: {
              target: 'Disconnected',
            },
          },
        },
        Connected: {
          // This ensure that XState has settled on this state, this fixes
          // a race condition when trying to read the connector when
          // recieving the connected event.
          after: { 1: { actions: ['emitConnectedEvent'] } },
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
            accounts: e.data.accounts.map(getChecksumAddress),
          }
        }),
        saveChainIdToContext: assign((_, e) => {
          return {
            chainId: chainIdFromChainInfo(e.data.chainId),
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
        disconnect: (c, _) => {
          c.connector?.disconnect()
        },
        emitConnectedEvent: (c, _) => {
          c.emitter.emit('connected', c.accounts, c.chainId)
        },
        emitDisconnectedEvent: (c, _) => {
          c.emitter.emit('disconnected')
        },
        emitAccountsChangedEvent: (c, _) => {
          c.emitter.emit('accountsChanged', c.accounts)
        },
        emitChainChangedEvent: (c, _) => {
          c.emitter.emit('chainChanged', c.chainId)
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
        ifCurrentlyConnected: (c) => {
          return c.connector !== null
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
          c.connector?.on('chainChanged', (rawChainId) => {
            const chainId = chainIdFromChainInfo(rawChainId)

            console.info('[lotw] chainChanged:', chainId)

            send({
              type: 'CHANGE_CHAIN',
              data: { chainId },
            })
          })
          c.connector?.on('accountsChanged', (rawAccounts) => {
            const accounts = rawAccounts.map((account) =>
              getChecksumAddress(account)
            )

            console.info('[lotw] accountsChanged:', accounts)

            if (rawAccounts.length) {
              send({ type: 'CHANGE_ACCOUNTS', data: { accounts } })
            } else {
              send({ type: 'DISCONNECT' })
            }
          })
        },
        switchNetwork: async (c, e) => {
          try {
            const connector = c.connector!

            await connector.connect(e.chain)

            await new Promise<void>((resolve, _) => {
              connector.once('connect', () => {
                resolve()
              })
            })

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

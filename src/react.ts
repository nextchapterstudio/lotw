import type { LotwPocket } from '.'
import { useSyncExternalStore } from 'react'

export function createHooksFrom<ConnectorId extends string>(
  pocket: LotwPocket<ConnectorId>
) {
  const noop = async (..._args: any[]) => {}
  const connect = pocket.connectWith.bind(pocket)
  const disconnect = pocket.disconnect.bind(pocket)
  const switchNetwork = pocket.switchNetwork.bind(pocket)

  const useConnect = () =>
    useSyncExternalStore(
      pocket.subscribe.bind(pocket),
      () => connect,
      () => noop
    )

  const useDisconnect = () =>
    useSyncExternalStore(
      pocket.subscribe.bind(pocket),
      () => disconnect,
      () => noop
    )

  const useSwitchNetwork = () =>
    useSyncExternalStore(
      pocket.subscribe.bind(pocket),
      () => switchNetwork,
      () => noop
    )

  const usePocketState = () =>
    useSyncExternalStore(
      pocket.subscribe.bind(pocket),
      () => pocket.status(),
      (): ReturnType<LotwPocket<ConnectorId>['status']> => 'initializing'
    )

  const useProvider = () =>
    useSyncExternalStore(
      pocket.subscribe.bind(pocket),
      () => pocket.provider(),
      () => null
    )

  const useSigner = () =>
    useSyncExternalStore(
      pocket.subscribe.bind(pocket),
      () => pocket.signer(),
      () => null
    )

  const useConnectorId = () =>
    useSyncExternalStore(
      pocket.subscribe.bind(pocket),
      () => pocket.connectorId(),
      () => null
    )

  const useChainId = () =>
    useSyncExternalStore(
      pocket.subscribe.bind(pocket),
      () => pocket.chainId(),
      () => null
    )

  const useAccounts = () =>
    useSyncExternalStore(
      pocket.subscribe.bind(pocket),
      () => pocket.accounts(),
      () => pocket.accounts()
    )

  return {
    useConnect,
    useDisconnect,
    useSwitchNetwork,
    usePocketState,
    useProvider,
    useSigner,
    useConnectorId,
    useChainId,
    useAccounts,
  }
}

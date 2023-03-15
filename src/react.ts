import type { LotwPocket } from '.'
import { useSyncExternalStore } from 'react'

export function createHooksFrom<ConnectorId extends string>(
  pocket: LotwPocket<ConnectorId>
) {
  const useConnect = () =>
    useSyncExternalStore(pocket.subscribe, () => pocket.connectWith)

  const useDisconnect = () =>
    useSyncExternalStore(pocket.subscribe, () => pocket.disconnect)

  const useSwitchNetwork = () =>
    useSyncExternalStore(pocket.subscribe, () => pocket.switchNetwork)

  const usePocketState = () =>
    useSyncExternalStore(
      pocket.subscribe,
      () => pocket.status(),
      (): ReturnType<LotwPocket<ConnectorId>['status']> => 'initializing'
    )

  const useProvider = () =>
    useSyncExternalStore(
      pocket.subscribe,
      () => pocket.provider(),
      () => null
    )

  const useSigner = () =>
    useSyncExternalStore(
      pocket.subscribe,
      () => pocket.signer(),
      () => null
    )

  const useConnectorId = () =>
    useSyncExternalStore(
      pocket.subscribe,
      () => pocket.connectorId(),
      () => null
    )

  const useChainId = () =>
    useSyncExternalStore(
      pocket.subscribe,
      () => pocket.chainId(),
      () => null
    )

  const useAccounts = () =>
    useSyncExternalStore(
      pocket.subscribe,
      () => pocket.accounts(),
      () => []
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

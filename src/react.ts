import type { Lotw } from '.'

import { useActor, useSelector } from '@xstate/react'

export function createHooksFrom<Id extends string>(lotw: Lotw<Id>) {
  const walletActor = lotw.getWalletActor()

  return {
    useWalletActor: () => useActor(walletActor),
    useProvider: () =>
      useSelector(walletActor, (state) =>
        state.context.connector?.getProvider()
      ),
    useChainId: () =>
      useSelector(walletActor, (state) => state.context.chainId),
    useAccounts: () =>
      useSelector(walletActor, (state) => state.context.accounts),
  }
}

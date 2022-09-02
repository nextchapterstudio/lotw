import type { ChainInfo } from './types'

import { providers } from 'ethers'

export class Web3Provider extends providers.Web3Provider {}

function assertNever(value: never, message?: string) {
  throw new Error(message ?? `Unexpect value when never was expected: ${value}`)
}

export function chainIdFromChainInfo(
  chainInfo: ChainInfo | undefined
): string | undefined {
  switch (typeof chainInfo) {
    case 'undefined':
      return chainInfo
    case 'object':
      return chainInfo.chainId
    case 'string':
      return chainInfo
    case 'number':
      return `0x${chainInfo.toString(16)}`
    default:
      assertNever(
        chainInfo,
        `Unexpected type of chainInfo: ${typeof chainInfo} (${chainInfo})`
      )
  }
}

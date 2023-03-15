import type { ChainInfo } from './types'

function assertNever(value: never, message?: string) {
  throw new Error(message ?? `Unexpect value when never was expected: ${value}`)
}

export function chainIdFromChainInfo(chainInfo: ChainInfo): string {
  switch (typeof chainInfo) {
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

  return ''
}

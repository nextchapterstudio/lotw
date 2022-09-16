# LOTW

Web3 Wallet connection driven by state charts!

Documentation is work-in-progress

## Install 

To install LOTW, you will also need to install xstate and ethers:
```bash
yarn add lotw xstate @xstate/react ethers
```

## Setup

```ts
// src/utils/lotw.ts (or wherever)

import { Lotw, type InferConnectorIds } from 'lotw'
import { MetaMaskConnector } from 'lotw/connectors/metamask'
import { createHooksFrom } from 'lotw/react'

export type Connectors = InferConnectorIds<typeof lotw>

export const lotw = new Lotw([
  new MetaMaskConnector(),
])

export const { useChainId, useAccounts, useProvider, useWalletActor } =
  createHooksFrom(lotw)
```
```ts
// src/index.ts (src/pages/_app.tsx if using Nextjs)

import 'utils/lotw'

// ... Rest of file
```

## Connectors

### Injected Connector

Just your basic injected connector

```ts
import { InjectedConnector } from 'lotw/connectors/injected'

new InjectedConnector({
  // options
})
```

#### Options

`chainInfo` - The chain info to use when initiating a connection

### MetaMask

Connect with MetaMask

```ts
import { MetaMaskConnector } from 'lotw/connectors/metamask'

new MetaMaskConnector({
  // options
})
```

#### Options

`chainInfo` - The chain info to use when initiating a connection

### Coinbase

Connect with Coinbase

```ts
import { CoinbaseConnector } from 'lotw/connectors/coinbase'

new CoinbaseConnector({
  // options
})
```

#### Options

`chainInfo` - The chain info to use when initiating a connection

### Wallet Connect

Connect with Wallet Connect

```ts
import { WalletConnectConnector } from 'lotw/connectors/wallet-connect'

new WalletConnectConnector({
  // options
})
```

#### Options

`chainInfo` - The chain info to use when intiating a connection

All Wallet Connect options

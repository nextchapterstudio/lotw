# lotw

## 4.0.0-next.5

### Patch Changes

- [`4242164`](https://github.com/nextchapterstudio/lotw/commit/4242164ac813d12bdf8da7f16a3bd37079b5619b) Thanks [@nobrayner](https://github.com/nobrayner)! - It should work now (But probably not WalletConnect2)

## 4.0.0-next.4

### Patch Changes

- [`18cd7dc`](https://github.com/nextchapterstudio/lotw/commit/18cd7dc4a00e35694478539529eb647fc14cbd48) Thanks [@nobrayner](https://github.com/nobrayner)! - Don't use private class field syntax?

## 4.0.0-next.3

### Patch Changes

- [`4a958cd`](https://github.com/nextchapterstudio/lotw/commit/4a958cd16705b96db2517db15f8e75654e250a6d) Thanks [@nobrayner](https://github.com/nobrayner)! - Missing build...

## 4.0.0-next.2

### Minor Changes

- [`497c085`](https://github.com/nextchapterstudio/lotw/commit/497c0856e8e385e658edb9eb3d5803d1d4d24507) Thanks [@nobrayner](https://github.com/nobrayner)! - lotw/react - useSigner hook

## 4.0.0-next.1

### Patch Changes

- I suck at NPM. Package now built

## 4.0.0-next.0

### Major Changes

- [`2a26669`](https://github.com/nextchapterstudio/lotw/commit/2a26669fec6024f86a50fa693f84304380803ef6) Thanks [@nobrayner](https://github.com/nobrayner)! - Refactor lotw to be much smaller

### Minor Changes

- [`ef2a3c8`](https://github.com/nextchapterstudio/lotw/commit/ef2a3c82e33ea1fd3621f7dec669c00b1c8c8311) Thanks [@nobrayner](https://github.com/nobrayner)! - Adds a WalletConnect 2 connector

## 3.0.2

### Patch Changes

- [`c46d590`](https://github.com/nextchapterstudio/lotw/commit/c46d5907d8d793b735bad8ef1abbbfa6c6cf4f9c) Thanks [@nobrayner](https://github.com/nobrayner)! - All emitted events are now delayed by a millisecond to allow the machine's context to settle after executing actions. This resolves issues with trying to access accounts or chain from lotw upon receiving an event.

## 3.0.1

### Patch Changes

- [`bb9afea`](https://github.com/nextchapterstudio/lotw/commit/bb9afea085d7457220e8d3df178b573e22c69191) Thanks [@nobrayner](https://github.com/nobrayner)! - Removes the first next call when subscribing to lotw events, as it isn't inline with expectations

## 3.0.0

### Major Changes

- [`71e2fc5`](https://github.com/nextchapterstudio/lotw/commit/71e2fc5b20b5830119ae676d65febcc38629521b) Thanks [@nobrayner](https://github.com/nobrayner)! - Added tags to states for better querying of current state. Rearranged states to better represent what is happening.

### Patch Changes

- [`71e2fc5`](https://github.com/nextchapterstudio/lotw/commit/71e2fc5b20b5830119ae676d65febcc38629521b) Thanks [@nobrayner](https://github.com/nobrayner)! - Added an initialization event that reports the state LOTW has settled on. This allows for waiting for LOTW to start and knowing if it is connected or disconnected.

## 2.0.2

### Patch Changes

- [`05e279f`](https://github.com/nextchapterstudio/lotw/commit/05e279f92bf443e309dc7d61f744c02e49b7cf3f) Thanks [@nobrayner](https://github.com/nobrayner)! - Fixes network switching signalling the new network can be used before it has finished connecting

## 2.0.1

### Patch Changes

- [`c030ebc`](https://github.com/nextchapterstudio/lotw/commit/c030ebc276739cbf918532fc423062f2d814b1be) Thanks [@nobrayner](https://github.com/nobrayner)! - Fixes disconnecting when switching networks. This was caused by an incorrect usage of the 'disconnect' event from wallets

## 2.0.0

### Major Changes

- [`000fdeb`](https://github.com/nextchapterstudio/lotw/commit/000fdeb4c0fd9255db84cbe2123bd41f66815c1f) Thanks [@nobrayner](https://github.com/nobrayner)! - Store wallet address as checksummed address instead of lowercase address

## 1.3.4

### Patch Changes

- [`9214bcd`](https://github.com/nextchapterstudio/lotw/commit/9214bcd5a3bba2769cb0c73a8895f05da434d82f) Thanks [@nobrayner](https://github.com/nobrayner)! - Fixed chainChanged event not unsubscribing correctly

## 1.3.3

### Patch Changes

- [`b91e72d`](https://github.com/nextchapterstudio/lotw/commit/b91e72d5b4d65f5f9754ada24ed23d0059a4d1e4) Thanks [@nobrayner](https://github.com/nobrayner)! - Fixes issue with disconnect event being emitted even though there was no existing connection

## 1.3.2

### Patch Changes

- [`aafc8a8`](https://github.com/nextchapterstudio/lotw/commit/aafc8a80fc1c2e28bb0aa15c106d488e308d452b) Thanks [@nobrayner](https://github.com/nobrayner)! - Lotw.is now correctly returns if it is in the requested state

## 1.3.1

### Patch Changes

- [`d01b39f`](https://github.com/nextchapterstudio/lotw/commit/d01b39f3ecaa1a968f3eda99766bfa1b5a918dc7) Thanks [@alexarcombe](https://github.com/alexarcombe)! - Fixed emitted event from connected to ensure that XState has settled on this state, this fixes a race condition when trying to read the connector when recieving the connected event.

## 1.3.0

### Minor Changes

- [`4c456ac`](https://github.com/nextchapterstudio/lotw/commit/4c456ac24b7985df99e2624f63445d23db5831ff) Thanks [@nobrayner](https://github.com/nobrayner)! - Added the ability to quickly reference accounts and chainId from lotw instance

### Patch Changes

- [`809cd8b`](https://github.com/nextchapterstudio/lotw/commit/809cd8bf84f06ec76eba7e518719d6541e7ce3ef) Thanks [@nobrayner](https://github.com/nobrayner)! - Fixes #19. Disconnects the currently connected connector when connecting while already connected

- [`809cd8b`](https://github.com/nextchapterstudio/lotw/commit/809cd8bf84f06ec76eba7e518719d6541e7ce3ef) Thanks [@nobrayner](https://github.com/nobrayner)! - Fixes #17. Closing the Wallet Connect QR Modal now correctly disposes the modal state, allowing for a second attempt.

- [`e47cc81`](https://github.com/nextchapterstudio/lotw/commit/e47cc8114e7bdb36356bd3e5d0d1172985f6bb96) Thanks [@nobrayner](https://github.com/nobrayner)! - Disconnecting WalletConnect session from your wallet now disconnects Lotw

- [`2b46f5d`](https://github.com/nextchapterstudio/lotw/commit/2b46f5d6a61944af74ed7a0e8b182cd48a131f49) Thanks [@nobrayner](https://github.com/nobrayner)! - Subscribing to Lotw will notify the current state immediately, and then any updates will come through as normal. This fixes hangs while waiting for Lotw to change

## 1.2.2

### Patch Changes

- [`c196542`](https://github.com/nextchapterstudio/lotw/commit/c196542776129eaab3c3c33886be64403385b5fc) Thanks [@nobrayner](https://github.com/nobrayner)! - Fixed disconnect event being emitted after failed connect attempts. The disconnected event will now only be emitted when the state changes from connected to disconnected.

## 1.2.1

### Patch Changes

- [`b9343f7`](https://github.com/nextchapterstudio/lotw/commit/b9343f7e49718d3a5778c1f373757815e2f55b6f) Thanks [@nobrayner](https://github.com/nobrayner)! - Fixed `LotwEvent` not being exported. Oops.

## 1.2.0

### Minor Changes

- [#14](https://github.com/nextchapterstudio/lotw/pull/14) [`67db69d`](https://github.com/nextchapterstudio/lotw/commit/67db69d3d3fc7329c5281b6c25eafd18ea208a46) Thanks [@nobrayner](https://github.com/nobrayner)! - Implement `xstate.Subscribable` for Lotw instances. This allows an Lotw instance to be invoked as a service in other machines.

- [`f03922d`](https://github.com/nextchapterstudio/lotw/commit/f03922da801834568130fc6d1d95bc15ea3c9197) Thanks [@nobrayner](https://github.com/nobrayner)! - Added `InferConnectorIds` type to more easily infer the configured connector ids

## 1.1.0

### Minor Changes

- [#10](https://github.com/nextchapterstudio/lotw/pull/10) [`23624cf`](https://github.com/nextchapterstudio/lotw/commit/23624cf1d2085a3d9c2a3f4bba2f98c950163b61) Thanks [@nobrayner](https://github.com/nobrayner)! - Added `Lotw.is` to query the current state of the underlying machine.

## 1.0.6

### Patch Changes

- [`2188eb0`](https://github.com/nextchapterstudio/lotw/commit/2188eb0688a10fbb1c3ae156e65cbefee322f177) Thanks [@nobrayner](https://github.com/nobrayner)! - Fixed typo in exports for metamask connector

## 1.0.5

### Patch Changes

- [`5c01ca2`](https://github.com/nextchapterstudio/lotw/commit/5c01ca2a28abaa6105d7670b5b62844c197074c6) Thanks [@nobrayner](https://github.com/nobrayner)! - Fixed react entry point. FML

## 1.0.4

### Patch Changes

- [`768bf71`](https://github.com/nextchapterstudio/lotw/commit/768bf71fcf5348e4d85c2a342ac5483e738770b6) Thanks [@nobrayner](https://github.com/nobrayner)! - Fixed multiple entry points. Really. I promise it's right this time!

## 1.0.3

### Patch Changes

- [`4cafde6`](https://github.com/nextchapterstudio/lotw/commit/4cafde64cefa2191442cba07f9897cc170e0ccde) Thanks [@nobrayner](https://github.com/nobrayner)! - Fixed package inclusions... Oops

## 1.0.2

### Patch Changes

- [#3](https://github.com/nextchapterstudio/lotw/pull/3) [`c1403de`](https://github.com/nextchapterstudio/lotw/commit/c1403de890e05a8321baf1b0611982327d0c1407) Thanks [@nobrayner](https://github.com/nobrayner)! - Fixed node resolution hopefully

## 1.0.1

### Patch Changes

- [#2](https://github.com/nextchapterstudio/lotw/pull/2) [`8599ca7`](https://github.com/nextchapterstudio/lotw/commit/8599ca73e3ce68a7491e30636d553564bd052f67) Thanks [@nobrayner](https://github.com/nobrayner)! - Connectors are now split completely for better tree-shaking (hopefully)

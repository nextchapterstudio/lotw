# lotw

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

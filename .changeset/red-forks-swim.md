---
'lotw': patch
---

Fixed emitted event from connected to ensure that XState has settled on this state, this fixes a race condition when trying to read the connector when recieving the connected event.

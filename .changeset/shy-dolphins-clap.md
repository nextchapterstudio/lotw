---
'lotw': patch
---

Fixed disconnect event being emitted after failed connect attempts. The disconnected event will now only be emitted when the state changes from connected to disconnected.

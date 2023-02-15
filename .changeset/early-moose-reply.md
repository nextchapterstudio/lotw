---
'lotw': patch
---

All emitted events are now delayed by a millisecond to allow the machine's context to settle after executing actions. This resolves issues with trying to access accounts or chain from lotw upon receiving an event.

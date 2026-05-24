---
name: paywall-reset
description: Reset localStorage paywall usage for one or all agents so you can re-test the full paywall flow (fresh → aware → warning → locked → PaywallSheet).
disable-model-invocation: true
---

# Paywall Reset

Reset agent usage counters to re-test paywall stages.

## Usage

`/paywall-reset` — reset all agents
`/paywall-reset warren` — reset only WARRen

## Implementation

Run in the browser console (or via a dev script):

**Reset all agents:**
```js
localStorage.removeItem('agentx_usage_warren');
localStorage.removeItem('agentx_usage_sherlock');
localStorage.removeItem('agentx_usage_harvey');
```

**Reset specific agent:**
```js
localStorage.removeItem('agentx_usage_$ARGUMENTS');
```

After resetting, refresh the agent page to see the fresh state.

## Testing the paywall flow

1. `/paywall-reset` → refresh page → verify chatbar shows no counter (stage: fresh)
2. Run one analysis → verify counter appears (stage: aware)
3. Hit the limit → verify in-chat warning message appears (stage: warning)
4. Verify PaywallSheet slides up 800ms after warning (stage: locked)
5. Click "Maybe later" → verify sheet closes but chatbar stays locked
6. Click lock icon → verify PaywallSheet re-opens
7. Refresh page → verify PaywallSheet auto-opens on load when locked

## Limits reference

- WARRen: 1 free run/month
- Sherlock: 1 free scan/month
- Harvey: 10 free rows/month

# Admin fiscal retry contract v1

The payment-detail retry action uses the backend financial-owner adapter and the same payment-owned Agent fiscal intent as POS. It does not execute a raw fiscal-device command from the backend.

Before dispatch, the admin browser creates a command ID, verifies that the backend's authenticated command lookup returns exact `FINANCIAL_COMMAND_NOT_FOUND` for this fresh ID, and durably stores `{commandId,paymentId,payload:"{}",origin}`. Generic 404 or unavailable lookup blocks dispatch to a legacy backend. Storage is scoped to API origin, restaurant, signed-in user, and payment ID. The fixed empty payload cannot change an amount.

POST `/api/v1/admin/billing/payments/{paymentId}/retry-fiscal/` carries `X-Edge-Operation-ID`. The backend requires the assigned owner capability `financial_events_v2`, records a `financial.execute` command, and forwards the canonical POS fiscal retry path to the owner. Execution uses the payment's original cashier, who must remain active and provisioned with POS permission on that Agent. The authenticated admin is recorded separately as `actorUserId`; command lookup is bound to that actor and the selected restaurant. Delegation is restricted to fiscal retry and cannot authorize a new payment. Admin-only users do not need a POS PIN.

After a lost response, reload or another button click performs GET `/api/v1/admin/billing/financial-commands/{operationId}/`. Cloud `retryAllowed:false` means no redispatch. Unknown, generic 404, exact not-found for an existing pending command, malformed success, and transport error preserve the saved ID and display an unknown result. Recovery uses the original successful response. Only an explicit failed owner result or pre-dispatch capability/cashier rejection permits a subsequent new command. Admin sessions remain invalid on POS endpoints.

The lookup must distinguish successful RPC transport from successful fiscal execution. An RPC result with inner `financialCommand.state:unknown` stays unknown even when the RPC itself completed. Applied inbox evidence can supply the original response. The UI never treats an empty fiscal-results list as success.

Release together with backend inbox v2 / cloud command lookup, Agent financialCommandVersion 1 / schema 7, and the POS v1 command contract. Preserve Agent and fiscal-service databases across upgrades. Browser storage removal is not a financial recovery procedure.

# Kacher Dokan v24 — User Friendly + Reliability Upgrade

This build continues from the Spring Boot v23 project. The backend remains Spring Boot + MongoDB Atlas; the existing web/mobile structure is preserved.

## Implemented improvements

1. **Stronger order-status rules**
   - Seller flow is enforced: PLACED → ACCEPTED → PREPARING → READY.
   - Seller cannot skip directly to OUT_FOR_DELIVERY or DELIVERED.
   - Rider pickup verification moves READY → OUT_FOR_DELIVERY.
   - Rider completion moves OUT_FOR_DELIVERY → DELIVERED.
   - Existing tracking timeline remains visible to the customer.

2. **Independent UI and voice language**
   - Interface language and voice language are now separate preferences.
   - English UI + Bangla voice and Bangla UI + English voice are supported.
   - Seller dashboard has a manual voice-language selector and Test Voice button.
   - Mobile profile includes a separate voice-language setting.

3. **More reliable voice alerts**
   - Web voice announcements use a queue so multiple alerts do not overlap.
   - Replay remains available.
   - Browser/device speech is used as fallback if backend TTS is unavailable.

4. **Better inventory / checkout safety**
   - Added `/api/cart/validate` to re-check availability and stock before checkout.
   - Product stock reservation is atomic per item and rolls back already-reserved items if a later item fails in the same order.
   - Customers receive a clear cart warning when stock changed or an item became unavailable.

5. **Clearer payment and refund states**
   - Supports visible Pending / Paid / Refund Requested / Refunded states.
   - Cancelling a paid demo order marks its payment as REFUND_PENDING.
   - Seller can mark a pending demo refund as completed.
   - Payment history endpoint now includes non-paid/refund states as well.

6. **Better chat experience**
   - Messages store read state (`readBy`).
   - Opening an order chat marks incoming messages as read.
   - Added `/api/chat/unread` with total and per-order unread counts.
   - Customer order cards can show per-order unread chat badges.
   - Sent/read indicators are shown on web chat messages.

7. **More useful seller analytics**
   - Date range filters.
   - Previous-week / previous-month sales comparison percentages.
   - Best-selling products remain available.
   - Cancellation reason summary.
   - CSV export endpoint and web button.

8. **Profile + Add Inventory UI polish**
   - Profile modal is more compact on desktop, uses a two-column layout, and opens in a clean view mode before editing.
   - Add Inventory form uses a more compact responsive two-column desktop layout with sticky save action.
   - Mobile retains a one-column touch-friendly layout.

## Important notes
- bKash/Nagad/Upay remain academic/demo payment flows, not official production gateways.
- Maven is required on the target machine to run the Spring Boot backend.
- Continuous GPS tracking was intentionally not added because it was removed from the requested priority list.

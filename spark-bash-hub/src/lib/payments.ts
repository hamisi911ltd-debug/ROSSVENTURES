import type { BookingRow } from "./types";
import { updateBooking, type KVStore } from "./store";
import { fetchPaymentStatus, type ParsedCallback } from "./payhero";

/**
 * Decide a booking's payment outcome from PayHero's own transaction-status API.
 * Nothing the browser (or an unverified webhook body) says can mark a booking paid.
 */
export async function reconcileBooking(booking: BookingRow, kv: KVStore | null): Promise<BookingRow> {
  if (booking.status === "paid" || !booking.payment_reference) return booking;

  const s = await fetchPaymentStatus(booking.payment_reference);
  if (!s.ok) return booking;

  if (s.state === "paid") {
    // Never accept an under-payment
    if (s.amount !== null && s.amount < booking.amount) return booking;
    return (
      (await updateBooking(
        booking.id,
        { status: "paid", mpesa_receipt: s.receipt ?? booking.mpesa_receipt, paid_at: new Date().toISOString() },
        kv,
      )) ?? booking
    );
  }
  if (s.state === "failed" && booking.status === "pending") {
    return (await updateBooking(booking.id, { status: "failed" }, kv)) ?? booking;
  }
  return booking;
}

/**
 * Handle a (signature-verified) callback. Prefer PayHero's status API as the judge; only if that
 * API cannot be reached do we fall back to the callback body, and then only when it matches the
 * booking exactly (reference, checkout id and amount).
 */
export async function applyCallback(booking: BookingRow, cb: ParsedCallback, kv: KVStore | null): Promise<BookingRow> {
  if (booking.status === "paid") return booking;

  const verified = await reconcileBooking(booking, kv);
  if (verified.status === "paid" || verified.status === "failed") return verified;

  // Status API gave no verdict (unreachable or still queued) — consider the callback itself
  const statusReachable = booking.payment_reference ? (await fetchPaymentStatus(booking.payment_reference)).ok : false;
  if (statusReachable) return verified;

  const matches =
    cb.bookingId === booking.id &&
    (!booking.mpesa_checkout_id || !cb.checkoutRequestId || cb.checkoutRequestId === booking.mpesa_checkout_id);

  if (cb.state === "paid" && matches && cb.amount !== null && cb.amount >= booking.amount && cb.receipt) {
    return (
      (await updateBooking(booking.id, { status: "paid", mpesa_receipt: cb.receipt, paid_at: new Date().toISOString() }, kv)) ?? booking
    );
  }
  if (cb.state === "failed" && matches && booking.status === "pending") {
    return (await updateBooking(booking.id, { status: "failed" }, kv)) ?? booking;
  }
  return verified;
}

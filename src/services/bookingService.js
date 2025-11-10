// src/services/bookingService.js
import { readBookings, writeBookings } from "../utils/storage.js";

export function findBookingByIdempotenceKey(idempotenceKey) {
  const bookings = readBookings();
  return bookings.find(b => b.idempotenceKey === idempotenceKey);
}

export function addBooking(booking, idempotenceKey) {
  const bookings = readBookings();
  bookings.push({ ...booking, idempotenceKey, status: 'received' });
  writeBookings(bookings);
  return booking;
}

export function updateBookingStatus(uniqueIdentifier, status) {
  const bookings = readBookings();
  const booking = bookings.find(b => b.uniqueIdentifier === uniqueIdentifier);
  if (booking) {
    booking.status = status;
    writeBookings(bookings);
  }
  return { ...booking, status }; // <-- devolvemos estado actualizado
}

export function processBooking(payload, idempotenceKey) {
  return new Promise((resolve) => {
    if (!findBookingByIdempotenceKey(idempotenceKey)) {
      addBooking(payload, idempotenceKey);

      // Simulación de procesamiento asincrónico
      setTimeout(() => {
        const updatedBooking = updateBookingStatus(payload.uniqueIdentifier, 'processed');
        console.log(`Booking processed: ${payload.uniqueIdentifier}`);
        resolve({ status: updatedBooking.status, details: "Processed successfully" });
      }, 3000);
    } else {
      resolve({ status: "already_processed", details: "Booking already exists" });
    }
  });
}

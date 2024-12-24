import createConnection from "./config/databaseConnection.mjs";
import {
  updateTripDocumentForTripCreation,
  fetchTripDetailsAndTrigger,
  updateExpiredBooking,
  updateBookingPaymentSucess,
  scheduleBookingClosingEvent,
  closeBooking,
  cancellBooking,
} from "./service/service.mjs";

createConnection();

export const handler = async (event) => {
  console.log(`trip support service event triggered`);
  try {
    const { internalEventType } = event.detail;

    if (internalEventType === "EVN_TRIP_DETAIL_FETCHED") {
      console.log(
        `1, trip support service event triggered, ${internalEventType} `
      );
      const {
        tripId,
        tripDate,
        startLocation,
        endLocation,
        route,
        schedule,
        vehicle,
        driver,
        operator,
        conductor,
        cancellationPolicy,
      } = event.detail;
      await updateTripDocumentForTripCreation(
        tripId,
        tripDate,
        startLocation,
        endLocation,
        route,
        schedule,
        vehicle,
        driver,
        conductor,
        operator,
        cancellationPolicy
      );
    } else if (internalEventType === "EVN_BOOKING_CREATED") {
      console.log(
        `2, trip support service event triggered, ${internalEventType} `
      );
      const { bookingId, tripId, seatNumber } = event.detail;
      await fetchTripDetailsAndTrigger(bookingId, tripId, seatNumber);
    } else if (internalEventType === "EVN_BOOKING_EXPIRED") {
      console.log(
        `3, trip support service event triggered, ${internalEventType} `
      );
      const { tripId, seatNumber } = event.detail;
      await updateExpiredBooking(tripId, seatNumber);
    } else if (internalEventType === "EVN_BOOKING_PAYMENT_SUCCESS") {
      console.log(
        `4, trip support service event triggered, ${internalEventType} `
      );
      const { tripId, seatNumber } = event.detail;
      await updateBookingPaymentSucess(tripId, seatNumber);
    } else if (internalEventType === "EVN_MIDNIGHT_BOOKING_CLOSE_SCHEDULER") {
      console.log(
        `5, trip support service event triggered, ${internalEventType} `
      );
      await scheduleBookingClosingEvent();
    } else if (internalEventType === "EVN_CLOSE_BOOKING") {
      console.log(
        `6, trip support service event triggered, ${internalEventType} `
      );
      const { tripId } = event.detail;
      await closeBooking(tripId);
    } else if (internalEventType === "EVN_BOOKING_CANCELLED") {
      console.log(
        `7, trip support service event triggered, ${internalEventType} `
      );
      const { tripId, seatNumber } = event.detail;
      await cancellBooking(tripId, seatNumber);
    }
    console.log("trip support service event processed successfully.");
  } catch (error) {
    console.log(`trip support service error occured: ${error}`);
  }
};

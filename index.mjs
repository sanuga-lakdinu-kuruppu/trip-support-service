import createConnection from "./config/databaseConnection.mjs";
import { updateTripDocumentForTripCreation } from "./service/service.mjs";

createConnection();

export const handler = async (event) => {
  console.log(`trip support service event triggered`);
  try {
    const { internalEventType } = event.detail;

    if (internalEventType === "EVN_TRIP_DETAIL_FETCHED") {
      console.log(
        `trip support service event triggered, ${internalEventType} `
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
    }

    console.log("trip support service event processed successfully.");
  } catch (error) {
    console.log(`trip support service error occured: ${error}`);
  }
};

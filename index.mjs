import createConnection from "./config/databaseConnection.mjs";
import { updateTripDocumentForTripCreation } from "./service/service.mjs";

createConnection();

export const handler = async (event) => {
  console.log(`trip support service event triggered`);
  try {
    const { internalEventType } = JSON.parse(event.detail);

    if (internalEventType === "EVN_TRIP_DETAIL_FETCHED") {
      console.log(
        `trip support service event triggered, ${internalEventType} `
      );
      const {
        tripId,
        startLocation,
        endLocation,
        route,
        schedule,
        vehicle,
        driver,
        operator,
        conductor,
        cancellationPolicy,
      } = JSON.parse(event.detail);
      await updateTripDocumentForTripCreation(
        tripId,
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

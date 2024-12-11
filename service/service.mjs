import { Trip } from "../model/tripModel.mjs";
import AWS from "aws-sdk";

const eventBridge = new AWS.EventBridge({
  region: process.env.FINAL_AWS_REGION,
});

export const updateTripDocumentForTripCreation = async (
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
) => {
  try {
    const startLocationData = {
      stationId: startLocation.stationId,
      name: startLocation.name,
      coordinates: startLocation.coordinates,
    };
    const endLocationData = {
      stationId: endLocation.stationId,
      name: endLocation.name,
      coordinates: endLocation.coordinates,
    };
    const routeData = {
      routeId: route.routeId,
      routeNumber: route.routeNumber,
      routeName: route.routeName,
      travelDistance: route.travelDistance,
      travelDuration: route.travelDuration,
    };
    const scheduleData = {
      scheduleId: schedule.scheduleId,
      departureTime: schedule.departureTime,
      arrivalTime: schedule.arrivalTime,
    };
    const vehicleData = {
      vehicleId: vehicle.vehicleId,
      registrationNumber: vehicle.registrationNumber,
      model: vehicle.model,
      capacity: vehicle.capacity,
      type: vehicle.type,
      airCondition: vehicle.airCondition,
      adjustableSeats: vehicle.adjustableSeats,
      chargingCapability: vehicle.chargingCapability,
      restStops: vehicle.restStops,
      movie: vehicle.movie,
      music: vehicle.music,
      cupHolder: vehicle.cupHolder,
      emergencyExit: vehicle.emergencyExit,
      pricePerSeat: vehicle.pricePerSeat,
    };
    const driverData = {
      workerId: driver.workerId,
      name: driver.name,
      contact: driver.contact,
    };
    const conductorData = {
      workerId: conductor.workerId,
      name: conductor.name,
      contact: conductor.contact,
    };
    const operatorData = {
      operatorId: operator.operatorId,
      name: operator.name,
      contact: operator.contact,
      company: operator.company,
    };
    const cancellationPolicyData = {
      policyId: cancellationPolicy.policyId,
      policyName: cancellationPolicy.policyName,
      type: cancellationPolicy.type,
      description: cancellationPolicy.description,
    };

    const tripDateInDate = new Date(tripDate);
    const [hours, minutes] = schedule.departureTime.split(":").map(Number);
    tripDateInDate.setHours(hours, minutes, 0, 0);
    const bookingCloseMinutes = vehicle.bookingClose || 30;
    const bookingCloseAt = new Date(
      tripDateInDate.getTime() - bookingCloseMinutes * 60000
    );

    const newData = {
      tripId: tripId,
      tripStatus: "SCHEDULED",
      bookingStatus: "ENABLED",
      bookingCloseAt: bookingCloseAt,
      startLocation: startLocationData,
      endLocation: endLocationData,
      route: routeData,
      schedule: scheduleData,
      vehicle: vehicleData,
      driver: driverData,
      conductor: conductorData,
      operator: operatorData,
      cancellationPolicy: cancellationPolicyData,
    };

    const updatedTrip = await Trip.findOneAndUpdate(
      { tripId: tripId },
      newData,
      { new: true, runValidators: true }
    );

    const eventParams = {
      Entries: [
        {
          Source: "trip-support-service",
          DetailType: "BOOKING_SUPPORT_SERVICE",
          Detail: JSON.stringify({
            internalEventType: "EVN_TRIP_CREATED_FOR_VEHICLE_CAPACITY",
            tripId: tripId,
            capacity: updatedTrip.vehicle.capacity,
          }),
          EventBusName: "busriya.com_event_bus",
        },
      ],
    };

    await eventBridge.putEvents(eventParams).promise();
  } catch (error) {
    console.log(`trip support service error occured: ${error}`);
  }
};

export const fetchTripDetailsAndTrigger = async (
  bookingId,
  tripId,
  seatNumber
) => {
  try {
    const foundTrip = await Trip.findOne({ tripId: tripId });
    if (!foundTrip) return null;

    foundTrip.bookingInProgressSeats.count += 1;
    foundTrip.bookingInProgressSeats.seats = [
      ...foundTrip.bookingInProgressSeats.seats,
      seatNumber,
    ];
    await foundTrip.save();
    console.log(`trip updated successfully`);

    const eventParams = {
      Entries: [
        {
          Source: "trip-support-service",
          DetailType: "BOOKING_SUPPORT_SERVICE",
          Detail: JSON.stringify({
            internalEventType: "EVN_TRIP_DETAIL_FETCHED_FOR_BOOKING",
            bookingId: bookingId,
            trip: foundTrip,
          }),
          EventBusName: "busriya.com_event_bus",
        },
      ],
    };

    await eventBridge.putEvents(eventParams).promise();
  } catch (error) {
    console.log(`trip support service error occured: ${error}`);
  }
};

import { Trip } from "../model/tripModel.mjs";

export const updateTripDocumentForTripCreation = async (
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

    const departureTime = new Date(schedule.departureTime);
    const bookingCloseMinutes = vehicle.bookingClose || 30;
    const bookingCloseAt = new Date(
      departureTime.getTime() - bookingCloseMinutes * 60000
    );
    const newData = {
      tripId: tripId,
      tripStatus: "SCHEDULED",
      bookingStatus: "ENABLED",
      bookingCloseAt: bookingCloseAt,
      confirmedSeats: {
        count: 0,
        seats: [],
      },
      bookingInProgressSeats: {
        count: 0,
        seats: [],
      },
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
  } catch (error) {
    console.log(`trip support service error occured: ${error}`);
  }
};

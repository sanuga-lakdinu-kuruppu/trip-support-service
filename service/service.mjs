import { Trip } from "../model/tripModel.mjs";
import AWS from "aws-sdk";
import {
  SchedulerClient,
  CreateScheduleCommand,
  DeleteScheduleCommand,
} from "@aws-sdk/client-scheduler";

const eventBridge = new AWS.EventBridge({
  region: process.env.FINAL_AWS_REGION,
});
const schedulerClient = new SchedulerClient({
  region: process.env.FINAL_AWS_REGION,
});

const s3 = new AWS.S3();

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
            internalEventType: "EVN_TRIP_CREATED_FOR_TRIP_DUPLICATION",
            tripId: tripId,
            bookingStatus: updatedTrip.bookingStatus,
            capacity: updatedTrip.vehicle.capacity,
            tripDate: updatedTrip.tripDate,
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

    foundTrip.bookingInProgressSeats.seats = [
      ...foundTrip.bookingInProgressSeats.seats,
      Number(seatNumber),
    ];
    foundTrip.bookingInProgressSeats.count =
      foundTrip.bookingInProgressSeats.seats.length;
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

export const updateExpiredBooking = async (tripId, seatNumber) => {
  try {
    const foundTrip = await Trip.findOne({ tripId: tripId });
    if (!foundTrip) return null;

    foundTrip.bookingInProgressSeats.seats =
      foundTrip.bookingInProgressSeats.seats.filter(
        (seat) => seat !== Number(seatNumber)
      );
    foundTrip.bookingInProgressSeats.count =
      foundTrip.bookingInProgressSeats.seats.length;
    await foundTrip.save();
  } catch (error) {
    console.log(`trip support service error occured: ${error}`);
  }
};

export const updateBookingPaymentSucess = async (tripId, seatNumber) => {
  try {
    const foundTrip = await Trip.findOne({ tripId: tripId });
    if (!foundTrip) return null;

    foundTrip.bookingInProgressSeats.seats =
      foundTrip.bookingInProgressSeats.seats.filter(
        (seat) => seat !== Number(seatNumber)
      );
    foundTrip.bookingInProgressSeats.count =
      foundTrip.bookingInProgressSeats.seats.length;

    if (!foundTrip.confirmedSeats.seats.includes(Number(seatNumber))) {
      foundTrip.confirmedSeats.seats = [
        ...foundTrip.confirmedSeats.seats,
        Number(seatNumber),
      ];
      foundTrip.confirmedSeats.count = foundTrip.confirmedSeats.seats.length;
    } else {
      console.log(
        `Seat number ${seatNumberAsNumber} is already confirmed for trip ID: ${tripId}`
      );
    }
    await foundTrip.save();
  } catch (error) {
    console.log(`trip support service error occured: ${error}`);
  }
};

export const scheduleBookingClosingEvent = async () => {
  try {
    const futureDays = process.env.BOOKING_CHECKING_DAYS;
    const now = new Date();
    const daysLater = new Date(
      now.getTime() + Number(futureDays) * 24 * 60 * 60 * 1000
    );

    const trips = await Trip.find({
      bookingCloseAt: {
        $gte: now,
        $lte: daysLater,
      },
      bookingCloseScheduleStatus: "NOT_SCHEDULED",
    });

    for (const trip of trips) {
      try {
        await createSchedule(trip);
        const newData = {
          bookingCloseScheduleStatus: "SCHEDULED",
        };
        await Trip.findOneAndUpdate({ tripId: trip.tripId }, newData, {
          new: true,
          runValidators: true,
        });
      } catch (error) {
        console.log(`trip support service, ${trip.tripId}, ${error}`);
      }
    }
  } catch (error) {
    console.log(`trip support service error occured: ${error}`);
  }
};

export const closeBooking = async (tripId) => {
  try {
    const params = { Name: `trip-booking-closing-${tripId}` };
    const command = new DeleteScheduleCommand(params);
    await schedulerClient.send(command);

    const foundTrip = await Trip.findOne({ tripId: tripId });
    if (!foundTrip) return null;

    if (foundTrip.bookingStatus !== "DISABLED") {
      const newData = {
        bookingStatus: "DISABLED",
      };
      const updatedTrip = await Trip.findOneAndUpdate(
        { tripId: tripId },
        newData,
        {
          new: true,
          runValidators: true,
        }
      );

      await triggerBookingStatusChangedEvent(
        updatedTrip.tripId,
        updatedTrip.bookingStatus
      );
    }
  } catch (error) {
    console.log(`trip support service error occured: ${error}`);
  }
};

export const cancellBooking = async (tripId, seatNumber) => {
  try {
    const foundTrip = await Trip.findOne({ tripId: tripId });
    if (!foundTrip) return null;

    foundTrip.confirmedSeats.seats = foundTrip.confirmedSeats.seats.filter(
      (seat) => seat !== Number(seatNumber)
    );
    foundTrip.confirmedSeats.count = foundTrip.confirmedSeats.seats.length;
    await foundTrip.save();
  } catch (error) {
    console.log(`trip support service error occured: ${error}`);
  }
};

export const backupTrips = async () => {
  try {
    console.log("Midnight backup event triggered");
    const trips = await getTripsOlderThanSevenDays();
    if (trips.length === 0) {
      console.log("No trips found for backup.");
      return;
    }
    await backupTripsToS3(trips);
    await updateBackupStatus(trips);
    console.log("Trip backup process completed successfully.");
  } catch (error) {
    console.log(`trip support service error occured: ${error}`);
  }
};

const getTripsOlderThanSevenDays = async () => {
  const pastDays = new Date();
  pastDays.setDate(
    pastDays.getDate() - Number(process.env.BACKUP_CHEKCING_DAYS)
  );

  try {
    const trips = await Trip.find({
      tripDate: { $lt: pastDays },
      backedUpStatus: "NOT_BACKED_UP",
    });
    return trips;
  } catch (error) {
    console.log(`Error fetching trips: ${error}`);
    throw new Error("Failed to fetch trips.");
  }
};

const backupTripsToS3 = async (trips) => {
  try {
    const tripsBackup = JSON.stringify(trips);

    const params = {
      Bucket: process.env.TRIP_BUCKET_NAME,
      Key: `backups/trips_${new Date()
        .toISOString()
        .replace(/[-:.]/g, "")}.json`,
      Body: tripsBackup,
      ContentType: "application/json",
    };

    await s3.putObject(params).promise();
    console.log("Trips backup uploaded successfully.");
  } catch (error) {
    console.log(`Error backing up trips to S3: ${error}`);
    throw new Error("Failed to upload backup to S3.");
  }
};

const updateBackupStatus = async (trips) => {
  try {
    for (const trip of trips) {
      trip.backedUpStatus = "BACKED_UP";
      await trip.save();
    }
    console.log("Backup status updated successfully.");
  } catch (error) {
    console.log(`Error updating backup status: ${error}`);
    throw new Error("Failed to update backup status.");
  }
};

const createSchedule = async (trip) => {
  const futureTime = new Date(trip.bookingCloseAt);
  const formattedTime = futureTime
    .toISOString()
    .replace(".000", "")
    .slice(0, 19);

  const inputPayload = {
    detail: {
      internalEventType: "EVN_CLOSE_BOOKING",
      tripId: trip.tripId,
    },
  };

  const scheduleName = `trip-booking-closing-${trip.tripId}`;

  const params = {
    Name: scheduleName,
    ScheduleExpression: `at(${formattedTime})`,
    FlexibleTimeWindow: {
      Mode: "OFF",
    },
    Target: {
      Arn: process.env.TRIP_SUPPORT_SERVICE_ARN,
      RoleArn: process.env.SCHEDULER_ROLE_ARN,
      Input: JSON.stringify(inputPayload),
    },
    Description: `Trigger for trip booking closing - ${trip.tripId}`,
  };

  const command = new CreateScheduleCommand(params);
  const response = await schedulerClient.send(command);
};

const triggerBookingStatusChangedEvent = async (tripId, bookingStatus) => {
  const eventParams = {
    Entries: [
      {
        Source: "trip-support-service",
        DetailType: "BOOKING_SUPPORT_SERVICE",
        Detail: JSON.stringify({
          internalEventType: "EVN_TRIP_BOOKING_STATUS_UPDATED",
          tripId: tripId,
          bookingStatus: bookingStatus,
        }),
        EventBusName: "busriya.com_event_bus",
      },
    ],
  };
  await eventBridge.putEvents(eventParams).promise();
};

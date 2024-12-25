import mongoose from "mongoose";

const tripSchema = new mongoose.Schema(
  {
    tripId: {
      type: Number,
      required: true,
      unique: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    tripNumber: {
      type: String,
      required: true,
      unique: true,
      maxlength: 50,
      trim: true,
    },
    tripDate: {
      type: Date,
      default: Date.now,
    },
    backedUpStatus: {
      type: String,
      required: true,
      maxlength: 20,
      trim: true,
    },
    bookingCloseScheduleStatus: {
      type: String,
      required: true,
      default: "NOT_SCHEDULED",
      maxlength: 20,
      trim: true,
    },
    tripStatus: {
      type: String,
      required: true,
      maxlength: 20,
      trim: true,
    },
    bookingStatus: {
      type: String,
      required: true,
      maxlength: 20,
      trim: true,
    },
    bookingCloseAt: {
      type: Date,
      default: Date.now,
    },
    confirmedSeats: {
      count: {
        type: Number,
        default: 0,
      },
      seats: {
        type: [Number],
        default: [],
      },
    },
    bookingInProgressSeats: {
      count: {
        type: Number,
        default: 0,
      },
      seats: {
        type: [Number],
        default: [],
      },
    },
    startLocation: {
      stationId: {
        type: Number,
      },
      name: {
        type: String,
        trim: true,
        minlength: 1,
        maxlength: 50,
      },
      coordinates: {
        lat: {
          type: Number,
          min: -90,
          max: 90,
        },
        log: {
          type: Number,
          min: -180,
          max: 180,
        },
      },
    },
    endLocation: {
      stationId: {
        type: Number,
      },
      name: {
        type: String,
        trim: true,
        minlength: 1,
        maxlength: 50,
      },
      coordinates: {
        lat: {
          type: Number,
          min: -90,
          max: 90,
        },
        log: {
          type: Number,
          min: -180,
          max: 180,
        },
      },
    },
    route: {
      routeId: {
        type: Number,
      },
      routeNumber: {
        type: String,
        maxLength: 50,
      },
      routeName: {
        type: String,
        trim: true,
        minlength: 1,
        maxlength: 50,
      },
      travelDistance: {
        type: String,
        maxlength: 10,
      },
      travelDuration: {
        type: String,
        maxlength: 10,
      },
    },
    schedule: {
      scheduleId: {
        type: Number,
      },
      departureTime: {
        type: String,
        trim: true,
      },
      arrivalTime: {
        type: String,
        trim: true,
      },
    },
    vehicle: {
      vehicleId: {
        type: Number,
      },
      registrationNumber: {
        type: String,
        trim: true,
        maxLength: 50,
      },
      model: {
        type: String,
        trim: true,
        maxlength: 50,
      },
      capacity: {
        type: Number,
        max: 200,
        min: 1,
      },
      type: {
        type: String,
        maxlength: 20,
        trim: true,
      },
      airCondition: {
        type: Boolean,
        default: false,
      },
      adjustableSeats: {
        type: Boolean,
        default: false,
      },
      chargingCapability: {
        type: Boolean,
        default: false,
      },
      restStops: {
        type: Boolean,
        default: false,
      },
      movie: {
        type: Boolean,
        default: false,
      },
      music: {
        type: Boolean,
        default: false,
      },
      cupHolder: {
        type: Boolean,
        default: false,
      },
      emergencyExit: {
        type: Boolean,
        default: false,
      },
      pricePerSeat: {
        type: Number,
        max: 20000,
      },
    },
    driver: {
      workerId: {
        type: Number,
      },
      name: {
        firstName: {
          type: String,
          minlength: 1,
          maxlength: 20,
          trim: true,
        },
        lastName: {
          type: String,
          minlength: 1,
          maxlength: 20,
          trim: true,
        },
      },
      contact: {
        mobile: {
          type: String,
          minlength: 9,
          maxlength: 12,
          trim: true,
        },
      },
    },
    conductor: {
      workerId: {
        type: Number,
      },
      name: {
        firstName: {
          type: String,
          minlength: 1,
          maxlength: 20,
          trim: true,
        },
        lastName: {
          type: String,
          minlength: 1,
          maxlength: 20,
          trim: true,
        },
      },
      contact: {
        mobile: {
          type: String,
          minlength: 9,
          maxlength: 12,
          trim: true,
        },
      },
    },
    operator: {
      operatorId: {
        type: Number,
      },
      name: {
        firstName: {
          type: String,
          minlength: 1,
          maxlength: 20,
          trim: true,
        },
        lastName: {
          type: String,
          minlength: 1,
          maxlength: 20,
          trim: true,
        },
      },
      company: {
        type: String,
        trim: true,
        minlength: 1,
        maxlength: 50,
      },
      contact: {
        mobile: {
          type: String,
          minlength: 9,
          maxlength: 12,
          trim: true,
        },
      },
    },
    cancellationPolicy: {
      policyId: {
        type: Number,
      },
      policyName: {
        type: String,
        trim: true,
        minlength: 1,
        maxlength: 50,
      },
      type: {
        type: String,
        trim: true,
        minlength: 1,
        maxlength: 20,
      },
      description: {
        type: String,
        maxlength: 1000,
      },
    },
  },
  {
    timestamps: true,
  }
);

export const Trip = mongoose.model("Trip", tripSchema);

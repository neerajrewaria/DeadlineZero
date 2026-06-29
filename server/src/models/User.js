const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    // ---------- Authentication ----------
    firstName: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
      lastName: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: function () {
        // Password only required for local auth users
        return this.authProvider === 'local';
      },
      minlength: 6,
      select: false, // never return password by default in queries
    },
// googleId: {
//     type:String
// },
avatar: {
    type: String,
    default:
      "https://api.dicebear.com/7.x/initials/svg?seed=User"
},
refreshToken:{
    type:String,
    default:null
},
isActive:{
    type:Boolean,
    default:true
},
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },

    // ---------- Profile ----------
    timezone: {
      type: String,
      default: 'UTC',
    },
    productivityScore: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    longestStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    currentStreak: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ---------- Preferences ----------
    workStartHour: {
      type: Number,
      min: 0,
      max: 23,
      default: 9,
    },
    workEndHour: {
      type: Number,
      min: 0,
      max: 23,
      default: 18,
    },
    timezone:{
    type:String,
    default:'Asia/Kolkata'
},
role:{
    type:String,
    enum:['user','admin'],
    default:'user'
},
    preferredSessionLength: {
      type: Number, // in minutes
      default: 25,
    },
    preferredWorkTime: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'night'],
      default: 'morning',
    },

    // ---------- Status ----------
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: null,
    },

googleCalendarConnected: {
    type: Boolean,
    default: false,
},

googleAccessToken: {
    type: String,
    default: "",
},

googleRefreshToken: {
    type: String,
    default: "",
},

googleTokenExpiry: {
    type: Date,
},

dailyPlan: {
    type: Schema.Types.Mixed,
    default: null,
},

planGeneratedDate: {
    type: String,
    default: null,
},

planSyncedToCalendar: {
    type: Boolean,
    default: false,
},

lastPlanGenerated: {
    type: Date,
    default: null,
},

planOutdated: {
    type: Boolean,
    default: false,
},
  },
  {
    timestamps: true, // adds createdAt, updatedAt
  }
);



module.exports = mongoose.model('User', userSchema);

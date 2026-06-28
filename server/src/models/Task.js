const mongoose = require('mongoose');
const { Schema } = mongoose;

// ---------- Subdocument: Session ----------
const sessionSchema = new Schema(
  {
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
    },
    durationMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false } // sessions don't need their own independent ID for now
);

const taskSchema = new Schema(
  {
    // ---------- Basic Information ----------
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      trim: true,
      default: 'general',
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // ---------- Deadline ----------
    deadline: {
      type: Date,
      required: [true, 'Deadline is required'],
    },
    estimatedHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    importance:{
    type:String,
    enum:['low','medium','high'],
    default:'medium'
},
difficulty:{
    type:String,
    enum:['easy','medium','hard'],
    default:'medium'
},
source:{
    type:String,
    enum:[
        'manual',
        'voice',
        'ai-chat'
    ],
    default:'manual'
},
isReminderSent:{
    type:Boolean,
    default:false
},
isArchived:{
    type:Boolean,
    default:false
},
isRecurring:{
    type:Boolean,
    default:false
},
recurrencePattern:{
    type:String,
    enum:[
        'daily',
        'weekly',
        'monthly',
        null
    ],
    default:null
},
motivationLevel:{
    type:Number,
    min:1,
    max:10,
    default:5
},
    actualHoursSpent: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ---------- Priority ----------
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    aiPriorityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },

    // ---------- Status ----------
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'missed'],
      default: 'pending',
    },

    // ---------- Scheduling ----------
    scheduledStart: {
      type: Date,
      default: null,
    },
    scheduledEnd: {
      type: Date,
      default: null,
    },

    // ---------- Progress ----------
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // ---------- Crisis Mode ----------
    isCrisisMode: {
      type: Boolean,
      default: false,
    },
    crisisActivatedAt: {
      type: Date,
      default: null,
    },

    // ---------- Google Calendar ----------
    calendarEventId: {
      type: String,
      default: null,
    },

    // ---------- AI Metadata ----------
    aiSummary: {
      type: String,
      default: '',
    },
    aiReasoning: {
      type: String,
      default: '',
    },
    aiSuggestions: {
      type: [String],
      default: [],
    },

    // ---------- Tags ----------
    tags: {
      type: [String],
      default: [],
    },

    // ---------- Session Tracking ----------
    sessions: {
      type: [sessionSchema],
      default: [],
    },

    // ---------- Behavior Analytics ----------
    actualStartTime: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt, updatedAt
  }
);


taskSchema.index({
    user:1,
    status:1
});

taskSchema.index({
    user:1,
    deadline:1
});
module.exports = mongoose.model('Task', taskSchema);
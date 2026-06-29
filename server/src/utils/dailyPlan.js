const User = require("../models/User");

const getDateKey = (date = new Date(), timeZone = "Asia/Kolkata") => {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
};

const getTodayPlanPayload = (user) => {
  if (!user || !user.dailyPlan) return null;

  const todayKey = getDateKey(new Date(), user.timezone || "Asia/Kolkata");

  if (user.planGeneratedDate !== todayKey) {
    return null;
  }

  return {
    dailyPlan: user.dailyPlan,
    planGeneratedDate: user.planGeneratedDate,
    planSyncedToCalendar: Boolean(user.planSyncedToCalendar),
    lastPlanGenerated: user.lastPlanGenerated,
    planOutdated: Boolean(user.planOutdated),
  };
};

const saveTodayPlan = async (user, dailyPlan) => {
  const todayKey = getDateKey(new Date(), user.timezone || "Asia/Kolkata");

  user.dailyPlan = dailyPlan;
  user.planGeneratedDate = todayKey;
  user.planSyncedToCalendar = false;
  user.lastPlanGenerated = new Date();
  user.planOutdated = false;

  await user.save();

  return getTodayPlanPayload(user);
};

const markUserPlanOutdated = async (userId) => {
  await User.findOneAndUpdate(
    {
      _id: userId,
      dailyPlan: { $ne: null },
    },
    {
      planOutdated: true,
      planSyncedToCalendar: false,
    }
  );
};

const markUserPlanSynced = async (userId) => {
  await User.findByIdAndUpdate(userId, {
    planSyncedToCalendar: true,
    planOutdated: false,
  });
};

module.exports = {
  getDateKey,
  getTodayPlanPayload,
  markUserPlanOutdated,
  markUserPlanSynced,
  saveTodayPlan,
};

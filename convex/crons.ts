import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Runs every hour — checks if any user's generateHour matches the current UTC hour
// and generates a pending post for them.
crons.hourly(
    "generate-pending-posts",
    { minuteUTC: 0 },
    internal.posting.generatePendingPosts,
);

// Runs every hour — checks if any user's postHour matches the current UTC hour
// and publishes their oldest pending post to Bluesky.
crons.hourly(
    "publish-pending-posts",
    { minuteUTC: 5 }, // slight offset so generation always runs first
    internal.posting.publishPendingPosts,
);

export default crons;

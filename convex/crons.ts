import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
    "check-and-post-updates",
    { minutes: 30 }, // Check every 30 minutes
    internal.posting.processAllScheduledPosts,
);

export default crons;

import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { Webhook } from "svix";
import { internal } from "./_generated/api";

interface ClerkWebhookEvent {
    type: "user.created" | "user.updated" | "user.deleted" | string;
    data: {
        id: string;
        [key: string]: unknown;
    };
}

const http = httpRouter();

http.route({
    path: "/clerk-webhook",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        const payloadString = await request.text();
        const headerPayload = request.headers;

        try {
            const svixHeaders = {
                "svix-id": headerPayload.get("svix-id")!,
                "svix-timestamp": headerPayload.get("svix-timestamp")!,
                "svix-signature": headerPayload.get("svix-signature")!,
            };

            const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || "");
            const evt = wh.verify(payloadString, svixHeaders) as ClerkWebhookEvent;

            if (evt.type === "user.created") {
                await ctx.runMutation(internal.users.syncUserInternal, {
                    clerkId: evt.data.id,
                });
            }

            return new Response("Webhook processed successfully", { status: 200 });
        } catch (err) {
            console.error("Webhook verification failed:", err);
            return new Response("Webhook verification failed", { status: 400 });
        }
    }),
});

export default http;

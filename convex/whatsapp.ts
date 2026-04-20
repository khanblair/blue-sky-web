import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

/**
 * Sends a notification message via Maytapi WhatsApp API.
 */
export const sendMessage = internalAction({
    args: { 
        text: v.string(),
        userId: v.optional(v.id("users"))
    },
    handler: async (ctx, args) => {
        let userPrefs = null;
        if (args.userId) {
            userPrefs = await ctx.runQuery(internal.users.getPreferencesByUserId, { userId: args.userId });
        }

        const productId = userPrefs?.maytapiProductId || process.env.MAYTAPI_PRODUCT_ID;
        const phoneId = userPrefs?.maytapiPhoneId || process.env.MAYTAPI_PHONE_ID;
        const token = userPrefs?.maytapiApiToken || process.env.MAYTAPI_API_TOKEN;
        const targetNumber = userPrefs?.whatsappTargetNumber || process.env.MAYTAPI_TARGET_NUMBER;

        if (!productId || !phoneId || !token || !targetNumber) {
            console.error("Maytapi configuration missing: Check MAYTAPI_PRODUCT_ID, MAYTAPI_PHONE_ID, MAYTAPI_API_TOKEN, and MAYTAPI_TARGET_NUMBER in Convex.");
            return;
        }

        try {
            const url = `https://api.maytapi.com/api/${productId}/${phoneId}/sendMessage`;
            const response = await fetch(url, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "x-maytapi-key": token
                },
                body: JSON.stringify({
                    to_number: targetNumber,
                    type: "text",
                    message: args.text
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Failed to send WhatsApp message:", errorText);
            } else {
                console.log("WhatsApp message sent successfully!");
            }
        } catch (error) {
            console.error("Error sending WhatsApp message:", error);
        }
    },
});

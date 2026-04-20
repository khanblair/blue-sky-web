import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

/**
 * Sends a notification message to the configured Telegram chat.
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

        const token = userPrefs?.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN;
        const chatId = userPrefs?.telegramChatId || process.env.TELEGRAM_CHAT_ID;

        if (!token || !chatId) {
            console.error("TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set");
            return;
        }

        try {
            const url = `https://api.telegram.org/bot${token}/sendMessage`;
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: args.text,
                    parse_mode: "Markdown",
                    disable_web_page_preview: false,
                }),
            });

            if (!response.ok) {
                const error = await response.text();
                console.error("Failed to send Telegram message:", error);
            }
        } catch (error) {
            console.error("Error sending Telegram message:", error);
        }
    },
});

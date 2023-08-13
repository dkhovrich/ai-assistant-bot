import { message } from "telegraf/filters";
import { AiBotAction } from "./AiBotAction.mjs";
import { BotAction } from "./types.mjs";
import { initialSession, TelegrafBot } from "../types.mjs";
import { code } from "telegraf/format";
import { AiService } from "../../services/ai.service.mjs";
import { LoggerFactory } from "../../logger/logger.factory.mjs";

export class TextBotAction extends AiBotAction implements BotAction {
    public constructor(aiService: AiService, loggerFactory: LoggerFactory) {
        super(aiService, loggerFactory, "text");
    }

    public configure(bot: TelegrafBot): void {
        bot.on(message("text"), async ctx => {
            try {
                ctx.session ??= initialSession;
                await ctx.reply(code(AiBotAction.acceptedResponse));
                const response = await this.chat(ctx.session, ctx.message.text);
                await ctx.reply(response.message);
            } catch (error) {
                if (error instanceof Error) {
                    this.logger.error("Error processing action", error);
                }
                await ctx.reply(code(AiBotAction.errorResponse));
            }
        });
    }
}

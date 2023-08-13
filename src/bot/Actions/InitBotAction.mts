import { BotAction } from "./types.mjs";
import { TelegrafBot } from "../types.mjs";

export class InitBotAction implements BotAction {
    private static replyText = "Жду вашего голосового или текстового сообщения 🎙";

    public configure(bot: TelegrafBot): void {
        bot.start(ctx => {
            ctx.session.messages = [];
            return ctx.reply(InitBotAction.replyText);
        });

        bot.command("new", ctx => {
            ctx.session.messages = [];
            return ctx.reply(InitBotAction.replyText);
        });
    }
}

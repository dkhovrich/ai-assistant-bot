import { Context, Telegraf } from "telegraf";
import { Message } from "../services/ai.service.mjs";

export interface Session {
    messages: Message[];
}

export interface BotContext extends Context {
    session: Session;
}

export type TelegrafBot = Telegraf<BotContext>;

export const initialSession: Session = { messages: [] };

import { Context, Middleware as TelegrafMiddleware } from "telegraf";
import LocalSession from "telegraf-session-local";
import { Middleware } from "./middleware.types.mjs";

export class SessionMiddleware implements Middleware {
    public create(): TelegrafMiddleware<Context> {
        return new LocalSession({ database: "session.json" }).middleware();
    }
}

import { ChatService, Message } from "../../services/chat.service.mjs";
import { Session } from "../types.mjs";
import { Logger } from "../../logger/types.mjs";
import { LoggerFactory } from "../../logger/logger.factory.mjs";

export abstract class AiBotAction {
    public static acceptedResponse = "Сообщение принял. Жду ответ от сервера...";

    public static errorResponse = "Что-то пошло не так...";

    protected readonly logger: Logger;

    protected constructor(
        private readonly chatService: ChatService,
        loggerFactory: LoggerFactory,
        command: "voice" | "text"
    ) {
        this.logger = loggerFactory.create(command);
    }

    protected async chat(session: Session, message: string): Promise<Message> {
        session.messages.push({ role: "user", message });
        const response = await this.chatService.chat(session.messages);
        session.messages.push(response);
        return response;
    }
}

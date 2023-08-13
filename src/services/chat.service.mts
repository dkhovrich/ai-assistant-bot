import { ChatCompletionRequestMessage } from "openai/api.js";
import { OpenAiService } from "./openAi.service.mjs";

export interface ChatService {
    chat(messages: Message[]): Promise<Message>;
}

export type Role = "system" | "user" | "assistant" | "function";

export interface Message {
    role: Role;
    message: string;
}

export class OpenAiChatService extends OpenAiService implements ChatService {
    public async chat(messages: Message[]): Promise<Message> {
        const response = await this.openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: messages.map(
                (message): ChatCompletionRequestMessage => ({ role: message.role, content: message.message })
            )
        });

        const message = response.data.choices[0]?.message;
        if (message == null || message.content == null) {
            throw new Error("No response from OpenAI");
        }

        return { role: message.role, message: message.content };
    }
}

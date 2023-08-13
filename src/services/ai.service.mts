import { Configuration, OpenAIApi } from "openai";
import { ConfigService } from "./config.service.mjs";
import { ChatCompletionRequestMessage } from "openai/api.js";

export interface AiService {
    chat(messages: Message[]): Promise<Message>;
}

export type Role = "system" | "user" | "assistant" | "function";

export interface Message {
    role: Role;
    message: string;
}

export class OpenAiService implements AiService {
    private readonly openai: OpenAIApi;

    public constructor(configService: ConfigService) {
        this.openai = new OpenAIApi(new Configuration({ apiKey: configService.get("openAiKey") }));
    }

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

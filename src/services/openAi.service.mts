import { Configuration, OpenAIApi } from "openai";
import { ConfigService } from "./config.service.mjs";

export abstract class OpenAiService {
    protected readonly openai: OpenAIApi;

    public constructor(configService: ConfigService) {
        this.openai = new OpenAIApi(new Configuration({ apiKey: configService.get("openAiKey") }));
    }
}

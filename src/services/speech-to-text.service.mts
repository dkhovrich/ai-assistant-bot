import { createReadStream } from "node:fs";
import { OpenAiService } from "./openAi.service.mjs";

export interface SpeechToTextService {
    transcribe(filepath: string): Promise<string>;
}

export class OpenAiSpeechToTextService extends OpenAiService implements SpeechToTextService {
    public async transcribe(filepath: string): Promise<string> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = await this.openai.createTranscription(createReadStream(filepath) as any, "whisper-1");
        return response.data.text;
    }
}

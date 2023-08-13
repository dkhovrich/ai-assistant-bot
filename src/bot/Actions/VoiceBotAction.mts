import axios from "axios";
import { createWriteStream } from "node:fs";
import { unlink } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { message } from "telegraf/filters";
import { code } from "telegraf/format";
import { BotAction } from "./types.mjs";
import { initialSession, TelegrafBot } from "../types.mjs";
import { fileURLToPath } from "node:url";
import { LoggerFactory } from "../../logger/logger.factory.mjs";
import { SpeechToTextService } from "../../services/speech-to-text.service.mjs";
import { AudioConverterService } from "../../services/audio-converter.service.mjs";
import { AiBotAction } from "./AiBotAction.mjs";
import { ChatService } from "../../services/chat.service.mjs";

export class VoiceBotAction extends AiBotAction implements BotAction {
    private static dirname = dirname(fileURLToPath(import.meta.url));
    private static voicesFolderPath = resolve(VoiceBotAction.dirname, "../../../voices");

    public constructor(
        private readonly audioConverterService: AudioConverterService,
        private readonly speechToTextService: SpeechToTextService,
        chatService: ChatService,
        loggerFactory: LoggerFactory
    ) {
        super(chatService, loggerFactory, "voice");
    }

    public configure(bot: TelegrafBot): void {
        bot.on(message("voice"), async ctx => {
            try {
                ctx.session ??= initialSession;
                await ctx.reply(code(AiBotAction.acceptedResponse));
                const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
                const userId = String(ctx.message.from.id);

                const [oggPath, mp3Path] = await this.getAudioFiles(link, userId);
                const text = await this.speechToTextService.transcribe(mp3Path);
                await Promise.all([oggPath, mp3Path].map(path => this.removeFile(path)));

                await ctx.reply(code(`Ваш запрос: ${text}`));
                const response = await this.chat(ctx.session, text);
                await ctx.reply(response.message);
            } catch (error) {
                if (error instanceof Error) {
                    this.logger.error("Error processing action", error);
                }
                await ctx.reply(code(AiBotAction.errorResponse));
            }
        });
    }

    private async getOgg(url: string, path: string): Promise<void> {
        const response = await axios({ method: "get", url, responseType: "stream" });
        return new Promise<void>((resolve, reject) => {
            const stream = createWriteStream(path);
            response.data.pipe(stream);
            stream.on("finish", () => resolve());
            stream.on("error", error => reject(error));
        });
    }

    private async getAudioFiles(link: URL, userId: string): Promise<readonly [string, string]> {
        const oggPath = resolve(VoiceBotAction.voicesFolderPath, `${userId}.ogg`);
        const mp3Path = resolve(VoiceBotAction.voicesFolderPath, `${userId}.mp3`);

        await this.getOgg(link.href, oggPath);
        await this.audioConverterService.oggToMp3(oggPath, mp3Path);

        return [oggPath, mp3Path];
    }

    private async removeFile(path: string): Promise<void> {
        try {
            await unlink(path);
        } catch (error) {
            this.logger.error("Error removing file", { path, error });
        }
    }
}

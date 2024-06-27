import OpusEncoder from "@discordjs/opus";
import { EndBehaviorType, joinVoiceChannel } from "@discordjs/voice";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { pipeline } from "@xenova/transformers";
import { REST, Routes } from "discord.js";
import Ffmpeg from "fluent-ffmpeg";
import { createWriteStream, readFileSync } from "fs";
import wavefile from "wavefile";
import { client } from "./lib/client";
import { env } from "./lib/env";
import { toSmallText } from "./toSmallText";

const commands = [
  {
    name: "translate",
    description: "Translate voice in english to portuguese",
  },
];

const rest = new REST({ version: "10" }).setToken(env.DISCORD_TOKEN);

client.on("ready", async () => {
  console.log("ready");

  rest.put(Routes.applicationCommands(env.DISCORD_APP_ID), {
    body: commands,
  });
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isCommand()) {
    if (interaction.commandName === "translate") {
      if (interaction.guildId && interaction.guild && interaction.member) {
        interaction.reply({
          content: "A tradução em tempo real foi iniciada.",
        });
        const member = interaction.guild.members.cache.get(
          interaction.member.user.id
        )?.voice.channelId;
        if (member) {
          const transcribe = await pipeline(
            "automatic-speech-recognition",
            "Xenova/whisper-base"
          );

          const genAI = new GoogleGenerativeAI(env.GEMINI_TOKEN);
          const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash-latest",
          });

          const connection = joinVoiceChannel({
            channelId: member,
            guildId: interaction.guildId,
            adapterCreator: interaction.guild.voiceAdapterCreator,
            selfDeaf: false,
            selfMute: false,
          });

          connection.receiver.speaking.on("start", (userId) => {
            const audioStream = connection.receiver.subscribe(userId, {
              end: { behavior: EndBehaviorType.AfterSilence, duration: 1000 },
            });
            const file = createWriteStream(`audio/audio_${userId}.pcm`);
            const encoder = new OpusEncoder.OpusEncoder(48000, 2);

            audioStream.on("data", (chunk) => {
              const decoder = encoder.decode(chunk);
              file.write(decoder);
            });

            audioStream.on("end", () => {
              file.end();

              try {
                const outputPath = `audio/audio_${userId}.wav`;
                const ffmpeg = Ffmpeg()
                  .input(`audio/audio_${userId}.pcm`)
                  .inputOptions(["-f s16le", "-ar 48000", "-ac 2"])
                  .audioCodec("pcm_s16le")
                  .save(outputPath) as any;

                ffmpeg.on("error", (err: Error) => {
                  console.error("Erro durante a conversão para wav:", err);
                });

                ffmpeg.on("end", async () => {
                  console.log("Conversão para MP3 concluída.");

                  let wav = new wavefile.WaveFile(readFileSync(outputPath));
                  wav.toBitDepth("32f"); // Pipeline expects input as a Float32Array
                  wav.toSampleRate(16000); // Whisper expects audio with a sampling rate of 16000
                  let audioData = wav.getSamples();
                  if (Array.isArray(audioData)) {
                    if (audioData.length > 1) {
                      const SCALING_FACTOR = Math.sqrt(2);

                      // Merge channels (into first channel to save memory)
                      for (let i = 0; i < audioData[0].length; ++i) {
                        audioData[0][i] =
                          (SCALING_FACTOR *
                            (audioData[0][i] + audioData[1][i])) /
                          2;
                      }
                    }

                    // Select first channel
                    audioData = audioData[0];
                  }

                  const member = await interaction?.guild?.members.fetch(
                    userId
                  );

                  let output: any = await transcribe(audioData);

                  const translate = await model.generateContent(
                    `
                    Se receber algo entre [], não responda nem faça nada, ignore.
                    se receber algo e n entender não fale nada nem responda.
                    apenas traduza oq foi passado.
                    Não faça nada alem de traduzir o texto: ${output.text}
                    `
                  );

                  await interaction.channel?.send(
                    `\`\`\`${member?.nickname ?? member?.user.displayName}:\n` +
                      toSmallText(`${translate.response.text()}\`\`\``)
                  );
                });
              } catch (err) {
                console.error("error:", err);
              }
            });

            audioStream.on("error", (error) => {
              console.error("Error writing audio stream:", error);
              file.end();
            });
          });
        }
      }
    }
  }
});

client.login(env.DISCORD_TOKEN);

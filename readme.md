# Bot de tradução em RealTime

Este projeto surgiu numa reunião da devHat, aonde temos uma daily em ingles toda sexta-feira e surgiu a necessidade de um bot que traduz em tempo real para ajudar as pessoas que não tem tanta facilidade com ingles, com isso fiquei curioso de como fazer isso e aceitei o desafio para mim e comecei a fazer.

- [x] - Entrar na sala
- [x] - Escutar os usuário
- [x] - Fazer a transcrição do audio.
- [x] - Fazer a tradução do audio
- [ ] - Fazer transcrição em real time
- [ ] - Fazer uma logica melhor para fazer a tradução

## Bugs Conhecidos

Aqui estão alguns bugs que estou ciente e trabalhando para resolver:

1. **Mais de um usuário Falando**: Quando mais de um usuario entra na sala e fala ele tenta fazer mais de um arquivo e as vezes buga

1. **Microfone Capitado**: Quando o microfone do usuario ativa sem pegar nenhuma voz mesmo assim ele faz a conversao e acaba meio que enganando a gemini

## Tecnologias Utilizadas.

- `@discordjs/opus`
- `@discordjs/voice`
- `@ffmpeg-installer/ffmpeg`
- `@google/generative-ai`
- `@transcribe/transcriber`
- `@xenova/transformers`
- `discord.js`
- `fluent-ffmpeg`
- `tsx`
- `tweetnacl`
- `typescript`
- `wavefile`
- `whisper-node`
- `zod`

## Requisitos

- `nodejs`
- `npm`

## Instalação

1. Clone o repositório:

```sh
git clone https://github.com/wendesongomes/TraduzAI.git
cd TraduzAI
```

2. Instale as dependências:

```sh
npm install
```

3. Crie uma aplicação no [site do Discord](https://discord.com/developers/applications), obtenha o token e o CLIENT ID.

4. Altere o .env.example para .env e coloque as informaçoes das variaveis:

```
DISCORD_TOKEN=seu_token_aqui
DISCORD_APP_ID=seu_client_id
```

5. Vá na gemini e pegue o token e adicione no .env.

## Uso

1. Inicie o bot:

```sh
npm run dev
```

2. Convide o bot para o seu servidor usando o link gerado na página de desenvolvimento do Discord.

3. Use o comando `/translate` para ele começar a tradução em tempo real.

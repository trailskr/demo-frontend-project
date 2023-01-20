# Ivan Agafonov Sample Frontend project with SSR

SSR is turned off and not tested for a long time

Application using https://dummyjson.com/ as mock api

## Usage

### Environment

To set environment use env variables or .env files.
You can edit main example .env file or create .env.local excluded from repository.
You can add mode (developent and production) to env file like .env.production or .env.development.local

### Development

To update api definishion and typings run

```bash
pnpm api
```

To run local development just run and visit http://localhost:3333

```bash
pnpm dev
```

### Build

To build the App, run

```bash
pnpm build
```
And you will see the generated file in `dist` that ready to be served.

TypeScript is not checked during build. To do this run

```bash
pnpm typecheck
```

To run linter

```bash
pnpm lint
```

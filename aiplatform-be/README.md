# aichat-be

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.2.19. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
## Database migrations & seeders

This repo includes a lightweight migration/seed runner (no sequelize-cli required).

Run migrations up:

```bash
npm run migrate:up
```

Run migrations down:

```bash
npm run migrate:down
```

Seed sample data:

```bash
npm run seed:up
```

Remove seeded data:

```bash
npm run seed:down
```

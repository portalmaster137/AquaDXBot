# aquadx-bot

To run the bot:

```bash
docker compose build
docker compose up -d
```

Please note, ./prisma and ./data are volumes, and if issues arise with docker, consider deleting the data folder and the "migrations" inside the prisma folder. (This will reset everything.)
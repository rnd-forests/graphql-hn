## GraphQL server for Hacker News application

### Configuration

```
yarn global add graphql-cli
```

Change directory to `database` where `docker-compose.yml` file is stored, and run command:
```
docker-compose up -d
```

Configure the environment:
```
cp .env.example .env
```
Add missing environment variables like `APP_SECRET` and `PRISMA_SECRET`

Inside the root directory, run the following commands:
```
yarn install
yarn dev
```

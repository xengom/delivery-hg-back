# Delivery Tracker Backend

This is the backend service for the Delivery Tracker application, built with Cloudflare Workers.

## Technologies

- [Cloudflare Workers](https://workers.cloudflare.com/) - Serverless execution environment
- [Hono](https://hono.dev/) - Fast, lightweight web framework
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM
- [Cloudflare D1](https://developers.cloudflare.com/d1/) - SQL database
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Jest](https://jestjs.io/) - Testing framework

## Project Structure

```
src/
├── app/     # Application layer (controllers, routes)
├── domain/  # Domain layer (business logic, entities)
└── infra/   # Infrastructure layer (database, external services)
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or later)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server:

```bash
npm run dev
```

### Database Operations

Generate database migrations:

```bash
npm run db:generate
```

Apply database migrations:

```bash
npm run db:migrate
```

### Testing

Run tests:

```bash
npm test
```

### Deployment

Deploy to Cloudflare Workers:

```bash
npm run deploy
```

## API Documentation

The API provides endpoints for managing deliveries, including:

- Creating new deliveries
- Updating delivery status
- Retrieving delivery information
- Managing delivery settlements

## License

This project is proprietary and confidential.
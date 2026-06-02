# Liquidity Lab Backend - Analytical Engine

This is the private, production-grade, full-stack analytical engine backend for **Liquidity Lab**, built using Node.js, Express.js, TypeScript, and MongoDB (via Mongoose).

## Key Features

- **TypeScript-powered**: Clean compile-time type verification.
- **Trading Experiment Schema**: Customized database model tracking technical SMC/ICT setup elements (FVG, Order Blocks, Liquidity Sweeps) alongside psychological components (pre-trade mood, execution discipline scores).
- **Edge vs. Psychology Analytics**: Aggregate statistics query to compare performance across technical setup types vs. psychological variables.
- **Robust Error Handling**: Distinct responses for operational failures in both production and development environments.
- **Security Best Practices**: Configured security headers (`helmet`) and Cross-Origin Resource Sharing (`cors`).

## Directory Structure

```text
backend/
├── src/
│   ├── config/       # Connection parameters & external configs (e.g. MongoDB setup)
│   ├── controllers/  # Route controller actions / logic
│   ├── middleware/   # Express middleware (global error handler, custom checks)
│   ├── models/       # Mongoose schemas & data models (Trade)
│   ├── routes/       # API endpoint route registration
│   ├── utils/        # Global utilities (asyncHandler, AppError class)
│   ├── app.ts        # Express app middleware setup
│   └── server.ts     # Main server entry-point
├── .env.example      # Environment variables template
├── tsconfig.json     # TypeScript configurations
└── package.json      # Dependencies and execution scripts
```

## Setup & Running

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create a `.env` file using the configuration schema in `.env.example`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/liquiditylab
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_here
```

### 3. Run Development Server
Executes the server in development mode using `ts-node-dev` with hot reload active:
```bash
npm run dev
```

### 4. Build & Production Run
Compile to Javascript and launch:
```bash
npm run build
npm start
```

## API Endpoints

- **Health Checks**: `GET /api/health`
- **Trades REST API**:
  - `POST /api/trades` - Create a trade experiment log
  - `GET /api/trades` - List all trade logs (supports sorting & paging)
  - `GET /api/trades/:id` - Fetch single trade log details
  - `PATCH /api/trades/:id` - Update trade log details
  - `DELETE /api/trades/:id` - Delete trade log entry
- **Analytics & Aggregate Stats**:
  - `GET /api/trades/stats` - Retrieve stats on setups vs moods, total profit/loss, average risk-reward, and win rate.

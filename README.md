# 💜 LumaPay — Wallet Top-Up System

<p align="center">
  <strong>FS-04 | Full Stack Engineer Assessment</strong>
  <br />
  A secure wallet top-up application with a simulated payment gateway.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
</p>

## ✨ About the Project

LumaPay allows users to add money to their wallets through a mock payment gateway.

Users can create a top-up, pay or fail the payment, and return to the wallet. The actual payment result arrives separately through a webhook.

The main goal is to ensure that **a wallet is credited only once**, even if a webhook arrives late or multiple times.

## 🚀 Features

- 🔐 JWT-based authentication
- 💰 Wallet top-ups from ₹100 to ₹50,000
- 💳 Mock payment gateway with Pay and Fail buttons
- ⏱️ Simulated 5-second webhook delay
- 🛡️ Duplicate webhook and duplicate credit protection
- 🔏 HMAC-SHA256 webhook signature verification
- ⚡ Real-time wallet updates using Socket.IO
- 📊 Wallet balance and transaction history
- 🔄 Payment status confirmation after redirect
- 🧪 Automated webhook tests
- 🗄️ MongoDB unique indexes
- 🎨 Responsive dashboard built with Next.js and Tailwind CSS

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Styling | Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB, Mongoose |
| Authentication | JWT |
| Real-time updates | Socket.IO |
| Webhook security | HMAC-SHA256 |
| Testing | Vitest, Supertest |

## 📁 Project Structure

```text
LumaPay/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── sockets/
│   │   └── server.ts
│   ├── tests/
│   ├── scripts/
│   ├── package.json
│   └── .env
├── src/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   └── types/
├── middleware.ts
├── .env.local
├── package.json
└── README.md
```

## ⚙️ Prerequisites

Before running the project, install:

- Node.js and npm
- MongoDB Atlas account or local MongoDB
- Git

## 🔧 Installation and Setup

### 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd <YOUR_PROJECT_FOLDER>
```

### 2. Configure the Backend

```bash
cd backend
npm install
```

Create a `backend/.env` file:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
MONGODB_DATABASE=jstack_wallet
JWT_SECRET=your_long_random_jwt_secret
GATEWAY_WEBHOOK_SECRET=your_webhook_secret
FRONTEND_URL=http://localhost:3000
```

### 3. Seed the Database

Run the seed script from the backend folder:

```bash
npm run seed
```

This creates the two assessment users and their wallets. The seed script should be safe to rerun.

### 4. Start the Backend

```bash
npm run dev
```

The backend runs at:

`http://localhost:5000`

### 5. Configure the Frontend

Open a second terminal at the project root:

```bash
npm install
```

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
API_URL=http://localhost:5000
JWT_SECRET=your_backend_jwt_secret
```

Use the same JWT secret as the backend for server-side token verification. Keep `JWT_SECRET` server-only; do not add the `NEXT_PUBLIC_` prefix.

### 6. Start the Frontend

From the project root:

```bash
npm run dev
```

Open:

**http://localhost:3000**

## 👤 Test Accounts

| User | Email | Password |
|---|---|---|
| User 1 | `user1@example.com` | `UserOne@123` |
| User 2 | `user2@example.com` | `UserTwo@123` |

These are development assessment accounts only. Do not use them in production.

## 💸 Amount Handling

All API amounts are represented as **integer paise**.

| Amount in INR | Amount in API |
|---:|---:|
| ₹100 | `10000` |
| ₹500 | `50000` |
| ₹1,000 | `100000` |
| ₹50,000 | `5000000` |

The backend accepts top-ups between ₹100 and ₹50,000 and rejects invalid amounts.

## 🔌 API Endpoints

Protected wallet endpoints require a JWT:

```http
Authorization: Bearer <JWT>
```

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/login` | Authenticate a user |
| `POST` | `/topups` | Create a top-up order |
| `GET` | `/topups` | Get top-up history |
| `GET` | `/topups/:id` | Check payment status |
| `GET` | `/wallet` | Get current wallet balance |
| `POST` | `/webhooks/gateway` | Receive the gateway webhook |

### Create a Top-Up

Request:

```http
POST /topups
Content-Type: application/json
Authorization: Bearer <JWT>
```

```json
{
  "amount": 100000
}
```

The backend creates a top-up with `PENDING` status and returns a `gatewayUrl`.

### Gateway Webhook

Example payload:

```json
{
  "eventId": "evt_example_001",
  "orderId": "YOUR_TOPUP_ORDER_ID",
  "status": "SUCCESS"
}
```

The status can be `SUCCESS` or `FAILED`. The webhook signature must be valid before the backend processes the event.

## 🔄 Payment Flow

1. The user logs in and enters a top-up amount.
2. The backend creates a `PENDING` order.
3. The frontend redirects the user to the mock gateway.
4. The user clicks **Pay** or **Fail**.
5. The user returns to the application immediately.
6. The webhook is sent after approximately five seconds.
7. The frontend displays **“Confirming payment…”** while checking the order status.
8. After the final result, the frontend refreshes the wallet balance and transaction history.

The wallet is credited by the backend, not by the frontend redirect.

## 🧪 Running Tests

Run the backend tests:

```bash
cd backend
npm test
```

Build the backend:

```bash
npm run build
```

Build the frontend from the project root:

```bash
npm run build
```

The webhook tests cover:

- Duplicate delivery of the same event
- Duplicate processing of the same order with different event IDs
- Invalid HMAC signature
- Failed payment without wallet credit
- Prevention of changes to final payment status

## 🔁 Testing Duplicate Webhooks

Create a top-up and copy its order ID. Send the same valid webhook twice using Postman or curl.

Example request body:

```json
{
  "eventId": "evt_duplicate_001",
  "orderId": "YOUR_TOPUP_ORDER_ID",
  "status": "SUCCESS"
}
```

Example using PowerShell:

```powershell
$body = '{"eventId":"evt_duplicate_001","orderId":"YOUR_TOPUP_ORDER_ID","status":"SUCCESS"}'

curl.exe -X POST "http://localhost:5000/webhooks/gateway" `
  -H "Content-Type: application/json" `
  -H "x-webhook-signature: YOUR_VALID_HMAC_SIGNATURE" `
  --data-raw $body

curl.exe -X POST "http://localhost:5000/webhooks/gateway" `
  -H "Content-Type: application/json" `
  -H "x-webhook-signature: YOUR_VALID_HMAC_SIGNATURE" `
  --data-raw $body
```

Replace the example order ID and signature. The signature must be calculated using `GATEWAY_WEBHOOK_SECRET` over the exact payload expected by the backend.

Use the actual signature header name configured in the webhook controller.

**Expected result:** The wallet balance increases only once, even though the webhook is sent twice.

## 🗄️ MongoDB Indexes

Unique indexes enforce important rules at the database level.

| Index | Reason |
|---|---|
| Unique user email | Prevents duplicate user accounts |
| Unique wallet `userId` | Allows one wallet per user |
| Unique webhook `eventId` | Prevents processing the same event twice |
| Unique credit-ledger `orderId` | Prevents the same order from being credited twice |

These indexes work together with the backend's idempotency and transaction logic.

## 💡 Assessment Questions

### 1. What happens if the user returns before the webhook arrives?

The frontend shows **“Confirming payment…”** and checks the backend until the payment status becomes `SUCCESS` or `FAILED`. It then refreshes the wallet balance.

This is safe because the browser redirect does not confirm payment. Only the verified backend webhook can finalize the payment and credit the wallet.

### 2. Why should we never credit the wallet based on the browser redirect alone?

A browser redirect can be faked or triggered without a successful payment. If the wallet were credited from the redirect, users could potentially receive money without paying.

The backend must verify the webhook signature, validate the order, and enforce duplicate protection before crediting the wallet.

## 📝 Assumptions

- The gateway is simulated and does not process real money.
- All API amounts use integer paise.
- Each user has one wallet.
- A valid `SUCCESS` webhook is required to credit a wallet.
- `SUCCESS` and `FAILED` are final states and cannot change to another final state.
- The mock gateway sends the webhook approximately five seconds after the user selects Pay or Fail.
- Duplicate events and duplicate order processing must not create duplicate wallet credits.

## 🚧 Incomplete Tasks and Future Improvements

**Required assessment tasks:** Implemented and tested based on the checks performed during development.

Possible improvements with additional time:

- Integrate a real payment provider.
- Add payment reconciliation and operational monitoring.
- Add more tests for concurrent webhook requests and database/network failures.
- Improve production session lifecycle management.
- Add rate limiting and more detailed audit logging.

## 🔒 Security Notes

- Keep secrets in environment variables and out of Git.
- Protected backend APIs must verify JWTs.
- Use HTTP-only cookies for the frontend session where applicable.
- Verify webhook signatures before processing events.
- Use database uniqueness constraints to help prevent duplicate credits.
- Use HTTPS and secure cookie settings in production.
- Replace development credentials before any production deployment.

## 📌 Scope

This is an assessment project using a mock payment gateway. It is not intended to process real payments.

---

<p align="center">
  <strong>Built with 💜 for FS-04 — Wallet Top-Up via Payment Gateway</strong>
</p>

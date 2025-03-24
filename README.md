# 📘 Investment Fund Management System - README

## 📦 Overview

This backend service enables users to invest in or redeem from a fund managed through an Ethereum smart contract. Built with **Nest.js (TypeScript)**, it integrates with the blockchain via **Ethers.js**, uses **Redis** for caching fund metrics, and **TypeORM** for persistent transaction storage.

- - -

## 🚀 Setup Instructions

### 🔧 Prerequisites

*   Node.js (v16+)
    
*   Redis (local or hosted)
    
*   An Ethereum RPC provider (e.g., Infura, Alchemy)
    
*   Deployed smart contract implementing `IFundToken`
    

### 🛠 Installation

1.  **Clone the repository**
    

```
git clone https://github.com/frostchain/Libre-Backend.git

cd Libre-Backend
```

2.  **Install dependencies**
    
```
npm install
```

3.  **Configure environment variables** Create a `.env` file at the root with the following:
    
```
RPC_URL=https://mainnet.infura.io/v3/your-api-key

CONTRACT_ADDRESS=0xYourSmartContractAddress

REDIS_URL=redis://localhost:6379

PORT=3000
```
4.  **Run the server**
    
```
npm run start:dev
```
5.  **Open API Docs** Visit: http://localhost:3000/api-docs
    

- - -

## 📘 API Documentation

### Base URL
```
BASE_URL = http://localhost:3000
```
### 🔁 Endpoints

#### 📥 POST `/fund/invest`

Invest into the fund.

**Body:**
```
{

"investor": "0x123...",

"usdAmount": 1000000

}
```
**Response:** Transaction receipt with `transactionHash`

- - -

#### 📤 POST `/fund/redeem`

Redeem shares from the fund.

**Body:**
```
{

"investor": "0x123...",

"shares": 10

}
```
**Response:** Transaction receipt with `transactionHash`

- - -

#### 📊 GET `/fund/metrics`

Returns the current fund metrics.

**Response:**
```
{

"totalAssetValue": "100000000",

"sharesSupply": "1000",

"lastUpdateTime": 1700000000,

"sharePrice": "100000"

}
```
- - -

#### 🧾 GET `/fund/balance/:investor`

Returns the share balance of a given investor address.

**Example:**
```
GET /fund/balance/0x123...
```
**Response:**
```
"200"
```
- - -

## 📐 Main Design Decisions

### ✅ Nest.js Framework

*   Modular architecture, ideal for scalable services
    
*   Easy integration with testing, decorators, DI, and middleware
    

### ✅ Ethers.js for Blockchain

*   Industry-standard for Ethereum interaction
    
*   Provides contract abstraction and signer functionality
    

### ✅ Redis for Caching

*   Reduces load on smart contract by caching `getFundMetrics`
    
*   TTL set to 60 seconds
    

### ✅ TypeORM with SQLite (dev) / Postgres (prod)

*   Tracks investment and redemption transactions persistently
    
*   Enables historical reporting and analytics
    

### ✅ Swagger (OpenAPI)

*   Built-in `/api-docs` endpoint for API visibility
    
*   Ensures consistent API usage for frontend and test automation
    

### ✅ Event-Driven Metrics Sync

*   Listens to `MetricsUpdated` smart contract event
    
*   Automatically updates Redis cache when fund metrics change
    

- - -

## 🧪 Testing

### Run Unit Tests
```
npm run test
```
### Run e2e Tests (Optional)
```
npm run test:e2e
```
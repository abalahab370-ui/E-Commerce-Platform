# STOREDZ E-Commerce Platform

STOREDZ is a full-stack commerce application with a customer-facing storefront and a protected administration area. Customers can browse a product catalog and place guest orders; administrators can manage products, categories, and order status through a React interface backed by a versioned Express API.

**Live storefront:** [storedz-ui.onrender.com](https://storedz-ui.onrender.com/)

## What It Includes

- **Storefront:** Product and category browsing, product details, cart, and checkout flows.
- **Order handling:** Guest checkout and an admin order dashboard with status updates and search.
- **Catalog administration:** Create, edit, and remove products and categories. Product variants and image uploads are supported.
- **Authentication:** Admin login with short-lived access tokens and refresh-token cookies.
- **API versions:** Product, category, and order routes are available under both `/api/v1` and `/api/v2`.
- **Request protection:** Rate limiting, role checks on administrative operations, and CORS allowlisting.

## Stack

| Area | Technologies |
| --- | --- |
| Client | React 19, Vite, Tailwind CSS via CDN |
| Server | Node.js, Express 5 |
| Database | MongoDB with Mongoose |
| Media | Multer, Cloudinary, Sharp |
| Authentication | JSON Web Tokens, bcrypt, HTTP-only cookies |
| Supporting services | Redis, CORS |

## Run Locally

### Prerequisites

- Node.js and npm
- A MongoDB connection string
- Redis and Cloudinary credentials when using the features that depend on them

### Install and configure

```bash
npm install
```

Create a `.env` file in the project root. Keep this file private and do not commit real credentials.

```dotenv
PORT=5500
DATABASE_URI=mongodb_connection_string
ACCESS_TOKEN_SECRET=replace_with_a_long_random_secret
REFRESH_TOKEN_SECRET=replace_with_a_different_long_random_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port
REDIS_PASSWORD=your_redis_password
```

`PORT` defaults to `5500`. MongoDB and both token secrets are used by the server. Configure the Cloudinary and Redis values for the corresponding media and cache integrations in your environment.

### Start the application

```bash
npm run dev
```

This starts the Express API and Vite development server together. The API listens on port `5500` by default, and Vite serves the client on port `5173`.

The client currently uses the deployed API URL in [`src/services/api.js`](src/services/api.js). To use your local server, change `API_BASE_URL` there to:

```js
const API_BASE_URL = 'http://localhost:5500/api/v2';
```

The server's CORS allowlist includes the production storefront and `http://localhost:5173`. If you use a different local origin, add it to `config/corsOptions.js`.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the API and client together |
| `npm run server` | Start the Express API only |
| `npm run client` | Start the Vite client only |
| `npm run build` | Build the client into `dist/` |

## API Overview

The API is mounted at `/api/v1` and `/api/v2`. The browser client uses `/api/v2`.

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/products` | Public | List products |
| `GET` | `/products/:id` | Public | Get a product |
| `POST` | `/products` | Admin | Create a standard product |
| `POST` | `/products/variant` | Admin | Create a product with variants |
| `PATCH` | `/products/:id` | Admin | Update a product |
| `DELETE` | `/products/:id` | Admin | Delete a product |
| `GET` | `/categories` | Public | List categories |
| `POST` | `/categories` | Admin | Create a category |
| `PATCH` | `/categories/:categoryId` | Admin | Update a category |
| `DELETE` | `/categories/:categoryId` | Admin | Delete a category |
| `POST` | `/orders` or `/orders/guest` | Public | Place a guest order |
| `GET` | `/orders` | Admin | List and search orders |
| `PATCH` | `/orders/:id/status` | Admin | Update an order's status |
| `POST` | `/auth/login` | Public | Sign in as an administrator |
| `GET` | `/auth/refresh` | Refresh cookie | Issue a new access token |
| `DELETE` | `/auth/logout` | Authenticated | End the admin session |

Prefix each endpoint with the API version, for example `GET /api/v2/products`. Admin endpoints require a valid access token and the administrator role. Product and category image uploads use `multipart/form-data`; uploaded images must be JPG, PNG, WEBP, or AVIF and are limited to 10 MB per file.

## Project Layout

```text
E-Commerce-Platform/
├── config/       # Database, CORS, media, and Redis configuration
├── Controllers/  # Request handlers, organized by API version
├── middleware/   # Authentication, roles, validation, uploads, and limits
├── models/       # Mongoose models
├── routing/      # Versioned Express route definitions
├── src/          # React storefront and admin client
├── Public/       # Static server-served files
└── server.js     # Express application entry point
```

## Notes

- The server connects to MongoDB before it begins listening. Check `DATABASE_URI` and database availability if startup appears to stall.
- API origins are explicitly allowlisted in `config/corsOptions.js`; update that list when deploying the client to a new domain.
- The project does not currently define a test script in `package.json`.

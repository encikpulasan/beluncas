# Charity Shelter Admin Dashboard

A modern admin dashboard for charity shelters built with Fresh framework and
Preact.

## Setup Instructions

### Running the Mock API Server

1. Start the mock API server:

```bash
deno run --allow-net mock-api.ts
```

This will start the mock server on http://localhost:8000 and provide API
endpoints for development purposes.

### Running the Admin Dashboard

2. In a separate terminal, start the Fresh application:

```bash
deno task start
```

The admin dashboard will be available at http://localhost:8001.

## Login Credentials

Use the following credentials to log in:

- Email: admin@example.com
- Password: password123

## API Endpoints

The mock API server provides the following endpoints:

### Admin Endpoints (Protected)

- **Authentication**: /api/v1/auth/login, /api/v1/auth/verify,
  /api/v1/auth/logout
- **Users**: /api/v1/admin/users
- **Posts**: /api/v1/admin/posts
- **Organization Management**: /api/v1/organization/info,
  /api/v1/organization/locations
- **API Keys**: /api/v1/admin/api-keys

### Public Endpoints

- **Organizations**:
  - GET /api/v1/organizations - Get all organizations
  - GET /api/v1/organizations/:id - Get a specific organization by ID
  - GET /api/v1/organizations/:id/locations - Get locations for a specific
    organization

## Development

The mock API server is configured with CORS support, allowing requests from your
Fresh application running on a different port.

## Pages

- `/admin/dashboard` - Admin dashboard overview
- `/admin/users` - User management
- `/admin/posts` - Post management
- `/admin/organization` - Organization management
- `/admin/api-keys` - API key management
- `/organizations` - Public list of organizations

## Project Structure

- `routes/` - Page routes for the application
- `islands/` - Interactive components with client-side JavaScript
- `components/` - Reusable UI components
- `utils/` - Utility functions and API client
- `mock-api.ts` - Mock API server for development

## Features

- User management
- Content management
- Organization information management
- API key management
- Authentication and authorization
- Public organization directory
- Responsive design

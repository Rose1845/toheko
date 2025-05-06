
# Toheko - SACCO Management System

## Overview

Toheko is a web-based Savings and Credit Cooperative (SACCO) management system designed to streamline operations for financial cooperatives. The system provides tools to manage members, account types, loans, payments, savings, board members, roles, permissions, and more. The frontend is built with  **React** ,  **TypeScript** , and  **Vite** , offering a fast and modern development experience. It interacts with a backend API to perform CRUD operations and manage SACCO data efficiently.

### Key Features

* **Account Type Management** : Create, read, update, and delete account types with fields like name, description, short description, and activation fee.
* **Member Management** : Handle member details including registration, suspension, and next-of-kin information.
* **Loan Management** : Manage loan types, applications, and approvals.
* **Payment Processing** : Support various payment types and modes of payment.
* **Role and Permission Management** : Define roles and permissions for different users (e.g., admins, members).
* **Savings Tracking** : Track member savings with different saving methods.
* **Board Member Management** : Manage board members and their positions.

## Prerequisites

Before setting up the project, ensure you have the following installed on your system:

* **Node.js** (v16 or later): Required to run the JavaScript runtime and manage dependencies.
* **npm** (v7 or later): Comes with Node.js, used for package management.
* **Git** : For cloning the repository.
* **A Code Editor** : Recommended: Visual Studio Code with extensions for React, TypeScript, and ESLint/Prettier for a better development experience.
* **Backend API** : The Toheko backend API must be running and accessible. Ensure you have the API URL and any necessary authentication credentials (e.g., JWT token).

## Setup Instructions

Follow these steps to set up and run the Toheko frontend locally using Vite.

### 1. Clone the Repository

Clone the Toheko repository to your local machine:

```bash
git clone https://github.com/......
cd toheko
```

### 2. Install Dependencies

Install the required npm packages using the following command:

```bash
npm install
```

This will install dependencies like React, TypeScript, Vite, TanStack Query (for API requests), and Shadcn UI components, among others.

### 3. Configure Environment Variables

Create a `.env` file in the root directory of the project and add the necessary environment variables. For example:

```env
VITE_API_URL=http://localhost:8080/api/v1
VITE_AUTH_TOKEN=your-auth-token-here
```

* `VITE_API_URL`: The base URL of the Toheko backend API.
* `VITE_AUTH_TOKEN`: (Optional) If the API requires authentication, provide the token here or configure the `apiClient` to handle authentication dynamically.

You may need to adjust these variables based on your backend setup. Check with the backend team for the correct API URL and authentication requirements.

### 4. Run the Development Server

Start the Vite development server to run the frontend locally:

```bash
npm run dev
```

This will start the server, typically at `http://localhost:3000` (react default port). Open this URL in your browser to view the Toheko application.

### 5. Build for Production

To create a production-ready build of the frontend, run:

```bash
npm run build
```

The built files will be output to the `dist` directory. You can serve these files using a static server (e.g., `npm run preview`).

### 6. Preview the Production Build

To preview the production build locally, run:

```bash
npm run preview
```

This will serve the built files and allow you to test the production version of the app.

## Project Structure

The Toheko frontend is organized as follows:

```
toheko/
├── public/                  # Static assets (e.g., images, favicon)
├── src/                     # Source code
│   ├── components/          # Reusable UI components
│   │   └── ui/              # Shadcn UI components (e.g., Card, Button, Table)
│   ├── hooks/               # Custom React hooks (e.g., useToast)
│   ├── pages/               # Page components
│   │   ├── admin/           # Admin-specific pages (e.g., AccountTypes.tsx)
│   │   └── DashboardLayout.tsx # Layout component for dashboard pages
│   ├── services/            # API service files
│   │   ├── accountTypeService.ts # Service for account type API calls
│   │   └── api.ts           # API client configuration (e.g., axios setup)
│   ├── types/               # TypeScript type definitions
│   │   └── api.ts           # API-related interfaces (e.g., AccountType, Member)
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point for the React app
│   └── index.css            # Global styles
├── .env                     # Environment variables (not committed)
├── .gitignore               # Git ignore file
├── package.json             # Project metadata and dependencies
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite configuration
└── README.md                # Project documentation (this file)
```

### Key Files

* **`src/services/accountTypeService.ts`** : Handles API requests for account types (GET, POST, PUT, DELETE).
* **`src/pages/admin/AccountTypes.tsx`** : Admin page for managing account types with CRUD functionality.
* **`src/types/api.ts`** : Defines TypeScript interfaces for API responses and requests (e.g., `AccountType`, `Member`, `LoanType`).

## Available Scripts

The following scripts are available in `package.json`:

* `npm run dev`: Starts the Vite development server.
* `npm run build`: Builds the app for production, outputting files to the `dist` directory.
* `npm run preview`: Previews the production build locally.
* `npm run lint`: (Optional) Runs ESLint to check for code quality issues (if configured).
* `npm run format`: (Optional) Runs Prettier to format code (if configured).

## Development Notes

### Dependencies

* **React** : Frontend library for building the UI.
* **TypeScript** : Adds static types to JavaScript for better code reliability.
* **Vite** : A fast build tool and development server for modern web projects.
* **TanStack Query** : Used for managing API requests and caching (e.g., fetching account types).
* **Shadcn UI** : A component library for building the UI (e.g., Card, Button, Table).
* **Axios** : (Assumed) Used in `api.ts` for making HTTP requests to the backend.

### API Integration

The frontend communicates with the backend API via endpoints like `/api/v1/account-types`. Ensure the backend API is running and accessible at the URL specified in `VITE_API_URL`. The `apiClient` in `src/services/api.ts` should be configured to handle authentication (e.g., adding a Bearer token to the Authorization header) if required.

### Adding New Features

To add a new page or feature:

1. Create a new page component in `src/pages/` (e.g., `src/pages/admin/NewFeature.tsx`).
2. Define any necessary types in `src/types/api.ts`.
3. Create a service file in `src/services/` to handle API requests for the new feature.
4. Use TanStack Query for data fetching and mutations .

### Styling

The project uses Tailwind CSS (assumed, based on class names like `container mx-auto py-6`) for styling. Update `index.css` or component-specific styles as needed. If Tailwind is not used, styles are applied via `index.css` or component-level CSS.

## Troubleshooting

* **API Errors** : If you see errors like "Failed to fetch account types," check:
* The backend API is running and accessible at `VITE_API_URL`.
* The `apiClient` is correctly configured with authentication headers.
* Network issues or CORS policies on the backend.
* **Build Issues** : If `npm run build` fails, ensure all TypeScript types are correctly defined and there are no syntax errors.
* **Development Server Not Starting** : Run `npm install` again to ensure all dependencies are installed, and check for Node.js version compatibility.

## Contributing

To contribute to Toheko:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Make your changes and commit them (`git commit -m "Add your feature"`).
4. Push to your branch (`git push origin feature/your-feature`).
5. Create a pull request on GitHub.

Please ensure your code follows the project's coding standards (e.g., TypeScript, ESLint/Prettier if configured) and includes appropriate tests if applicable.

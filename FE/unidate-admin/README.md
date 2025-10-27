# Admin Page Project

## Overview
This project is an admin panel built with React and TypeScript. It provides basic functionalities for managing users, viewing a dashboard, and configuring application settings.

## Project Structure
```
unidate-admin
├── src
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── components
│   │   ├── Layout
│   │   │   ├── AdminLayout.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── UI
│   │   │   ├── Button.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Table.tsx
│   ├── pages
│   │   ├── Dashboard
│   │   │   └── index.tsx
│   │   ├── Users
│   │   │   ├── UsersList.tsx
│   │   │   ├── UserDetail.tsx
│   │   │   └── UserForm.tsx
│   │   ├── Settings
│   │   │   └── index.tsx
│   │   └── Auth
│   │       ├── Login.tsx
│   │       └── ProtectedRoute.tsx
│   ├── routes
│   │   └── index.tsx
│   ├── hooks
│   │   ├── useAuth.ts
│   │   └── useFetch.ts
│   ├── services
│   │   ├── api.ts
│   │   └── users.ts
│   ├── contexts
│   │   └── AuthContext.tsx
│   ├── store
│   │   └── index.ts
│   ├── types
│   │   └── index.ts
│   └── utils
│       └── format.ts
├── tests
│   └── App.test.tsx
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.cjs
├── postcss.config.cjs
├── .eslintrc.cjs
├── .gitignore
├── .env.example
└── README.md
```

## Features
- **User Management**: View, add, edit, and delete users.
- **Dashboard**: Overview of key metrics and statistics.
- **Settings**: Manage application settings.
- **Authentication**: Secure routes and user login.

## Getting Started
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd unidate-admin
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Start the development server:
   ```
   npm run dev
   ```

## Technologies Used
- React
- TypeScript
- Vite
- Tailwind CSS
- ESLint

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License
This project is licensed under the MIT License.
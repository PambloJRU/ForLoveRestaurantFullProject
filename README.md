# Four Love Restaurant - Management System

A full-stack restaurant management system built as an academic project (Group 5, 2026) for Universidad de Costa Rica (UCR).

## Overview

Four Love Restaurant is a comprehensive management platform that handles employees, users, roles and permissions, menu items, ingredients, suppliers, tables, orders, payments, and announcements for a restaurant business.

## Tech Stack

### Backend

| Technology | Version |
|---|---|
| C# / .NET | 10.0 |
| ASP.NET Core Web API | 10.0 |
| Entity Framework Core | 10.0.2 |
| SQL Server (LocalDB) | - |
| JWT Bearer Authentication | - |
| xUnit (Testing) | 3.2.2 |

### Frontend

| Technology | Version |
|---|---|
| React | 18.3.1 |
| TypeScript | - |
| Vite | 7.0.6 |
| Tailwind CSS | 3.4.19 |
| TanStack React Query | 5.56.2 |
| Axios | 1.13.4 |
| React Router DOM | 6.26.2 |
| Radix UI | - |

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend                           │
│              React + TypeScript + Vite                  │
│                                                         │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌───────────┐   │
│  │  Pages  │ │Components│  │ Services│  │  Hooks    │  │
│  └────┬────┘  └────┬────┘  └────┬────┘  └─────┬─────┘   │
│       │            │            │              │        │
│       └────────────┴──────┬─────┴──────────────┘        │
│                           │                             │
│                    Axios (HTTP Client)                  │
└───────────────────────────┼─────────────────────────────┘
                            │ REST API
┌───────────────────────────┼─────────────────────────────┐
│                      Backend                            │
│              ASP.NET Core Web API                       │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌────────────────┐   │
│  │ Controllers │  │   Models    │  │  Repository    │   │
│  │   (12 API)  │  │   (13 ENT)  │  │  (DbContext)   │   │
│  └──────┬──────┘  └──────┬──────┘  └───────┬────────┘   │
│         │                │                  │           │
│         └────────────────┴──────────────────┘           │
│                         │                               │
│              Entity Framework Core                      │
│                         │                               │
└─────────────────────────┼───────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────┐
│                    Database                             │
│              SQL Server LocalDB                         │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐               │
│  │ Employes │  │  Users   │  │   Rols   │               │
│  ├──────────┤  ├──────────┤  ├──────────┤               │
│  │ Orders   │  │Payments  │  │ Tables   │               │
│  ├──────────┤  ├──────────┤  ├──────────┤               │
│  │MenuItems │  │Ingredients│ │Suppliers │               │
│  └──────────┘  └──────────┘  └──────────┘               │
└─────────────────────────────────────────────────────────┘
```

## Database Schema

```
SUPPLIERS ──< INGREDIENTS ──M:N── MENUITEMS ──M:N── ORDERS ──< PAYMENTS
                                                  │
                                               TABLES

EMPLOYES ──1:1── USERS ──N:1── ROLS ──M:N── PERMISSIONS
```

### Tables (14 total)

| Table | Description |
|---|---|
| Employes | Employee records (identification, name, shift, salary) |
| Users | System users linked to employees and roles |
| Rols | User roles (Administrador, Cocinero, Mesero) |
| Permissions | System permissions for API access control |
| Rol_Permission | Many-to-many: Roles ↔ Permissions |
| MENUITEMS | Restaurant menu items |
| INGREDIENTS | Ingredients linked to suppliers |
| SUPPLIERS | Ingredient suppliers |
| TABLES | Restaurant tables |
| ORDERS | Customer orders linked to tables |
| PAYMENTS | Payment records linked to orders |
| COMPONE | Many-to-many: Ingredients ↔ MenuItems |
| CONTEIN | Many-to-many: MenuItems ↔ Orders |
| Announcements | System announcements |

## Roles & Permissions

| Role | Access Level | Routes |
|---|---|---|
| **Administrador** | Full access (32 permissions) | All routes |
| **Cocinero** | Kitchen staff (8 permissions) | Home, Menu Items, Ingredients |
| **Mesero** | Waiter (10 permissions) | Home, Tables, Orders, Menu Items, Payments |

### Test Users

| User | Password | Role |
|---|---|---|
| `admin` | `123456` | Administrador |
| `cocinero` | `123456` | Cocinero |
| `mesero` | `123456` | Mesero |

## Project Structure

```
ForLoveRestaurant/
├── grupo_5_proyecto_2026_backend/
│   ├── FourLoveRestaurant/
│   │   ├── Controllers/        # 12 API controllers
│   │   ├── Models/             # 13 entity models + DTOs
│   │   ├── Repository/         # EF Core DbContext
│   │   ├── Custom/             # Auth helpers & utilities
│   │   ├── Migrations/         # Database migrations
│   │   ├── Program.cs          # App configuration
│   │   └── appsettings.json    # DB connection & JWT config
│   ├── DataBase/
│   │   └── CreateTables.sql    # Raw SQL schema
│   └── PruebasUnitariasBack/   # Unit tests (xUnit)
│
├── grupo_5_proyecto_2026_fronted/
│   ├── src/
│   │   ├── pages/              # Page components
│   │   ├── components/         # Reusable UI components
│   │   ├── services/           # API service layer
│   │   ├── types/              # TypeScript definitions
│   │   ├── hooks/              # Custom React hooks
│   │   ├── utils/              # Utilities (JWT, etc.)
│   │   └── lib/                # Helper functions
│   ├── tests/e2e/              # Playwright E2E tests
│   └── package.json
│
└── documentacion/              # Project documentation
```

## Getting Started

### Prerequisites

- .NET SDK 10.0
- Node.js 18+ (or Bun)
- SQL Server LocalDB

### Backend Setup

```bash
cd grupo_5_proyecto_2026_backend/FourLoveRestaurant

# Restore dependencies
dotnet restore

# Apply database migrations
dotnet ef database update

# Run the API
dotnet run
```

The API will start at `https://localhost:5001` (or as configured in `launchSettings.json`).

### Frontend Setup

```bash
cd grupo_5_proyecto_2026_fronted

# Install dependencies (using npm or bun)
npm install
# or
bun install

# Run development server
npm run dev
# or
bun dev
```

The frontend will start at `http://localhost:5173`.

## API Endpoints

| Controller | Endpoints |
|---|---|
| Access | Login, Register |
| Employee | CRUD operations |
| User | CRUD operations |
| MenuItem | CRUD operations |
| Ingredient | CRUD operations |
| Supplier | CRUD operations |
| Table | CRUD operations |
| Order | CRUD operations |
| Payment | CRUD operations |
| RolPermission | Get/Update roles & permissions |
| Announcements | CRUD operations |



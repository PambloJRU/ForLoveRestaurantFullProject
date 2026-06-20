# Four Love Restaurant - Sistema de Gestión

Sistema de gestión de restaurante construido como proyecto académico (Grupo 5, 2026) para la Universidad de Costa Rica (UCR).

## Descripción General

Four Love Restaurant es una plataforma de gestión integral que maneja empleados, usuarios, roles y permisos, elementos del menú, ingredientes, proveedores, mesas, órdenes, pagos y anuncios para un negocio de restaurante.

## Stack Tecnológico

### Backend

| Tecnología | Versión |
|---|---|
| C# / .NET | 10.0 |
| ASP.NET Core Web API | 10.0 |
| Entity Framework Core | 10.0.2 |
| SQL Server (LocalDB) | - |
| JWT Bearer Authentication | - |
| xUnit (Testing) | 3.2.2 |

### Frontend

| Tecnología | Versión |
|---|---|
| React | 18.3.1 |
| TypeScript | - |
| Vite | 7.0.6 |
| Tailwind CSS | 3.4.19 |
| TanStack React Query | 5.56.2 |
| Axios | 1.13.4 |
| React Router DOM | 6.26.2 |
| Radix UI | - |

## Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend                           │
│              React + TypeScript + Vite                  │
│                                                         │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌───────────┐ │
│  │  Pages   │  │Components│  │ Services │  │   Hooks   │ │
│  └────┬────┘  └────┬────┘  └────┬────┘  └─────┬─────┘ │
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
│  ┌─────────────┐  ┌─────────────┐  ┌────────────────┐  │
│  │ Controllers  │  │   Models    │  │  Repository    │  │
│  │   (12 API)   │  │   (13 ENT)  │  │  (DbContext)   │  │
│  └──────┬──────┘  └──────┬──────┘  └───────┬────────┘  │
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
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ Employes │  │  Users   │  │   Rols   │              │
│  ├──────────┤  ├──────────┤  ├──────────┤              │
│  │ Orders   │  │Payments  │  │ Tables   │              │
│  ├──────────┤  ├──────────┤  ├──────────┤              │
│  │MenuItems │  │Ingredients│ │Suppliers │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────┘
```

## Esquema de Base de Datos

```
PROVEEDORES ──< INGREDIENTES ──M:N── PLATILLOS ──M:N── ORDENES ──< PAGOS
                                                  │
                                               MESAS

EMPLEADOS ──1:1── USUARIOS ──N:1── ROLES ──M:N── PERMISOS
```

### Tablas (14 en total)

| Tabla | Descripción |
|---|---|
| Employes | Registros de empleados (identificación, nombre, turno, salario) |
| Users | Usuarios del sistema vinculados a empleados y roles |
| Rols | Roles de usuario (Administrador, Cocinero, Mesero) |
| Permissions | Permisos del sistema para control de acceso API |
| Rol_Permission | Muchos a muchos: Roles ↔ Permisos |
| MENUITEMS | Elementos del menú del restaurante |
| INGREDIENTS | Ingredientes vinculados a proveedores |
| SUPPLIERS | Proveedores de ingredientes |
| TABLES | Mesas del restaurante |
| ORDERS | Órdenes de clientes vinculadas a mesas |
| PAYMENTS | Registros de pagos vinculados a órdenes |
| COMPONE | Muchos a muchos: Ingredientes ↔ MenuItems |
| CONTEIN | Muchos a muchos: MenuItems ↔ Orders |
| Announcements | Anuncios del sistema |

## Roles y Permisos

| Rol | Nivel de Acceso | Rutas |
|---|---|---|
| **Administrador** | Acceso total (32 permisos) | Todas las rutas |
| **Cocinero** | Personal de cocina (8 permisos) | Inicio, Platillos, Ingredientes |
| **Mesero** | Mesero (10 permisos) | Inicio, Mesas, Órdenes, Platillos, Pagos |

### Usuarios de Prueba

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `123456` | Administrador |
| `cocinero` | `123456` | Cocinero |
| `mesero` | `123456` | Mesero |

## Estructura del Proyecto

```
ForLoveRestaurant/
├── grupo_5_proyecto_2026_backend/
│   ├── FourLoveRestaurant/
│   │   ├── Controllers/        # 12 controladores API
│   │   ├── Models/             # 13 modelos de entidad + DTOs
│   │   ├── Repository/         # DbContext de EF Core
│   │   ├── Custom/             # Helpers de auth y utilidades
│   │   ├── Migrations/         # Migraciones de base de datos
│   │   ├── Program.cs          # Configuración de la app
│   │   └── appsettings.json    # Config DB y JWT
│   ├── DataBase/
│   │   └── CreateTables.sql    # Schema SQL raw
│   └── PruebasUnitariasBack/   # Pruebas unitarias (xUnit)
│
├── grupo_5_proyecto_2026_fronted/
│   ├── src/
│   │   ├── pages/              # Componentes de página
│   │   ├── components/         # Componentes UI reutilizables
│   │   ├── services/           # Capa de servicios API
│   │   ├── types/              # Definiciones TypeScript
│   │   ├── hooks/              # Hooks React personalizados
│   │   ├── utils/              # Utilidades (JWT, etc.)
│   │   └── lib/                # Funciones auxiliares
│   ├── tests/e2e/              # Pruebas E2E con Playwright
│   └── package.json
│
└── documentacion/              # Documentación del proyecto
```

## Inicio Rápido

### Prerrequisitos

- .NET SDK 10.0
- Node.js 18+ (o Bun)
- SQL Server LocalDB

### Configuración del Backend

```bash
cd grupo_5_proyecto_2026_backend/FourLoveRestaurant

# Restaurar dependencias
dotnet restore

# Aplicar migraciones de base de datos
dotnet ef database update

# Ejecutar la API
dotnet run
```

La API iniciará en `https://localhost:5001` (o según la configuración en `launchSettings.json`).

### Configuración del Frontend

```bash
cd grupo_5_proyecto_2026_fronted

# Instalar dependencias (usando npm o bun)
npm install
# o
bun install

# Ejecutar servidor de desarrollo
npm run dev
# o
bun dev
```

El frontend iniciará en `http://localhost:5173`.

## Endpoints de la API

| Controlador | Endpoints |
|---|---|
| Access | Login, Register |
| Employee | Operaciones CRUD |
| User | Operaciones CRUD |
| MenuItem | Operaciones CRUD |
| Ingredient | Operaciones CRUD |
| Supplier | Operaciones CRUD |
| Table | Operaciones CRUD |
| Order | Operaciones CRUD |
| Payment | Operaciones CRUD |
| RolPermission | Obtener/Actualizar roles y permisos |
| Announcements | Operaciones CRUD |

## Licencia

Proyecto académico - Universidad de Costa Rica (UCR), 2026.

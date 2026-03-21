import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import AOS from "aos";
import "aos/dist/aos.css";

import { ProtectedRoute } from "@/components/Users/ProtectedRoute";
import { PublicRoute } from "@/components/Users/PublicRoute";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import User from "@/pages/Users/User";

import EmployeesPage from "@/pages/Employees/EmployeesPage";
import CreateEmployee from "@/pages/Employees/CreateEmployee";

import SuppliersPage from "@/pages/Suppliers/SuppliersPage";
import CreateSupplier from "@/pages/Suppliers/CreateSupplier";

import UsersPage from "@/pages/Users/UsersPage";
import CreateUserPage from "@/pages/Users/CreateUserPage";

import IngredientsPage from "@/pages/Ingredients/IngredientsPage";
import IngredientFormPage from "@/pages/Ingredients/IngredientFormPage";

import OrdersPage from "@/pages/Orders/OrdersPage";

import Tables from "@/pages/Tables/TablesPage";
import CreateTable from "@/pages/Tables/CreateTable";

import CreateMenuItem from "@/pages/MenuItems/CreateMenuItem";
import MenuItemsPage from "@/pages/MenuItems/MenuItemsPage";

import EditMenuItem from "@/pages/MenuItems/EditMenuItem";

import PaymentsPage from "./pages/Payments/PaymentsPage";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    AOS.init({ duration: 800, once: true, offset: 100 });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <BrowserRouter>
          <Routes>

            {/* HOME */}
            <Route
              path="/"
              element={
                <ProtectedRoute allowedRoles={["Administrador", "Cocinero", "Mesero"]}>
                  <Index />
                </ProtectedRoute>
              }
            />

            {/* LOGIN */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <User />
                </PublicRoute>
              }
            />

            {/* EMPLOYEES */}
            <Route
              path="/employees"
              element={
                <ProtectedRoute allowedRoles={["Administrador"]}>
                  <EmployeesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/employees/create"
              element={
                <ProtectedRoute allowedRoles={["Administrador"]}>
                  <CreateEmployee />
                </ProtectedRoute>
              }
            />

            {/* SUPPLIERS */}
            <Route
              path="/suppliers"
              element={
                <ProtectedRoute allowedRoles={["Administrador"]}>
                  <SuppliersPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/suppliers/create"
              element={
                <ProtectedRoute allowedRoles={["Administrador"]}>
                  <CreateSupplier />
                </ProtectedRoute>
              }
            />

            {/* USERS */}
            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={["Administrador"]}>
                  <UsersPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/usuarios/crear"
              element={
                <ProtectedRoute allowedRoles={["Administrador"]}>
                  <CreateUserPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/usuarios/editar/:id"
              element={
                <ProtectedRoute allowedRoles={["Administrador"]}>
                  <CreateUserPage />
                </ProtectedRoute>
              }
            />

            {/* INGREDIENTES */}
            <Route path="/ingredients" element={<IngredientsPage />} />
            <Route path="/ingredientes/crear" element={<IngredientFormPage />} />
            <Route path="/ingredientes/editar/:id" element={<IngredientFormPage />} />

            {/* TABLES */}
            <Route
              path="/tables"
              element={
                <ProtectedRoute allowedRoles={["Administrador", "Mesero"]}>
                  <Tables />
                </ProtectedRoute>
              }
            />

            {/* CREAR MESA */}
            <Route
              path="/tables/create"
              element={
                <ProtectedRoute allowedRoles={["Administrador"]}>
                  <CreateTable />
                </ProtectedRoute>
              }
            />

            {/* EDITAR MESA*/}
            <Route
              path="/tables/edit/:id"
              element={
                <ProtectedRoute allowedRoles={["Administrador"]}>
                  <CreateTable />
                </ProtectedRoute>
              }
            />

            {/* Platillos */}
          <Route
            path="/menuitems"
            element={
              <ProtectedRoute allowedRoles={["Administrador", "Cocinero", "Mesero"]}>
                <MenuItemsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/menuitems/create"
            element={
              <ProtectedRoute allowedRoles={["Administrador"]}>
                <CreateMenuItem />
              </ProtectedRoute>
            }
          />

          <Route
            path="/menuitems/edit/:id"
            element={
              <ProtectedRoute allowedRoles={["Administrador"]}>
                <EditMenuItem />
              </ProtectedRoute>
            }
          />

          



          {/* ORDERS */}
<Route
  path="/orders"
  element={
    <ProtectedRoute allowedRoles={["Administrador", "Mesero"]}>
      <OrdersPage />
    </ProtectedRoute>
  }
/>















            <Route
              path = "/payments"
              element={<ProtectedRoute allowedRoles={["Administrador"]}>
                <PaymentsPage></PaymentsPage>
              </ProtectedRoute>}
            />

            <Route path="/unauthorized" element={<div>No autorizado</div>} />

            {/* NOT FOUND */}
            <Route path="*" element={<NotFound />} />

          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

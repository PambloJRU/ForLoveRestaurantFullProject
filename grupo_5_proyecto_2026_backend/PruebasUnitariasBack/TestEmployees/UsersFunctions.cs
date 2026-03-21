using FourLoveRestaurant.Controllers;
using FourLoveRestaurant.Custom;
using FourLoveRestaurant.Models;
using FourLoveRestaurant.Repository;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using System;
using System.Collections.Generic;
using System.Text;

namespace PruebasUnitariasBack.TestEmployees
{
   public class UserFunctions()
    {
        
        [Fact]
        public async Task GetUserListTest()
        {
            // --- ARRANGE (Preparar Base de Datos) ---
            var options = new DbContextOptionsBuilder<ForLoveDBContext>()
                .UseInMemoryDatabase(databaseName: "TestDB_UserList_WithUtils") // Nombre único
                .Options;


            using (var context = new ForLoveDBContext(options))
            {
                // Crear Roles
                context.Rols.Add(new Rol { Id = 1, Name = "Admin", IsActve = true });
                context.Rols.Add(new Rol { Id = 2, Name = "Mesero", IsActve = true });

                // Crear Usuarios
                context.Users.Add(new User { Id = 1, Name = "Juan", Password="xd",IsActve = true, IdRol = 1 });
                context.Users.Add(new User { Id = 2, Name = "Maria", Password="123",IsActve = true, IdRol = 2 });
                context.Users.Add(new User { Id = 3, Name = "Pedro", Password="Jjaja" ,IsActve = false, IdRol = 2 });

                await context.SaveChangesAsync();
            }

            // --- ARRANGE (Preparar Controlador y Dependencias) ---
            using (var context = new ForLoveDBContext(options))
            {
                var mockConfig = new Mock<IConfiguration>();

                var utilities = new Utilities(mockConfig.Object, context);

                var controller = new UserController(context, utilities);

                // --- (Actuar) ---
                var result = await controller.UserList();

                // --- ASSERT (Verificar) ---
                var objectResult = Assert.IsType<ObjectResult>(result);
                Assert.Equal(200, objectResult.StatusCode);

                // Verificar contenido
                var data = objectResult.Value;
                var listProperty = data.GetType().GetProperty("value");
                var userListResult = listProperty.GetValue(data, null) as List<User>;

                Assert.NotNull(userListResult);
                Assert.Equal(2, userListResult.Count); // Juan y Maria
                Assert.DoesNotContain(userListResult, u => u.IsActve == false);
            }
        }

        [Fact]
        public async Task DeleteUserFromIdTest()
        {
            // --- ARRANGE (Preparar Base de Datos) ---
            var options = new DbContextOptionsBuilder<ForLoveDBContext>()
                .UseInMemoryDatabase(databaseName: "TestDB_UserList_WithUtils") // Nombre único
                .Options;

            // 1. Insertar Datos Semilla
            using (var context = new ForLoveDBContext(options))
            {
                // Crear Roles
                context.Rols.Add(new Rol { Id = 1, Name = "Admin", IsActve = true });
                context.Rols.Add(new Rol { Id = 2, Name = "Mesero", IsActve = true });

                // Crear Usuarios
                context.Users.Add(new User { Id = 1, Name = "Juan", Password = "xd", IsActve = true, IdRol = 1 });
                context.Users.Add(new User { Id = 2, Name = "Maria", Password = "123", IsActve = true, IdRol = 2 });
                context.Users.Add(new User { Id = 3, Name = "Pedro", Password = "Jjaja", IsActve = false, IdRol = 2 });

                await context.SaveChangesAsync();
            }

            // --- ARRANGE (Preparar Controlador y Dependencias) ---
            using (var context = new ForLoveDBContext(options))
            {
                var mockConfig = new Mock<IConfiguration>();

                var utilities = new Utilities(mockConfig.Object, context);

                var controller = new UserController(context, utilities);

                // --- ACT (Actuar) ---
                var result = await controller.DeleteUser(3);

                // --- ASSERT (Verificar) ---
                var objectResult = Assert.IsType<ObjectResult>(result);
                Assert.Equal(200, objectResult.StatusCode);

                // Verificar contenido
                User? u = await context.Users.FindAsync(3);
                Assert.NotNull(u);
                Assert.True(u.IsActve == false);


            }
        }

    }

}
    


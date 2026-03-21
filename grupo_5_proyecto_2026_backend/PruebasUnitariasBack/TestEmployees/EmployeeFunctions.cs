using FourLoveRestaurant.Controllers;
using FourLoveRestaurant.Models;
using FourLoveRestaurant.Models.DTOs;
using FourLoveRestaurant.Repository;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace PruebasUnitariasBack.TestEmployees
{
    public class EmployeeFunctions
    {
        [Fact]
        public async Task EmployeeList_ReturnsOkWithOnlyActiveEmployees()
        {
            var options = new DbContextOptionsBuilder<ForLoveDBContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            using (var context = new ForLoveDBContext(options))
            {
                context.Employes.Add(new Employe { Id = 1, Name = "Juan", IsActive = true, Identification = "18123838", LastNames = "Juarez", Shift = "diurno" });
                context.Employes.Add(new Employe { Id = 2, Name = "Maria", IsActive = true, Identification = "345235235", LastNames = "Golden", Shift = "diurno" });
                context.Employes.Add(new Employe { Id = 3, Name = "Pedro", IsActive = false, Identification = "12412431", LastNames = "Freddy", Shift = "diurno" });

                await context.SaveChangesAsync();
            }

            using (var context = new ForLoveDBContext(options))
            {
                var controller = new EmployeeController(context);
                var result = await controller.EmployeeList();

                var objectResult = Assert.IsType<ObjectResult>(result);
                Assert.Equal(200, objectResult.StatusCode);

                var data = objectResult.Value;
                var listProperty = data.GetType().GetProperty("value");
                var employeeList = listProperty.GetValue(data, null) as List<Employe>;

                Assert.NotNull(employeeList);
                Assert.Equal(2, employeeList.Count);
                Assert.DoesNotContain(employeeList, e => e.Name == "Pedro");
            }
        }


        [Fact]
        public async Task EditEmployee_UpdatesEmployeeCorrectly()
        {
            var options = new DbContextOptionsBuilder<ForLoveDBContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            using (var context = new ForLoveDBContext(options))
            {
                context.Employes.Add(new Employe
                {
                    Id = 1,
                    Identification = "12345678",
                    Name = "Luis",
                    LastNames = "Perez",
                    Salary = 500000,
                    Shift = "Diurno",
                    IsActive = true
                });

                await context.SaveChangesAsync();
            }

            using (var context = new ForLoveDBContext(options))
            {
                var controller = new EmployeeController(context);

                var dto = new EmployeDTO
                {
                    Name = "Luis Actualizado",
                    LastNames = "Perez Gomez",
                    Salary = 700000,
                    Shift = "Nocturno"
                };

                var result = await controller.EditEmployee(1, dto);

                var objectResult = Assert.IsType<ObjectResult>(result);
                Assert.Equal(200, objectResult.StatusCode);

                var employee = await context.Employes.FindAsync(1);

                Assert.Equal("Luis Actualizado", employee!.Name);
                Assert.Equal("Perez Gomez", employee.LastNames);
                Assert.Equal(700000, employee.Salary);
                Assert.Equal("Nocturno", employee.Shift);
            }
        }




        [Fact]
        public async Task DeleteEmployeeFromIdTest()
        {
            var options = new DbContextOptionsBuilder<ForLoveDBContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            using (var context = new ForLoveDBContext(options))
            {
                context.Employes.Add(new Employe { Id = 4, Name = "Juan", IsActive = true, Identification = "18123838", LastNames = "Juarez", Shift = "diurno" });
                await context.SaveChangesAsync();
            }

            using (var context = new ForLoveDBContext(options))
            {
                var controller = new EmployeeController(context);
                var result = await controller.DeleteEmployee(4);

                var objectResult = Assert.IsType<ObjectResult>(result);
                Assert.Equal(200, objectResult.StatusCode);

                var e = await context.Employes.FindAsync(4);
                Assert.False(e!.IsActive);
            }
        }

        [Fact]
        public async Task DeleteEmployee_ReturnsNotFound_WhenEmployeeDoesNotExist()
        {
            var options = new DbContextOptionsBuilder<ForLoveDBContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            using var context = new ForLoveDBContext(options);
            var controller = new EmployeeController(context);

            var result = await controller.DeleteEmployee(999);

            var objectResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(404, objectResult.StatusCode);
        }

        [Fact]
        public async Task DeleteEmployee_DoesNotChange_WhenAlreadyInactive()
        {
            var options = new DbContextOptionsBuilder<ForLoveDBContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            using (var context = new ForLoveDBContext(options))
            {
                context.Employes.Add(new Employe
                {
                    Id = 5,
                    Identification = "12345678",
                    Name = "Luis",
                    LastNames = "Perez",
                    Shift = "Diurno",
                    Salary = 500000,
                    IsActive = false
                });

                await context.SaveChangesAsync();
            }

            using (var context = new ForLoveDBContext(options))
            {
                var controller = new EmployeeController(context);
                var result = await controller.DeleteEmployee(5);

                var objectResult = Assert.IsType<ObjectResult>(result);
                Assert.Equal(200, objectResult.StatusCode);

                var employee = await context.Employes.FindAsync(5);
                Assert.False(employee!.IsActive);
            }
        }




    }
}

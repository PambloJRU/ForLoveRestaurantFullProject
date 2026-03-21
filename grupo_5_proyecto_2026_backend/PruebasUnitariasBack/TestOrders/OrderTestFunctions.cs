using FourLoveRestaurant.Controllers;
using FourLoveRestaurant.Models;
using FourLoveRestaurant.Models.DTOs;
using FourLoveRestaurant.Repository;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace PruebasUnitariasBack.TestOrders
{
    public class OrderTestFunctions
    {

        [Fact]
        public async Task DeleteOrder_ExistingId()
        {
            var dbName = "TestDB_DeleteOrder_Success";
            var options = new DbContextOptionsBuilder<ForLoveDBContext>()
                .UseInMemoryDatabase(databaseName: dbName)
                .Options;

            using (var context = new ForLoveDBContext(options))
            {
                context.Orders.Add(new Order
                {
                    Id = 100,
                    Isactive = true
                });
                await context.SaveChangesAsync();
            }

            using (var context = new ForLoveDBContext(options))
            {
                var controller = new OrderController(context);

                var result = await controller.DeleteOrder(100);
                var okResult = Assert.IsType<OkObjectResult>(result); 
                Assert.Equal(200, okResult.StatusCode);
                var orderInDb = await context.Orders.FindAsync(100);
                Assert.NotNull(orderInDb);
                Assert.False(orderInDb.Isactive, "La orden debe tener Isactive = false");
            }
        }

        [Fact]
        public async Task UpdateOrder_ExistingId()
        {
            // --- ARRANGE ---
            var dbName = "TestDB_UpdateOrder_Success";
            var options = new DbContextOptionsBuilder<ForLoveDBContext>()
                .UseInMemoryDatabase(databaseName: dbName)
                .Options;

            // 1. Crear datos iniciales
            using (var context = new ForLoveDBContext(options))
            {
                _ = context.Orders.Add(new Order
                {
                    Id = 1,
                    Number = 1,
                    Date = DateOnly.FromDateTime(DateTime.Today.AddDays(-1)),
                    IdTable = 5,
                    Isactive = true
                });
                await context.SaveChangesAsync();
            }

            using (var context = new ForLoveDBContext(options))
            {
                var controller = new OrderController(context);

                var updateDto = new OrderDTO
                {
                    Number = 1,
                    Date = DateOnly.FromDateTime(DateTime.Today),
                    IdTable = 10 // Cambiamos de mesa 5 a 10
                };

                var result = await controller.UpdateOrder(1, updateDto);

                var okResult = Assert.IsType<OkObjectResult>(result);
                Assert.Equal(200, okResult.StatusCode);

                var orderInDb = await context.Orders.FindAsync(1);

                Assert.NotNull(orderInDb);
                Assert.Equal(1, orderInDb.Number);
                Assert.Equal(10, orderInDb.IdTable);
                Assert.Equal(DateOnly.FromDateTime(DateTime.Today), orderInDb.Date);
            }
        }
    }
}

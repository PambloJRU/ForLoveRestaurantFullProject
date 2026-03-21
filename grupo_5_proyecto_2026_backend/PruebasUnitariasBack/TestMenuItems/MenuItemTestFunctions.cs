using FourLoveRestaurant.Controllers;
using FourLoveRestaurant.Models;
using FourLoveRestaurant.Models.DTOs;
using FourLoveRestaurant.Repository;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using System;
using System.Collections.Generic;
using System.Text;

namespace PruebasUnitariasBack.TestMenuItems
{
    public class MenuItemTestFunctions
    {
        [Fact]
        public async Task EditDish_WithoutNewPhoto()
        {
            var dbName = "TestDB_EditDish_WithoutPhoto";
            var options = new DbContextOptionsBuilder<ForLoveDBContext>()
                .UseInMemoryDatabase(databaseName: dbName)
                .Options;
            var mockEnv = new Mock<IWebHostEnvironment>();
            using (var context = new ForLoveDBContext(options))
            {
                context.Menuitems.Add(new Menuitem
                {
                    Id = 1,
                    Name = "Pasta Vieja",
                    Description = "Sabe a viejo",
                    Price = 10.0m,
                    Photo = "/uploads/dishes/foto_vieja.jpg",
                    Isactive = true
                });
                await context.SaveChangesAsync();
            }
            using (var context = new ForLoveDBContext(options))
            {
                var controller = new MenuItemController(context, mockEnv.Object);
                var requestDto = new MenuItemDTO
                {
                    Name = "Pasta Fresca",
                    Description = "Recién hecha",
                    Price = 15.0m,
                    Photo = null // IMPORTANTE: Sin foto
                };
                var result = await controller.EditDish(1, requestDto);

                var objectResult = Assert.IsType<ObjectResult>(result);
                Assert.Equal(200, objectResult.StatusCode);

                // Verificar en DB
                var dishInDb = await context.Menuitems.FindAsync(1);
                Assert.Equal("Pasta Fresca", dishInDb.Name);
                Assert.Equal("Recién hecha", dishInDb.Description);
                Assert.Equal(15.0m, dishInDb.Price);
                Assert.Equal("/uploads/dishes/foto_vieja.jpg", dishInDb.Photo);
            }
        }


        [Fact]
        public async Task DeleteDish_ExistingActive()
        {
            var dbName = "TestDB_DeleteDish_Success";
            var options = new DbContextOptionsBuilder<ForLoveDBContext>()
                .UseInMemoryDatabase(databaseName: dbName)
                .Options;
            using (var context = new ForLoveDBContext(options))
            {
                context.Menuitems.Add(new Menuitem
                {
                    Id = 1,
                    Name = "Ensalada Drusnia",
                    Isactive = true 
                });
                await context.SaveChangesAsync();
            }
            using (var context = new ForLoveDBContext(options))
            {
                var controller = new MenuItemController(context, null);
                var result = await controller.DeleteDish(1);
                var objectResult = Assert.IsType<ObjectResult>(result);
                Assert.Equal(200, objectResult.StatusCode);
                var dishInDb = await context.Menuitems.FindAsync(1);
                Assert.NotNull(dishInDb);
                Assert.False(dishInDb.Isactive, "El platillo debería estar marcado como inactivo (Isactive = false)");
            }
        }
    }
}

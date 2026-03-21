using FourLoveRestaurant.Controllers;
using FourLoveRestaurant.Models;
using FourLoveRestaurant.Models.DTOs;
using FourLoveRestaurant.Repository;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;


namespace PruebasUnitariasBack.TestIngredients
{
    public class IngredientTestFunctions
    {
        [Fact]
        public async Task List_WithActiveIngredients()
        {
            var dbName = "TestDB_IngredientList_Ok";
            var options = new DbContextOptionsBuilder<ForLoveDBContext>()
                .UseInMemoryDatabase(databaseName: dbName)
                .Options;

            // Sembrar datos: Uno activo y uno inactivo
            using (var context = new ForLoveDBContext(options))
            {
                context.Ingredients.Add(new Ingredient { Id = 1, Name = "Tomate", Isactive = true });
                context.Ingredients.Add(new Ingredient { Id = 2, Name = "Lechuga Pasada", Isactive = false });
                await context.SaveChangesAsync();
            }

            using (var context = new ForLoveDBContext(options))
            {
                
                var controller = new IngredientController(context,null);

                var result = await controller.List();

                var objectResult = Assert.IsType<ObjectResult>(result);
                Assert.Equal(200, objectResult.StatusCode);
                var data = objectResult.Value;
                var listProp = data.GetType().GetProperty("value");
                var list = listProp.GetValue(data, null) as List<Ingredient>;

                Assert.NotNull(list);
                Assert.Single(list);
                Assert.Equal("Tomate", list[0].Name);
            }
        }

        [Fact]
        public async Task EditIngredient_UpdatesDataCorrectly()
        {
            var dbName = "TestDB_EditIngredient_Ok";
            var options = new DbContextOptionsBuilder<ForLoveDBContext>()
                .UseInMemoryDatabase(dbName)
                .Options;

            string tempPath = Path.GetTempPath();
            var mockEnv = new Mock<IWebHostEnvironment>();
            mockEnv.Setup(m => m.WebRootPath).Returns(tempPath);

            using (var context = new ForLoveDBContext(options))
            {
                context.Ingredients.Add(new Ingredient
                {
                    Id = 20,
                    Name = "Pan",
                    Stock = 10,
                    Price = 500,
                    IdSuppliers = 1,
                    Isactive = true
                });
                await context.SaveChangesAsync();
            }

            using (var context = new ForLoveDBContext(options))
            {
                var controller = new IngredientController(context, mockEnv.Object);

                var dto = new IngredientDTO
                {
                    Name = "Pan Integral",
                    Stock = 30,
                    Price = 800,
                    IdSuppliers = 2,
                    Photo = null
                };

                var result = await controller.EditIngredient(20, dto);

                var objectResult = Assert.IsType<ObjectResult>(result);
                Assert.Equal(200, objectResult.StatusCode);

                var ingredient = await context.Ingredients.FindAsync(20);
                Assert.Equal("Pan Integral", ingredient.Name);
                Assert.Equal(30, ingredient.Stock);
                Assert.Equal(800, ingredient.Price);
                Assert.Equal(2, ingredient.IdSuppliers);
            }
        }

        [Fact]
        public async Task DeleteIngredient_WhenExists_SetsInactive()
        {
            var dbName = "TestDB_DeleteIngredient_Ok";
            var options = new DbContextOptionsBuilder<ForLoveDBContext>()
                .UseInMemoryDatabase(dbName)
                .Options;

            using (var context = new ForLoveDBContext(options))
            {
                context.Ingredients.Add(new Ingredient
                {
                    Id = 10,
                    Name = "Queso",
                    Isactive = true
                });
                await context.SaveChangesAsync();
            }

            using (var context = new ForLoveDBContext(options))
            {
                var controller = new IngredientController(context, null);

                var result = await controller.DeleteIngredient(10);

                var objectResult = Assert.IsType<ObjectResult>(result);
                Assert.Equal(200, objectResult.StatusCode);

                var ingredient = await context.Ingredients.FindAsync(10);
                Assert.False(ingredient.Isactive);
            }
        }



        [Fact]
        public async Task List_NoActiveIngredients()
        {
            var dbName = "TestDB_IngredientList_NotFound";
            var options = new DbContextOptionsBuilder<ForLoveDBContext>()
                .UseInMemoryDatabase(databaseName: dbName)
                .Options;
            using (var context = new ForLoveDBContext(options))
            {
                context.Ingredients.Add(new Ingredient { Id = 3, Name = "Cebolla Vieja", Isactive = false });
                await context.SaveChangesAsync();
            }
            using (var context = new ForLoveDBContext(options))
            {
                var controller = new IngredientController(context,null);
                var result = await controller.List();
                var objectResult = Assert.IsType<ObjectResult>(result);
                Assert.Equal(404, objectResult.StatusCode); // Verifica que sea 404
                // Verificar el mensaje del objeto anónimo { value = "No hay ingredientes..." }
                var data = objectResult.Value;
                var msgProp = data.GetType().GetProperty("value");
                var message = msgProp.GetValue(data, null) as string;
                Assert.Equal("No hay ingredientes registrados", message);
            }
        }

        [Fact]
        public async Task AddIngredient_WithPhoto_ReturnsCreatedAndSavesToDB()
        {
            var dbName = "TestDB_AddIngredient_WithPhoto";
            var options = new DbContextOptionsBuilder<ForLoveDBContext>()
                .UseInMemoryDatabase(databaseName: dbName)
                .Options;

            string tempPath = Path.GetTempPath();
            var mockEnv = new Mock<IWebHostEnvironment>();
            mockEnv.Setup(m => m.WebRootPath).Returns(tempPath);

            // Configurar la Foto (IFormFile)
            var mockFile = new Mock<IFormFile>();
            var fileName = "tomate_fresco.jpg";

            mockFile.Setup(f => f.FileName).Returns(fileName);
            mockFile.Setup(f => f.Length).Returns(1024); // Simular que pesa algo (> 0)

            // Simular que CopyToAsync funciona correctamente (devuelve tarea completada)
            mockFile.Setup(f => f.CopyToAsync(It.IsAny<Stream>(), It.IsAny<CancellationToken>()))
                .Returns(Task.CompletedTask);
            var ingredientDto = new IngredientDTO
            {
                Name = "Tomate",
                Stock = 50,
                Price = 1500,
                IdSuppliers = 1,
                Photo = mockFile.Object
            };

            using (var context = new ForLoveDBContext(options))
            {
                var controller = new IngredientController(context, mockEnv.Object);

                var result = await controller.AddIngredient(ingredientDto);

                var objectResult = Assert.IsType<ObjectResult>(result);
                Assert.Equal(201, objectResult.StatusCode);

                var data = objectResult.Value;
                var isSuccessProp = data.GetType().GetProperty("isSuccess");
                var isSuccess = (bool)isSuccessProp.GetValue(data, null);
                Assert.True(isSuccess);

                var ingredientInDb = await context.Ingredients.FirstOrDefaultAsync(i => i.Name == "Tomate");
                Assert.NotNull(ingredientInDb);
                Assert.Equal(50, ingredientInDb.Stock);
                Assert.Equal(1500, ingredientInDb.Price);
                Assert.StartsWith("/uploads/ingredients/", ingredientInDb.Photo);
                Assert.EndsWith(fileName, ingredientInDb.Photo);

                //Verificar que el UUID se generó (la ruta debe ser larga)
                Assert.True(ingredientInDb.Photo.Length > fileName.Length + 21);
            }
        }
    }
}

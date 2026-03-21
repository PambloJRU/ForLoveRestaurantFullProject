using FourLoveRestaurant.Controllers;
using FourLoveRestaurant.Custom;
using FourLoveRestaurant.Models;
using FourLoveRestaurant.Models.DTOs;
using FourLoveRestaurant.Repository;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http; 
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using System;
using System.Collections.Generic;
using System.IO;                 
using System.Text;
using System.Threading;

namespace PruebasUnitariasBack.TestSupplier
{
    public class SupplierTestFunctions
    {
        [Fact]
        public async Task DeleteSupplierTest()
        {
            var dbName = "TestDB_DeleteSupplier_Success";
            var options = new DbContextOptionsBuilder<ForLoveDBContext>()
                .UseInMemoryDatabase(databaseName: dbName)
                .Options;

            // Insertar un proveedor ACTIVO
            using (var context = new ForLoveDBContext(options))
            {
                context.Suppliers.Add(new Supplier
                {
                    Id = 9,
                    Name = "Coca Cola",
                    Isactive = true 
                });
                await context.SaveChangesAsync();
            }

            using (var context = new ForLoveDBContext(options))
            {
                var mockEnvironment = new Mock<IWebHostEnvironment>();

                var controller = new SupplierController(context, mockEnvironment.Object);


                var result = await controller.DeleteSupplier(9);

                // --- ASSERT (Verificar) ---

                //Verificar la Respuesta HTTP
                var objectResult = Assert.IsType<ObjectResult>(result);
                Assert.Equal(200, objectResult.StatusCode); // Status 200 OK

                // Verificar el objeto anónimo de respuesta (Opcional)
                var data = objectResult.Value;
                var successProp = data.GetType().GetProperty("isSuccess");
                var isSuccess = (bool)successProp.GetValue(data, null);
                Assert.True(isSuccess);

                // Revisar la Base de Datos
                // El proveedor 9 todavia debe existir, pero Isactive debe ser FALSE
                var supplierInDb = await context.Suppliers.FindAsync(9);
                Assert.NotNull(supplierInDb);
                Assert.False(supplierInDb.Isactive, "El proveedor debería tener Isactive = false");
            }
        }

        [Fact]
        public async Task UpdateSupplierTest()
        {
            var dbName = "TestDB_Update_TextOnly";
            var options = new DbContextOptionsBuilder<ForLoveDBContext>()
                .UseInMemoryDatabase(databaseName: dbName)
                .Options;

            var mockEnv = new Mock<IWebHostEnvironment>();
            mockEnv.Setup(e => e.WebRootPath).Returns("Ruta/Ficticia");

            using (var context = new ForLoveDBContext(options))
            {
                context.Suppliers.Add(new Supplier
                {
                    Id = 1,
                    Name = "Nombre Viejo",
                    Email = "viejo@test.com",
                    Isactive = true
                });
                await context.SaveChangesAsync();
            }

            using (var context = new ForLoveDBContext(options))
            {
                var controller = new SupplierController(context, mockEnv.Object);

                var dto = new SupplierDTO
                {
                    Name = "Nombre Nuevo",
                    Email = "nuevo@test.com",
                    Identification = "123",
                    Phone = "5555",
                    Photo = null // Sin foto
                };

                var result = await controller.UpdateSupplier(1, dto);

                // --- ASSERT ---
                var objectResult = Assert.IsType<ObjectResult>(result);
                Assert.Equal(200, objectResult.StatusCode);

                // Verificar en DB
                var supplier = await context.Suppliers.FindAsync(1);
                Assert.Equal("Nombre Nuevo", supplier.Name);
                Assert.Equal("nuevo@test.com", supplier.Email);
            }
        }

        [Fact]
        public async Task GetSupplierById_ReturnsSupplier()
        {
            var dbName = "TestDB_GetSupplierById_Ok";
            var options = new DbContextOptionsBuilder<ForLoveDBContext>()
                .UseInMemoryDatabase(dbName)
                .Options;

            using (var context = new ForLoveDBContext(options))
            {
                context.Suppliers.Add(new Supplier
                {
                    Id = 50,
                    Name = "Proveedor Uno",
                    Isactive = true
                });
                await context.SaveChangesAsync();
            }

            using (var context = new ForLoveDBContext(options))
            {
                var mockEnv = new Mock<IWebHostEnvironment>();
                var controller = new SupplierController(context, mockEnv.Object);

                var result = await controller.GetSupplierById(50);

                var objectResult = Assert.IsType<ObjectResult>(result);
                Assert.Equal(200, objectResult.StatusCode);

                var data = objectResult.Value;
                var valueProp = data.GetType().GetProperty("value");
                var supplier = valueProp.GetValue(data, null) as Supplier;

                Assert.NotNull(supplier);
                Assert.Equal("Proveedor Uno", supplier.Name);
            }
        }

        [Fact]
        public async Task AddSupplier_CreatesSupplierCorrectly()
        {
            var dbName = "TestDB_AddSupplier_Ok";
            var options = new DbContextOptionsBuilder<ForLoveDBContext>()
                .UseInMemoryDatabase(dbName)
                .Options;

            string tempPath = Path.GetTempPath();
            var mockEnv = new Mock<IWebHostEnvironment>();
            mockEnv.Setup(e => e.WebRootPath).Returns(tempPath);

            var mockFile = new Mock<IFormFile>();
            mockFile.Setup(f => f.FileName).Returns("proveedor.jpg");
            mockFile.Setup(f => f.Length).Returns(1000);
            mockFile.Setup(f => f.CopyToAsync(It.IsAny<Stream>(), It.IsAny<CancellationToken>()))
                .Returns(Task.CompletedTask);

            var dto = new SupplierDTO
            {
                Name = "Proveedor Test",
                Email = "prove@test.com",
                Identification = "123",
                Phone = "8888",
                Photo = mockFile.Object
            };

            using (var context = new ForLoveDBContext(options))
            {
                var controller = new SupplierController(context, mockEnv.Object);

                var result = await controller.AddSupplier(dto);

                var objectResult = Assert.IsType<ObjectResult>(result);
                Assert.Equal(201, objectResult.StatusCode);

                var supplier = await context.Suppliers.FirstOrDefaultAsync();
                Assert.NotNull(supplier);
                Assert.Equal("Proveedor Test", supplier.Name);
                Assert.StartsWith("/uploads/suppliers/", supplier.Photo);
            }
        }


    }
}

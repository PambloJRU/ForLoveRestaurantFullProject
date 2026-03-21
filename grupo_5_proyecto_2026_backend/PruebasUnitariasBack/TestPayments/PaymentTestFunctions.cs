using FourLoveRestaurant.Controllers;
using FourLoveRestaurant.Models;
using FourLoveRestaurant.Repository;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Text;

namespace PruebasUnitariasBack.TestPayments
{
    public class PaymentTestFunctions
    {
        [Fact]
        public async Task ListWithActivePayments()
        {
            var dbName = "fourLoveDb";
            var options = new DbContextOptionsBuilder<ForLoveDBContext>()
                .UseInMemoryDatabase(dbName)
                .Options;

            using (var context = new ForLoveDBContext(options))
            {
                context.Payments.Add(new Payment { Id = 1, Number = 1,  IdOrder= 3, Isactive = true });
                context.Payments.Add(new Payment { Id = 2, Number = 2, IdOrder = 6, Isactive = true });
                await context.SaveChangesAsync();
            }

            using (var context = new ForLoveDBContext(options))
            {
                var controller = new PaymentController(context);

                var result = await controller.List();

                var objectResult = Assert.IsType<ObjectResult>(result);
                Assert.Equal(200, objectResult.StatusCode);

                var data = objectResult.Value;
                var listProp = data.GetType().GetProperty("value");
                var list = listProp.GetValue(data, null) as List<Payment>;

                Assert.NotNull(list);
                Assert.Equal(1, list[0].Number);
                
            }
        }

        [Fact]
        public async Task List_NoActivePayments_ReturnsNotFound()
        {
            var dbName = "TestDB_PaymentList_NotFound";
            var options = new DbContextOptionsBuilder<ForLoveDBContext>()
                .UseInMemoryDatabase(databaseName: dbName)
                .Options;

            using (var context = new ForLoveDBContext(options))
            {
                context.Payments.Add(new Payment { Id = 10, Number = 99, Isactive = false });
                await context.SaveChangesAsync();
            }

            using (var context = new ForLoveDBContext(options))
            {
                var controller = new PaymentController(context);
                var result = await controller.List();

                var objectResult = Assert.IsType<ObjectResult>(result);
                Assert.Equal(404, objectResult.StatusCode);

                var data = objectResult.Value;
                var msgProp = data.GetType().GetProperty("value");
                var message = msgProp.GetValue(data, null) as string;
                Assert.Equal("No hay pagos registrados", message); 
            }
        }

        [Fact]
        public async Task Delete_NonExistentPayment()
        {
            var dbName = "TestDB_DeletePayment_NotFound";
            var options = new DbContextOptionsBuilder<ForLoveDBContext>()
                .UseInMemoryDatabase(databaseName: dbName)
                .Options;

            // No agregamos nada (DB vacía)
            using (var context = new ForLoveDBContext(options))
            {
                var controller = new PaymentController(context);

                var result = await controller.Delete(500);

                var objectResult = Assert.IsType<ObjectResult>(result);
                Assert.Equal(404, objectResult.StatusCode);
                var count = await context.Payments.CountAsync();
                Assert.Equal(0, count);
            }
        }



        [Fact]
        public async Task DeleteExistingPayment()
        {
            var dbName = "TestDB_DeletePayment_Success";
            var options = new DbContextOptionsBuilder<ForLoveDBContext>()
                .UseInMemoryDatabase(databaseName: dbName)
                .Options;
            using (var context = new ForLoveDBContext(options))
            {
                context.Payments.Add(new Payment
                {
                    Id = 1,
                    Number = 5,
                    Isactive = true //  Debe estar activa
                });
                await context.SaveChangesAsync();
            }

            using (var context = new ForLoveDBContext(options))
            {
                var controller = new PaymentController(context);

                var result = await controller.Delete(1);

                var objectResult = Assert.IsType<ObjectResult>(result);
                Assert.Equal(200, objectResult.StatusCode);
                var tableInDb = await context.Payments.FindAsync(1);
                Assert.NotNull(tableInDb);
                Assert.False(tableInDb.Isactive, "El pago debería estar marcada como inactiva (IsActive = false)");
            }
        }
    }
}

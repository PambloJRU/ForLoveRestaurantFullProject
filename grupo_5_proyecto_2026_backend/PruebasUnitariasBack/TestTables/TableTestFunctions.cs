using FourLoveRestaurant.Controllers;
using FourLoveRestaurant.Models;
using FourLoveRestaurant.Models.DTOs;
using FourLoveRestaurant.Repository;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace PruebasUnitariasBack.TestTables
{
    public class TableTestFunctions
    {
        [Fact]
        public async Task DeleteTable_ExistingActiveTable()
        {
            var dbName = "TestDB_DeleteTable_Success";
            var options = new DbContextOptionsBuilder<ForLoveDBContext>()
                .UseInMemoryDatabase(databaseName: dbName)
                .Options;
            using (var context = new ForLoveDBContext(options))
            {
                context.Tables.Add(new Table
                {
                    Id = 1,
                    Number = 5,
                    IsActive = true //  Debe estar activa
                });
                await context.SaveChangesAsync();
            }

            using (var context = new ForLoveDBContext(options))
            {
                var controller = new TableController(context);

                var result = await controller.DeleteTable(1);

                var objectResult = Assert.IsType<ObjectResult>(result);
                Assert.Equal(200, objectResult.StatusCode);
                var tableInDb = await context.Tables.FindAsync(1);
                Assert.NotNull(tableInDb);
                Assert.False(tableInDb.IsActive, "La mesa debería estar marcada como inactiva (IsActive = false)");
            }
        }

        [Fact]
        public async Task EditTable_ExistingActiveTable()
        {
            var dbName = "TestDB_EditTable_Success";
            var options = new DbContextOptionsBuilder<ForLoveDBContext>()
                .UseInMemoryDatabase(databaseName: dbName)
                .Options;

            using (var context = new ForLoveDBContext(options))
            {
                context.Tables.Add(new Table
                {
                    Id = 10,
                    Number = 23,
                    Capacity = 4,
                    State = "Disponible",
                    IsActive = true
                });
                await context.SaveChangesAsync();
            }

            using (var context = new ForLoveDBContext(options))
            {
                var controller = new TableController(context);

                var tableDto = new TableDTO
                {
                    Number = 30,
                    Capacity = 2,
                    State = "Ocupada"
                };

                var result = await controller.EditTable(10, tableDto);
                var objectResult = Assert.IsType<ObjectResult>(result);
                Assert.Equal(200, objectResult.StatusCode);
                var tableInDb = await context.Tables.FindAsync(10);
                Assert.NotNull(tableInDb);
                Assert.Equal(30, tableInDb.Number);
                Assert.Equal(2, tableInDb.Capacity);
                Assert.Equal("Ocupada", tableInDb.State);
            }
        }

        [Fact]
        public async Task EditTable_InactiveOrNonExistent_ReturnsNotFound()
        {
            var dbName = "TestDB_EditTable_NotFound";
            var options = new DbContextOptionsBuilder<ForLoveDBContext>()
                .UseInMemoryDatabase(databaseName: dbName)
                .Options;
            using (var context = new ForLoveDBContext(options))
            {
                // Mesa inactiva (no debería ser editable según tu lógica)
                context.Tables.Add(new Table { Id = 5, Number = 5, IsActive = false });
                await context.SaveChangesAsync();
            }
            using (var context = new ForLoveDBContext(options))
            {
                var controller = new TableController(context);
                var tableDto = new TableDTO { Number = 5, Capacity = 1, State = "Libre" };

                // Caso 1: ID que existe pero está IsActive = false
                var resultInactive = await controller.EditTable(5, tableDto);

                // Caso 2: ID que no existe
                var resultNotExists = await controller.EditTable(999, tableDto);

                var response1 = Assert.IsType<ObjectResult>(resultInactive);
                Assert.Equal(404, response1.StatusCode);

                var response2 = Assert.IsType<ObjectResult>(resultNotExists);
                Assert.Equal(404, response2.StatusCode);
            }
        }

        [Fact]
        public async Task List_WithActiveTables_Returns200()
        {
            var dbName = "TestDB_TableList_Ok";
            var options = new DbContextOptionsBuilder<ForLoveDBContext>()
                .UseInMemoryDatabase(dbName)
                .Options;

            using (var context = new ForLoveDBContext(options))
            {
                context.Tables.Add(new Table { Id = 1, Number = 1, Capacity = 4, IsActive = true });
                context.Tables.Add(new Table { Id = 2, Number = 2, Capacity = 6, IsActive = false });
                await context.SaveChangesAsync();
            }

            using (var context = new ForLoveDBContext(options))
            {
                var controller = new TableController(context);

                var result = await controller.List();

                var objectResult = Assert.IsType<ObjectResult>(result);
                Assert.Equal(200, objectResult.StatusCode);

                var data = objectResult.Value;
                var listProp = data.GetType().GetProperty("value");
                var list = listProp.GetValue(data, null) as List<Table>;

                Assert.NotNull(list);
                Assert.Single(list);
                Assert.Equal(1, list[0].Number);
            }
        }

        [Fact]
        public async Task AddTable_CreatesTableCorrectly()
        {
            var dbName = "TestDB_AddTable_Ok";
            var options = new DbContextOptionsBuilder<ForLoveDBContext>()
                .UseInMemoryDatabase(dbName)
                .Options;

            using (var context = new ForLoveDBContext(options))
            {
                var controller = new TableController(context);

                var dto = new TableDTO
                {
                    Number = 10,
                    Capacity = 4,
                    State = "Disponible"
                };

                var result = await controller.AddTable(dto);

                var objectResult = Assert.IsType<ObjectResult>(result);
                Assert.Equal(201, objectResult.StatusCode);

                var table = await context.Tables.FirstOrDefaultAsync(t => t.Number == 10);

                Assert.NotNull(table);
                Assert.Equal(4, table.Capacity);
                Assert.True(table.IsActive);
            }
        }


    }
}
    


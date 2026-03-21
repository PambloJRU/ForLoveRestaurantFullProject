using FourLoveRestaurant.Custom;
using FourLoveRestaurant.Models;
using FourLoveRestaurant.Models.DTOs;
using FourLoveRestaurant.Repository;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FourLoveRestaurant.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TableController : ControllerBase
    {
        private readonly ForLoveDBContext _forLoveDBContext;

        public TableController(ForLoveDBContext forLoveDBContext)
        {
            _forLoveDBContext = forLoveDBContext;

        }

        [HttpGet]
        [HasPermission("Ver Mesas")]
        [Route("List")]
        public async Task<IActionResult> List()
        {

            var TableList = _forLoveDBContext.Tables.Where(i => i.IsActive == true).ToList();


            if (!TableList.Any())
            {

                return StatusCode(StatusCodes.Status404NotFound, new { value = "No hay Mesas registrados" });
            }

            return StatusCode(StatusCodes.Status200OK, new { value = TableList });

        }

        [HttpPost]
        [HasPermission("Crear Mesas")]
        [Route("Add")]
        public async Task<IActionResult> AddTable([FromForm] TableDTO tableDTO)
        {
            var tableModel = new Table
            {

                Number = tableDTO.Number,
                Capacity = tableDTO.Capacity,
                IsActive = true,
                State = tableDTO.State,

            };

            await _forLoveDBContext.Tables.AddAsync(tableModel);
            await _forLoveDBContext.SaveChangesAsync();

            if (tableModel.Id != 0)
            {
                return StatusCode(StatusCodes.Status201Created, new
                {
                    isSuccess = true,
                    value = "La nueva mesa ha sido exitosamente registrado"
                });
            }
            else
            {
                return StatusCode(StatusCodes.Status200OK, new
                {
                    isSuccess = false,
                    value = "Ha ocurrido un error al registrar una nueva mesa"
                });
            }
        }

        [HttpPut]
        [HasPermission("Editar Mesas")]
        [Route("Edit/{id}")]
        public async Task<IActionResult> EditTable(int id, [FromForm] TableDTO tableDTO)
        {
            var table = await _forLoveDBContext.Tables.FirstOrDefaultAsync(s => s.Id == id && s.IsActive == true);
            if (table == null)
            {
                return StatusCode(StatusCodes.Status404NotFound, new
                {
                    isSuccess = false,
                    value = "Mesa no encontrada"
                });
            }
            table.Number = tableDTO.Number;
            table.Capacity = tableDTO.Capacity;
            table.State = tableDTO.State;
            _forLoveDBContext.Tables.Update(table);
            await _forLoveDBContext.SaveChangesAsync();
            return StatusCode(StatusCodes.Status200OK, new
            {
                isSuccess = true,
                value = "La mesa ha sido editada exitosamente"
            });
        }



        [HttpDelete]
        [HasPermission("Eliminar Mesas")]
        [Route("Delete/{id}")]
        public async Task<IActionResult> DeleteTable(int id)
        {
            var table = await _forLoveDBContext.Tables.FirstOrDefaultAsync(s => s.Id == id && s.IsActive == true);
            if (table == null)
            {
                return StatusCode(StatusCodes.Status404NotFound, new
                {
                    isSuccess = false,
                    value = "Mesa no encontrada"
                });
            }
            table.IsActive = false;
            _forLoveDBContext.Tables.Update(table);
            await _forLoveDBContext.SaveChangesAsync();
            return StatusCode(StatusCodes.Status200OK, new
            {
                isSuccess = true,
                value = "La mesa ha sido eliminada exitosamente"
            });
        }
    }
}

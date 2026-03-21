using FourLoveRestaurant.Custom;
using FourLoveRestaurant.Models;
using FourLoveRestaurant.Models.DTOs;
using FourLoveRestaurant.Repository;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FourLoveRestaurant.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly ForLoveDBContext _forLoveDBContext;

        public OrderController(ForLoveDBContext forLoveDBcontext)
        {
            _forLoveDBContext = forLoveDBcontext;

        }

        [HttpGet]
        [HasPermission("Ver Ordenes")]
        [Route("List")]
        public async Task<IActionResult> GetAllActiveOrders()
        {
            var orders = _forLoveDBContext.Orders
                .Where(m => m.Isactive == true)
                .ToList();

            if (!orders.Any())
            {

                return StatusCode(StatusCodes.Status404NotFound, new { value = "No hay ordenes en este momento" });
            }

            return Ok(new { isSuccess = true, value = orders });
        }

        [HttpPost]
        [HasPermission("Crear Orden")]
        [Route("Add")]
        public async Task<IActionResult> AddOrder([FromForm] OrderDTO orderDto)
        {
            var orderModel = new Order
            {

                Number = orderDto.Number,
                Date = orderDto.Date,
                Isactive = true,
                IdTable = orderDto.IdTable

            };

            await _forLoveDBContext.Orders.AddAsync(orderModel);
            await _forLoveDBContext.SaveChangesAsync();

            if (orderModel.Id != 0)
            {
                return StatusCode(StatusCodes.Status201Created, new
                {
                    isSuccess = true,
                    value = "La orden ha sido exitosamente agregada"
                });
            }
            else
            {
                return StatusCode(StatusCodes.Status200OK, new
                {
                    isSuccess = false,
                    value = "Ha ocurrido un error al registrar una nueva orden"
                });
            }
        }

        [HttpDelete]
        [HasPermission("Eliminar Orden")]
        [Route("Delete/{id}")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var order = _forLoveDBContext.Orders.FirstOrDefault(o => o.Id == id);
            if (order == null)
            {
                return StatusCode(StatusCodes.Status404NotFound, new { value = "Orden no encontrada" });
            }
            order.Isactive = false;
            _forLoveDBContext.Orders.Update(order);
            await _forLoveDBContext.SaveChangesAsync();
            return Ok(new { isSuccess = true, value = "Orden eliminada exitosamente" });
        }

        [HttpPut]
        [HasPermission("Editar Orden")]
        [Route("Update/{id}")]
        public async Task<IActionResult> UpdateOrder(int id, [FromForm] OrderDTO orderDto)
        {
            var order = _forLoveDBContext.Orders.FirstOrDefault(o => o.Id == id);
            if (order == null)
            {
                return StatusCode(StatusCodes.Status404NotFound, new { value = "Orden no encontrada" });
            }
            order.Number = orderDto.Number;
            order.Date = orderDto.Date;
            order.IdTable = orderDto.IdTable;
            _forLoveDBContext.Orders.Update(order);
            await _forLoveDBContext.SaveChangesAsync();
            return Ok(new { isSuccess = true, value = "Orden actualizada exitosamente" });
        }

    }


}

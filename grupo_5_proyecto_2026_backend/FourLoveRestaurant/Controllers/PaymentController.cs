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
    public class PaymentController : ControllerBase
    {
        private readonly ForLoveDBContext _forLoveDBContext;

        public PaymentController(ForLoveDBContext forLoveDBContext)
        {
            _forLoveDBContext = forLoveDBContext;
        }

        [HttpGet]
        [HasPermission("Ver Pagos")]
        [Route("List")]
        public async Task<IActionResult> List()
        {
            var paymentList = _forLoveDBContext.Payments
                .Where(p => p.Isactive == true)
                .ToList();

            if (!paymentList.Any())
            {
                return StatusCode(StatusCodes.Status404NotFound, new { value = "No hay pagos registrados" });
            }

            return StatusCode(StatusCodes.Status200OK, new { value = paymentList });
        }

        [HttpPost]
        [HasPermission("Crear Pagos")]
        [Route("Add")]
        public async Task<IActionResult> AddPayment([FromForm] PaymentDTO paymentDTO)
        {
            var paymentModel = new Payment
            {
                Number = paymentDTO.Number,
                Date = paymentDTO.Date ?? DateOnly.FromDateTime(DateTime.Now),
                Amount = paymentDTO.Amount ?? 0,
                Isactive = paymentDTO.IsActive ?? true,
                IdOrder = paymentDTO.IdOrder
            };

            await _forLoveDBContext.Payments.AddAsync(paymentModel);
            await _forLoveDBContext.SaveChangesAsync();

            if (paymentModel.Id != 0)
            {
                var order = await _forLoveDBContext.Orders
                    .FirstOrDefaultAsync(o => o.Id == paymentModel.IdOrder);

                if (order != null && order.Isactive != false)
                {
                    order.Isactive = false;
                    _forLoveDBContext.Orders.Update(order);
                    await _forLoveDBContext.SaveChangesAsync();
                }

                return StatusCode(StatusCodes.Status201Created, new
                {
                    isSuccess = true,
                    value = "El nuevo pago ha sido registrado exitosamente"
                });
            }
            else
            {
                return StatusCode(StatusCodes.Status200OK, new
                {
                    isSuccess = false,
                    value = "Ha ocurrido un error al registrar el pago"
                });
            }
        }

        [HttpDelete]
        [HasPermission("Eliminar Pagos")]
        [Route("Delete/{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var payment = await _forLoveDBContext.Payments
                .FirstOrDefaultAsync(p => p.Id == id);

            if (payment == null)
            {
                return StatusCode(StatusCodes.Status404NotFound, new
                {
                    isSuccess = false,
                    value = "No se encontró el pago"
                });
            }

            
            if (payment.Isactive == false)
            {
                return StatusCode(StatusCodes.Status200OK, new
                {
                    isSuccess = true,
                    value = "El pago ya estaba eliminado"
                });
            }

            payment.Isactive = false;
            _forLoveDBContext.Payments.Update(payment);
            await _forLoveDBContext.SaveChangesAsync();

            return StatusCode(StatusCodes.Status200OK, new
            {
                isSuccess = true,
                value = "Pago eliminado exitosamente"
            });
        }

    }
}

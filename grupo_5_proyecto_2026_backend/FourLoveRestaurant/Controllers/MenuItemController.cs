using FourLoveRestaurant.Custom;
using FourLoveRestaurant.Models;
using FourLoveRestaurant.Models.DTOs;
using FourLoveRestaurant.Repository;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FourLoveRestaurant.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MenuItemController : ControllerBase
    {
        private readonly ForLoveDBContext _forLoveDbContext;
        private readonly IWebHostEnvironment _webHostEnvironment;

        public MenuItemController(ForLoveDBContext _forLoveDBContext, IWebHostEnvironment webHostEnvironment)
        {
            _forLoveDbContext = _forLoveDBContext;
            _webHostEnvironment = webHostEnvironment;
        }


        [HttpGet]
        [HasPermission("Ver Platillos")]
        [Route("List")]
        public async Task<IActionResult> GetAllDishes()
        {
            var menuitems = _forLoveDbContext.Menuitems
                .Where(m => m.Isactive == true)
                .ToList();

            if (!menuitems.Any())
            {

                return StatusCode(StatusCodes.Status404NotFound, new { value = "No hay platillos registrados" });
            }

            return Ok(new { isSuccess = true, value = menuitems });
        }


        [HttpPost]
        [HasPermission("Crear Platillos")]
        [Route("Add")]
        public async Task<IActionResult> CreateDish([FromForm] MenuItemDTO request)
        {

            string photoPathInDb = "";
            if (request.Photo != null && request.Photo.Length > 0)
            {
                string uploadsFolder = Path.Combine(_webHostEnvironment.WebRootPath, "uploads", "dishes");
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }
                string uniqueFileName = Guid.NewGuid().ToString() + "_" + request.Photo.FileName;
                string filePath = Path.Combine(uploadsFolder, uniqueFileName);
                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await request.Photo.CopyToAsync(fileStream);
                }
                photoPathInDb = $"/uploads/dishes/{uniqueFileName}";
            }
            // 1. Crear la entidad
            var newDish = new Menuitem
            {
                Name = request.Name,
                Description = request.Description,
                Price = request.Price,
                Photo = photoPathInDb,
                Isactive = true
            };

            await _forLoveDbContext.Menuitems.AddAsync(newDish);
            await _forLoveDbContext.SaveChangesAsync();

            if (newDish.Id != 0)
            {
                return StatusCode(StatusCodes.Status201Created, new
                {
                    isSuccess = true,
                    value = "El platillo nuevo ha sido exitosamente registrado"
                });
            }
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                isSuccess = false,
                value = "Ha ocurrido un error al registrar el platillo nuevo"
            });

        }





        [HttpGet("GetById/{id}")]
        [HasPermission("Editar platillo")]
        public async Task<IActionResult> GetDishById(int id)
        {
            var menuitem = await _forLoveDbContext.Menuitems
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.Id == id && m.Isactive == true);

            if (menuitem == null)
            {
                return NotFound(new
                {
                    isSuccess = false,
                    value = "Platillo no encontrado"
                });
            }

            return Ok(new
            {
                isSuccess = true,
                value = menuitem
            });
        }





        [HttpPut]
        [HasPermission("Editar platillo")]
        [Route("Edit/{id}")]
        public async Task<IActionResult> EditDish(int id, [FromForm] MenuItemDTO request)
        {
            var dish = await _forLoveDbContext.Menuitems.FindAsync(id);
            if (dish == null || dish.Isactive == false)
            {
                return StatusCode(StatusCodes.Status404NotFound, new { value = "Platillo no encontrado" });
            }
            string photoPathInDb = dish.Photo;
            if (request.Photo != null && request.Photo.Length > 0)
            {
                string uploadsFolder = Path.Combine(_webHostEnvironment.WebRootPath, "uploads", "dishes");
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }
                string uniqueFileName = Guid.NewGuid().ToString() + "_" + request.Photo.FileName;
                string filePath = Path.Combine(uploadsFolder, uniqueFileName);
                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await request.Photo.CopyToAsync(fileStream);
                }
                photoPathInDb = $"/uploads/dishes/{uniqueFileName}";
            }
            dish.Name = request.Name;
            dish.Description = request.Description;
            dish.Price = request.Price;
            dish.Photo = photoPathInDb;
            _forLoveDbContext.Menuitems.Update(dish);
            await _forLoveDbContext.SaveChangesAsync();
            return StatusCode(StatusCodes.Status200OK, new { value = "Platillo editado exitosamente" });
        }

        [HttpDelete]
        [HasPermission("Eliminar platillo")]
        [Route("Delete/{id}")]
        public async Task<IActionResult> DeleteDish(int id)
        {
            var dish = await _forLoveDbContext.Menuitems.FindAsync(id);
            if (dish == null || dish.Isactive == false)
            {
                return StatusCode(StatusCodes.Status404NotFound, new { value = "Platillo no encontrado" });
            }
            dish.Isactive = false;
            _forLoveDbContext.Menuitems.Update(dish);
            await _forLoveDbContext.SaveChangesAsync();
            return StatusCode(StatusCodes.Status200OK, new { value = "Platillo eliminado exitosamente" });
        }
    }
}

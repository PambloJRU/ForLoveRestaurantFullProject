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
    public class IngredientController : ControllerBase
    {
        private readonly ForLoveDBContext _forLoveDBContext;
        private readonly IWebHostEnvironment _webHostEnvironment;
        public IngredientController(ForLoveDBContext forLoveDBContext, IWebHostEnvironment webHostEnvironment)
        {
            _forLoveDBContext = forLoveDBContext;
            _webHostEnvironment = webHostEnvironment;
        }

        [HttpGet]
        [HasPermission("Ver Ingredientes")]
        [Route("List")]
        public async Task<IActionResult> List()
        {

            var IngredientsList = _forLoveDBContext.Ingredients.Where(i => i.Isactive == true).ToList();


            if (!IngredientsList.Any())
            {

                return StatusCode(StatusCodes.Status404NotFound, new { value = "No hay ingredientes registrados" });
            }

            return StatusCode(StatusCodes.Status200OK, new { value = IngredientsList });

        }

        [HttpPost]
        [HasPermission("Crear Ingredientes")]
        [Route("Add")]

        public async Task<IActionResult> AddIngredient([FromForm] IngredientDTO ingredientDTO)
        {
            string photoPathInDb = "";
            if (ingredientDTO.Photo != null && ingredientDTO.Photo.Length > 0)
            {
                string uploadsFolder = Path.Combine(_webHostEnvironment.WebRootPath, "uploads", "ingredients");
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }
                string uniqueFileName = Guid.NewGuid().ToString() + "_" + ingredientDTO.Photo.FileName;
                string filePath = Path.Combine(uploadsFolder, uniqueFileName);
                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await ingredientDTO.Photo.CopyToAsync(fileStream);
                }
                photoPathInDb = $"/uploads/ingredients/{uniqueFileName}";
            }
            var ingredientModel = new Ingredient
            {
                Name = ingredientDTO.Name,
                Stock = ingredientDTO.Stock,
                Price = ingredientDTO.Price,
                IdSuppliers = ingredientDTO.IdSuppliers,
                Photo = photoPathInDb,
                Isactive = true
            };
            await _forLoveDBContext.Ingredients.AddAsync(ingredientModel);
            await _forLoveDBContext.SaveChangesAsync();
            if (ingredientModel.Id != 0)
            {
                return StatusCode(StatusCodes.Status201Created, new
                {
                    isSuccess = true,
                    value = "El ingrediente nuevo ha sido exitosamente registrado"
                });
            }
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                isSuccess = false,
                value = "Ha ocurrido un error al registrar el ingrediente nuevo"
            });
        }

        [HttpDelete]
        [HasPermission("Eliminar Ingredientes")]
        [Route("Delete/{id}")]
        public async Task<IActionResult> DeleteIngredient(int id)
        {
            Ingredient? i = await _forLoveDBContext.Ingredients.FindAsync(id);

            if (i == null)
            {
                return StatusCode(StatusCodes.Status404NotFound
                    , new
                    {
                        isSuccess = false,
                        value = "Ingrediente no encontrado"
                    });
            }

            i.Isactive = false;

            await _forLoveDBContext.SaveChangesAsync();

            return StatusCode(StatusCodes.Status200OK, new
            {
                isSuccess = true,
                value = "El ingrediente ha sido eliminado exitosamente"

            });
        }

        [HttpPut]
        [HasPermission("Editar Ingredientes")]
        [Route("Edit/{id}")]
        public async Task<IActionResult> EditIngredient(int id, [FromForm] IngredientDTO ingredientDTO)
        {
            Ingredient? ingredientToEdit = await _forLoveDBContext.Ingredients.FindAsync(id);

            if (ingredientToEdit == null)
            {
                return NotFound(new
                {
                    isSuccess = false,
                    value = "Ingrediente no encontrado"
                });
            }

            ingredientToEdit.Stock = ingredientDTO.Stock;
            ingredientToEdit.Price = ingredientDTO.Price;
            ingredientToEdit.Name = ingredientDTO.Name;
            ingredientToEdit.IdSuppliers = ingredientDTO.IdSuppliers;

            if (ingredientDTO.Photo != null && ingredientDTO.Photo.Length > 0)
            {
                string uploadsFolder = Path.Combine(_webHostEnvironment.WebRootPath, "uploads", "ingredients");

                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                string? oldPhotoPath = ingredientToEdit.Photo;

                string uniqueFileName = Guid.NewGuid().ToString() + "_" + ingredientDTO.Photo.FileName;
                string newFilePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var fileStream = new FileStream(newFilePath, FileMode.Create))
                {
                    await ingredientDTO.Photo.CopyToAsync(fileStream);
                }

                ingredientToEdit.Photo = $"/uploads/ingredients/{uniqueFileName}";

                if (!string.IsNullOrEmpty(oldPhotoPath))
                {
                    bool isUsedByOthers = await _forLoveDBContext.Ingredients
                        .AnyAsync(i => i.Photo == oldPhotoPath && i.Id != id);

                    if (!isUsedByOthers)
                    {
                        string oldFilePath = Path.Combine(
                            _webHostEnvironment.WebRootPath,
                            oldPhotoPath.TrimStart('/')
                        );

                        if (System.IO.File.Exists(oldFilePath))
                        {
                            System.IO.File.Delete(oldFilePath);
                        }
                    }
                }
            }

            await _forLoveDBContext.SaveChangesAsync();

            return StatusCode(StatusCodes.Status200OK, new
            {
                isSuccess = true,
                value = "El ingrediente ha sido editado exitosamente"
            });
        }



        [HttpGet]
        [HasPermission("Editar Ingredientes")]
        [Route("GetById/{id}")]
        public async Task<IActionResult> GetIngredientById(int id)
        {
            Ingredient? ingredient = await _forLoveDBContext.Ingredients
                .Where(i => i.Id == id && i.Isactive == true)
                .FirstOrDefaultAsync();

            if (ingredient == null)
            {
                return StatusCode(StatusCodes.Status404NotFound, new
                {
                    isSuccess = false,
                    value = "Ingrediente no encontrado"
                });
            }

            return StatusCode(StatusCodes.Status200OK, new
            {
                isSuccess = true,
                value = ingredient
            });
        }
    }
}

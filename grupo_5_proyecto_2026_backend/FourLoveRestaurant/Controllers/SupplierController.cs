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
    public class SupplierController : ControllerBase
    {
        private readonly ForLoveDBContext _forLoveDBContext;
        private readonly IWebHostEnvironment _webHostEnvironment;

        public SupplierController(ForLoveDBContext forLoveDBContext, IWebHostEnvironment webHostEnvironment)
        {
            _forLoveDBContext = forLoveDBContext;
            _webHostEnvironment = webHostEnvironment;

        }

        [HttpGet]
        [Route("List")]
        [HasPermission("Ver Proveedores")]
        public async Task<IActionResult> SupplierList()
        {
            var supplierList = await _forLoveDBContext.Suppliers.Where(e => e.Isactive == true).ToListAsync();

            if (supplierList == null)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { value = false });
            }
            else
            {
                return StatusCode(StatusCodes.Status200OK, new { value = supplierList });
            }

        }

        [HttpPost]
        [HasPermission("Crear Proveedores")]
        [Route("Add")]
        public async Task<IActionResult> AddSupplier([FromForm] SupplierDTO supplierDTO)
        {

            bool noRepeatedExist = await _forLoveDBContext.Suppliers.Where(e => e.Isactive == true)
           .AnyAsync(s => s.Phone == supplierDTO.Phone || s.Email == supplierDTO.Email);

            if (noRepeatedExist)
            {
                return BadRequest(new
                {
                    isSuccess = false,
                    value = "Telefono o email registrados anteriormente"
                });
            }

            string photoPathInDb = ""; // Valor por defecto o null si prefieres

            // LOGICA PARA GUARDAR LA IMAGEN
            if (supplierDTO.Photo != null && supplierDTO.Photo.Length > 0)
            {
                //Definir dónde se guardará (ej: wwwroot/uploads/suppliers)
                string uploadsFolder = Path.Combine(_webHostEnvironment.WebRootPath, "uploads", "suppliers");

                // wachamos qe la carpeta exista
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                //  nombre único 
                string uniqueFileName = Guid.NewGuid().ToString() + "_" + supplierDTO.Photo.FileName;

                // Ruta completa física en el servidor
                string filePath = Path.Combine(uploadsFolder, uniqueFileName);

                // Guardar el archivo físicamente
                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await supplierDTO.Photo.CopyToAsync(fileStream);
                }

                // Definir la ruta relativa (string) que se guardará en la BD
                // Esto permite acceder a la imagen como: https://momazos.com/uploads/suppliers/foto.jpg
                photoPathInDb = $"/uploads/suppliers/{uniqueFileName}";

            }

            var supplierModel = new Supplier
            {
                Email = supplierDTO.Email,
                Identification = supplierDTO.Identification,
                Name = supplierDTO.Name,
                Phone = supplierDTO.Phone,
                Isactive = true,
                Photo = photoPathInDb,
            };

            await _forLoveDBContext.AddAsync(supplierModel);
            await _forLoveDBContext.SaveChangesAsync();

            if (supplierModel.Id != 0)
            {
                return StatusCode(StatusCodes.Status201Created, new
                {
                    isSuccess = true,
                    value = "El proveedor nuevo ha sido exitosamente registrado"
                });
            }
            else
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    isSuccess = false,
                    value = "Ha ocurrido un error al registrar un nuevo proveedor"
                });
            }
        }

        [HttpDelete]
        [HasPermission("Eliminar Proveedores")]
        [Route("Delete/{id}")]
        public async Task<IActionResult> DeleteSupplier(int id)
        {
            var supplier = await _forLoveDBContext.Suppliers.FirstOrDefaultAsync(s => s.Id == id && s.Isactive == true);
            if (supplier == null)
            {
                return StatusCode(StatusCodes.Status404NotFound, new
                {
                    isSuccess = false,
                    value = "Proveedor no encontrado"
                });
            }
            supplier.Isactive = false;
            _forLoveDBContext.Suppliers.Update(supplier);
            await _forLoveDBContext.SaveChangesAsync();
            return StatusCode(StatusCodes.Status200OK, new
            {
                isSuccess = true,
                value = "El proveedor ha sido eliminado exitosamente"
            });
        }

        [HttpPut]
        [HasPermission("Editar Proveedores")]
        [Route("Update/{id}")]
        public async Task<IActionResult> UpdateSupplier(int id, [FromForm] SupplierDTO supplierDTO)
        {
            var supplier = await _forLoveDBContext.Suppliers.FirstOrDefaultAsync(s => s.Id == id && s.Isactive == true);
            if (supplier == null)
            {
                return StatusCode(StatusCodes.Status404NotFound, new
                {
                    isSuccess = false,
                    value = "Proveedor no encontrado"
                });
            }
            // Actualizar los campos
            supplier.Name = supplierDTO.Name;
            supplier.Email = supplierDTO.Email;
            supplier.Identification = supplierDTO.Identification;
            supplier.Phone = supplierDTO.Phone;
            // Lógica para actualizar la foto si se proporciona una nueva
            if (supplierDTO.Photo != null && supplierDTO.Photo.Length > 0)
            {
                string uploadsFolder = Path.Combine(_webHostEnvironment.WebRootPath, "uploads", "suppliers");
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }
                string? oldPhotoPath = supplier.Photo;
                string uniqueFileName = Guid.NewGuid().ToString() + "_" + supplierDTO.Photo.FileName;
                string filePath = Path.Combine(uploadsFolder, uniqueFileName);
                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await supplierDTO.Photo.CopyToAsync(fileStream);
                }

                supplier.Photo = $"/uploads/suppliers/{uniqueFileName}";

                if (!string.IsNullOrEmpty(oldPhotoPath))
                {
                    bool isUsedByOthers = await _forLoveDBContext.Suppliers
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

            //_forLoveDBContext.Suppliers.Update(supplier);
            await _forLoveDBContext.SaveChangesAsync();
            return StatusCode(StatusCodes.Status200OK, new
            {
                isSuccess = true,
                value = "El proveedor ha sido actualizado exitosamente"
            });
        }

        [HttpGet]
        [HasPermission("Editar Proveedor")]
        [Route("GetById/{id}")]
        public async Task<IActionResult> GetSupplierById(int id)
        {
            Supplier? supplier = await _forLoveDBContext.Suppliers
                .Where(i => i.Id == id && i.Isactive == true)
                .FirstOrDefaultAsync();

            if (supplier == null)
            {
                return StatusCode(StatusCodes.Status404NotFound, new
                {
                    isSuccess = false,
                    value = "Proveedor no encontrado"
                });
            }

            return StatusCode(StatusCodes.Status200OK, new
            {
                isSuccess = true,
                value = supplier
            });
        }
    }
}




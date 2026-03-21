using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FourLoveRestaurant.Custom;
using FourLoveRestaurant.Models;
using FourLoveRestaurant.Models.DTOs;
using Microsoft.AspNetCore.Authorization;
using FourLoveRestaurant.Repository;

namespace FourLoveRestaurant.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {

        private readonly ForLoveDBContext _forLoveDBContext;
        private readonly Utilities _utilities;

        public UserController(ForLoveDBContext forLoveDBContext , Utilities utilities)
        {
            _forLoveDBContext = forLoveDBContext;
            _utilities = utilities;

        }

        [HttpGet]
        [Route("List")]
        [HasPermission("Ver Usuarios")]
        public async Task<IActionResult> UserList()
        {
            var userList = await _forLoveDBContext.Users.Where(e => e.IsActve == true).ToListAsync();

            return StatusCode(StatusCodes.Status200OK, new { value = userList });

        }

        [HttpPut]
        [Route("Edit/{id}")]
        [HasPermission("Editar Usuarios")]
        public async Task<IActionResult> EditUser(int id, UserDTO userDto)
        {
            User? userEdit = await _forLoveDBContext.Users.FindAsync(id);

            if (userEdit == null) return NotFound(new { isSuccess = false, value = "Empleado no encontrado" });

            //employeeToEdit.Identification = employeDto.Identification; (duda sobre si de edita la cedula o no)
            userEdit.Name = userDto.Name;
            if(!userEdit.Password.Equals(""))
            {
                userEdit.Password = _utilities.encryptSHA256(userDto.Password);
            }
            userEdit.IdEmploye = userDto.IdEmploye;
            userEdit.IdRol = userDto.IdRol;


            await _forLoveDBContext.SaveChangesAsync();

            return StatusCode(StatusCodes.Status200OK, new
            {
                isSuccess = true,
                value = "El usuario ha sido actualizado exitosamente"
            });



        }

        [HttpPut]
        [Route("Delete/{id}")]
        [HasPermission("Eliminar Usuarios")]

        public async Task<IActionResult> DeleteUser(int id) { 

            User? e = await _forLoveDBContext.Users.FindAsync(id);

            if (e == null)
            {
                return StatusCode(StatusCodes.Status404NotFound, new
                {
                    isSuccess = false,
                    value = "Empleado no encontrado"
                });
            }
            e.IsActve = false;

            await _forLoveDBContext.SaveChangesAsync();
            return StatusCode(StatusCodes.Status200OK, new
            {
                isSuccess = true,
                value = "El usuario ha sido eliminado exitosamente"
            });

        }
        
    }
}

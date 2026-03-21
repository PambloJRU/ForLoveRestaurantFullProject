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
    [AllowAnonymous]
    public class AccessController : ControllerBase
    {
        private readonly ForLoveDBContext _forLoveDBContext;
        private readonly Utilities _utilities;

        public AccessController(ForLoveDBContext forLoveDBContext , Utilities utilities)
        {
            _forLoveDBContext = forLoveDBContext;
            _utilities = utilities;
        }

        [HttpPost]
        [Route("Register")]
        public async Task<IActionResult> Register(UserDTO userDto) {

            var modelUser = new User
            {
                Name = userDto.Name,
                Password = _utilities.encryptSHA256(userDto.Password),
                IdEmploye = userDto.IdEmploye,
                IdRol = userDto.IdRol,

            };

            // REGISTRA A LA BASE DE DATOS.
            await _forLoveDBContext.Users.AddAsync(modelUser);
            await _forLoveDBContext.SaveChangesAsync();

            if(modelUser.Id != 0)
            {
                return StatusCode(StatusCodes.Status200OK,new { isSuccess = true });
            }
            else
            {
                return StatusCode(StatusCodes.Status200OK, new { isSuccess = false });
            }
            
        }

        [HttpPost]
        [Route("Login")]
        public async Task<ActionResult> Login(UserDTO userDto)
        {
            var userIsFind = await _forLoveDBContext.Users
                .Where(u =>
                u.Name == userDto.Name &&
                u.Password == _utilities.encryptSHA256(userDto.Password)
                && u.IsActve == true)
                .Include(u=> u.IdRolNavigation) //Se agrega el rol en el tokensillo para ver cual es
                .FirstOrDefaultAsync();

            if(userIsFind == null)
            {
                return StatusCode(StatusCodes.Status204NoContent,new {isSuccess = false, token ="" });
            }
            else
            {
                return StatusCode(StatusCodes.Status200OK, new { isSuccess = true, token = _utilities.generateJWT(userIsFind) });
            }
        }


    }
}

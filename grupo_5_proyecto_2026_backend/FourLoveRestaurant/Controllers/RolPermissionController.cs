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
    public class RolPermissionController : ControllerBase
    {

        private readonly ForLoveDBContext _forLoveDBContext;


        public RolPermissionController(ForLoveDBContext forLoveDBContext)
        {
            _forLoveDBContext = forLoveDBContext;

        }

        [HttpGet]
        [Route("GetPermissionsForRole")]
        [HasPermission("Ver Roles")]
        public async Task<IActionResult> GetPermissionsForRoles()
        {
            try
            {
                //  c consulta los roles e incluimos sus permisos
                var rolesWithPermissions = await _forLoveDBContext.Rols
                    .Include(r => r.IdPermissions)
                    .Select(r => new RolePermissionsResponseDTO
                    {
                        RoleId = r.Id,
                        RoleName = r.Name,
                        //  solo los nombres de los permisos
                        Permissions = r.IdPermissions.Select(p => p.Name).ToList()
                    })
                    .ToListAsync();


                if (rolesWithPermissions == null || !rolesWithPermissions.Any())
                {
                    return Ok(new { isSuccess = true, value = new List<RolePermissionsResponseDTO>() });
                }

                return Ok(new { isSuccess = true, value = rolesWithPermissions });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { isSuccess = false, value = "Error al obtener la lista: " + ex.Message });
            }
        }



        [HttpPost]
        [Route("UpdatePermissions")]
        [HasPermission("Modificar Roles")] 
        public async Task<IActionResult> UpdateRolePermissions(RolePermissionsDTO request)
        {

            Console.WriteLine($"Actualizando Rol: {request.RoleId}. Permisos recibidos: {request.PermissionsIds?.Count ?? 0}");
            // Buscamos el Rol Y cargamos sus permisos actuales 
            var role = await _forLoveDBContext.Rols
                .Include(r => r.IdPermissions)
                .FirstOrDefaultAsync(r => r.Id == request.RoleId);

            if (role == null)
            {
                return NotFound(new { isSuccess = false, value = "El rol no existe" });
            }

            
            // los DELETE en la tabla Rol_Permission
             role.IdPermissions.Clear();

            // c busca los nuevos permisos en la base de datos basándonos en la lista de IDs que llegaron
            var permissionsToAdd = await _forLoveDBContext.Permissions
                .Where(p => request.PermissionsIds.Contains(p.Id))
                .ToListAsync();

            //c Agrega a los permisos encontrados a la colección del Rol
            foreach (var permission in permissionsToAdd)
            {
                role.IdPermissions.Add(permission);
            }


            // EF Core comparrraa el estado anterior con el nuevo y hará los INSERT en la tabla intermedia
            try
            {
                await _forLoveDBContext.SaveChangesAsync();
                return Ok(new { isSuccess = true, value = "Permisos actualizados correctamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { isSuccess = false, value = "Error al guardar: " + ex.Message });
            }

        }

        [HttpGet]
        [Route("GetAllPermissions")]
        [HasPermission("Ver Roles")] 
        public async Task<IActionResult> GetAllPermissions()
        {
            var allPermissions = await _forLoveDBContext.Permissions
                .Select(p => new {
                    p.Id,
                    p.Name,
                    p.Description
                })
                .ToListAsync();

            return Ok(new { isSuccess = true, value = allPermissions });
        }
    }
}

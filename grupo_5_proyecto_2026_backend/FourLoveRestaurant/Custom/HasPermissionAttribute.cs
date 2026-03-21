using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FourLoveRestaurant.Custom
{
    public class HasPermissionAttribute : AuthorizeAttribute
    {
        //Si alguien lee esto, esta clase lo unico que hace es
        //en vez de tener escribir en cada controlador
        //[Authorize(Policy = "Ver Empleados")]
        //public IActionResult Get() { ... }
        //se escriba nada mas: 
        //[HasPermission("Ver Empleados")]
        //public IActionResult Get() { ... }

        public HasPermissionAttribute(string permission) : base(permission)
        {
            // Usamos el nombre del permiso como el nombre de la "Política"
        }
    }
}

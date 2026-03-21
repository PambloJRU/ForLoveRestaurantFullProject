using FourLoveRestaurant.Custom;
using FourLoveRestaurant.Models;
using FourLoveRestaurant.Models.DTOs;
using FourLoveRestaurant.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FourLoveRestaurant.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmployeeController : ControllerBase
    {
        private readonly ForLoveDBContext _forLoveDBContext;

        public EmployeeController(ForLoveDBContext forLoveDBContext)
        {
            _forLoveDBContext = forLoveDBContext;

        }

        [HttpGet]
        [Route("List")]
        [HasPermission("Ver Empleados")]
        public async Task<IActionResult> EmployeeList()
        {
            // var employeeList = await _forLoveDBContext.Employes.Where(e => e.IsActive == true).ToListAsync();
            var employeeList = await _forLoveDBContext.Employes.ToListAsync();

            if (employeeList == null)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { value = false });
            }

            return StatusCode(StatusCodes.Status200OK, new { value = employeeList });

        }

        [HttpPost]
        [HasPermission("Crear Empleados")]
        [Route("Add")]
        public async Task<IActionResult> AddEmployee(EmployeDTO employeDTO)
        {
       
            var existingEmployee = await _forLoveDBContext.Employes
                .FirstOrDefaultAsync(e => e.Identification == employeDTO.Identification);

            
            if (existingEmployee != null && existingEmployee.IsActive == true)
            {
                return StatusCode(StatusCodes.Status400BadRequest, new
                {
                    isSuccess = false,
                    value = "Ya existe un empleado activo con esa identificación."
                });
            }

            if (existingEmployee != null && existingEmployee.IsActive == false)
            {
                existingEmployee!.IsActive = true;

                await _forLoveDBContext.SaveChangesAsync();

                return StatusCode(StatusCodes.Status200OK, new
                {
                    isSuccess = true,
                    value = "Empleado reactivado correctamente."
                });
            }

            // crear nuevo
            var employeeModel = new Employe
            {
                Identification = employeDTO.Identification,
                Name = employeDTO.Name,
                LastNames = employeDTO.LastNames,
                Salary = employeDTO.Salary,
                Shift = employeDTO.Shift,
                IsActive = true
            };

            await _forLoveDBContext.Employes.AddAsync(employeeModel);
            await _forLoveDBContext.SaveChangesAsync();

            return StatusCode(StatusCodes.Status201Created, new
            {
                isSuccess = true,
                value = "El empleado ha sido exitosamente registrado"
            });
        }

        [HttpPut]
        [HasPermission("Editar Empleados")]
        [Route("Edit/{id}")]
        public async Task<IActionResult> EditEmployee(int id, EmployeDTO employeDTO)
        {
            Employe? employeeToEdit = await _forLoveDBContext.Employes.FindAsync(id);

            if (employeeToEdit == null)
                return NotFound(new { isSuccess = false, value = "Empleado no encontrado" });

            // Validar que no exista otra persona con esa identificación
            var exists = await _forLoveDBContext.Employes
                .AnyAsync(e => e.Identification == employeDTO.Identification && e.Id != id);

            if (exists)
            {
                return StatusCode(StatusCodes.Status400BadRequest, new
                {
                    isSuccess = false,
                    value = "Ya existe otro empleado con esa identificación."
                });
            }

            // actualizar
            employeeToEdit.Identification = employeDTO.Identification;
            employeeToEdit.Name = employeDTO.Name;
            employeeToEdit.LastNames = employeDTO.LastNames;
            employeeToEdit.Salary = employeDTO.Salary;
            employeeToEdit.Shift = employeDTO.Shift;

            await _forLoveDBContext.SaveChangesAsync();

            return StatusCode(StatusCodes.Status200OK, new
            {
                isSuccess = true,
                value = "El empleado ha sido actualizado exitosamente"
            });
        }


        [HttpPut]
        [Route("Delete/{id}")]
        [HasPermission("Editar Empleados")]
        public async Task<IActionResult> DeleteEmployee(int id)
        {
            var employee = await _forLoveDBContext.Employes.FindAsync(id);

            if (employee == null)
                return NotFound(new
                {
                    isSuccess = false,
                    value = "Empleado no encontrado"
                });

            if (employee.IsActive == false)
                return BadRequest(new
                {
                    isSuccess = false,
                    value = "El empleado ya está inactivo"
                });

            employee.IsActive = false;

            await _forLoveDBContext.SaveChangesAsync();

            return Ok(new
            {
                isSuccess = true,
                value = "Empleado desactivado correctamente"
            });
        }

    }

}

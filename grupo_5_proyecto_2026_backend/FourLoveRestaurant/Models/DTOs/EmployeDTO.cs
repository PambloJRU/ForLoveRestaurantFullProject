namespace FourLoveRestaurant.Models.DTOs
{
    public class EmployeDTO
    {
        public string Identification { get; set; } = null!;

        public string Name { get; set; } = null!;

        public string LastNames { get; set; } = null!;

        public string Shift { get; set; } = null!;

        public decimal Salary { get; set; }
    }
}

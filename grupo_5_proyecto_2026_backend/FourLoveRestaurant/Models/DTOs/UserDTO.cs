namespace FourLoveRestaurant.Models.DTOs
{
    public class UserDTO
    {
        public string Name { get; set; } = null!;

        public string Password { get; set; } = null!;

        public int IdEmploye { get; set; } // Nota: Aquí usamos el ID (int)
        public int IdRol { get; set; }    // Nota: Aquí usamos el ID (int)
    }
}

namespace FourLoveRestaurant.Models.DTOs
{
    public class RolePermissionsResponseDTO
    {
        public int RoleId { get; set; }
        public string RoleName { get; set; }
        public List<string> Permissions { get; set; } = new List<string>();
    }
}

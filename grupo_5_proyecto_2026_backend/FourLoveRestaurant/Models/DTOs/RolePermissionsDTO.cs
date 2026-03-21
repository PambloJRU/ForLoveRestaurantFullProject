namespace FourLoveRestaurant.Models.DTOs
{
    public class RolePermissionsDTO
    {
        public int RoleId { get; set; }
        public List<int> PermissionsIds { get; set; } = new List<int>();
    }
}

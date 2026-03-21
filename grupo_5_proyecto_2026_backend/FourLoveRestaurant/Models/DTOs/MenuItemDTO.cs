namespace FourLoveRestaurant.Models.DTOs
{
    public class MenuItemDTO
    {
        public string? Name { get;  set; }
        public string? Description { get;  set; }
        public decimal? Price { get;  set; }
        public IFormFile? Photo { get; set; }
    }
}

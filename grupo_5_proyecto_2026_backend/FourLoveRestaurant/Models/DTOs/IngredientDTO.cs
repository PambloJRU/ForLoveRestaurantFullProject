namespace FourLoveRestaurant.Models.DTOs
{
    public class IngredientDTO
    {
        public string Name { get; set; } = null!;

        public IFormFile? Photo { get; set; }

        public decimal? Price { get; set; }

        public int? IdSuppliers { get; set; }

        public int? Stock { get; set; }
    }
}

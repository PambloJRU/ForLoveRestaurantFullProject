namespace FourLoveRestaurant.Models.DTOs
{
    public class OrderDTO
    {
        public int? Number { get; set; }

        public DateOnly? Date { get; set; }

        public bool? Isactive { get; set; }

        public int? IdTable { get; set; }
    }
}

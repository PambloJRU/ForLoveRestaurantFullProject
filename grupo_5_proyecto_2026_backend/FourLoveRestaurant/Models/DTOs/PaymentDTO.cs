namespace FourLoveRestaurant.Models.DTOs
{
    public class PaymentDTO
    {
        public int Number { get; set; }

        public DateOnly? Date { get; set; }

        public decimal? Amount { get; set; } 

        public bool? IsActive { get; set; }

        public int? IdOrder { get; set; }
    }
}

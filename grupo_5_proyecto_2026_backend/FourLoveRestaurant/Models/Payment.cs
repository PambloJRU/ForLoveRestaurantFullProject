using System;
using System.Collections.Generic;

namespace FourLoveRestaurant.Models;

public partial class Payment
{
    public int Id { get; set; }

    public int? Number { get; set; }

    public DateOnly? Date { get; set; }

    public bool? Isactive { get; set; }

    public int? IdOrder { get; set; }

    public decimal? Amount { get; set; }

    public virtual Order? IdOrderNavigation { get; set; }
}

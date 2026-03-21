using System;
using System.Collections.Generic;

namespace FourLoveRestaurant.Models;

public partial class Order
{
    public int Id { get; set; }

    public int? Number { get; set; }

    public DateOnly? Date { get; set; }

    public bool? Isactive { get; set; }

    public int? IdTable { get; set; }

    public virtual Table? IdTableNavigation { get; set; }

    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();
}

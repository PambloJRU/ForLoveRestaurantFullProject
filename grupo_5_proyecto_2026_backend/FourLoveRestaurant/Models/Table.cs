using System;
using System.Collections.Generic;

namespace FourLoveRestaurant.Models;

public partial class Table
{
    public int Id { get; set; }

    public int Number { get; set; }

    public int? Capacity { get; set; }

    public string? State { get; set; }

    public bool? IsActive { get; set; }

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
}

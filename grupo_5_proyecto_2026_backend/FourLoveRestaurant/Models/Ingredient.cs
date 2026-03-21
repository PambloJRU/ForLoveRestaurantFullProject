using System;
using System.Collections.Generic;

namespace FourLoveRestaurant.Models;

public partial class Ingredient
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public string? Photo { get; set; }

    public decimal? Price { get; set; }

    public bool? Isactive { get; set; }

    public int? IdSuppliers { get; set; }

    public int? Stock { get; set; }

    public virtual Supplier? IdSuppliersNavigation { get; set; }
}

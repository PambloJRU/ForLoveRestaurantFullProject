using System;
using System.Collections.Generic;

namespace FourLoveRestaurant.Models;

public partial class Supplier
{
    public int Id { get; set; }

    public string? Photo { get; set; }

    public string? Name { get; set; }

    public string? Identification { get; set; }

    public bool? Isactive { get; set; }

    public string? Phone { get; set; }

    public string? Email { get; set; }

    public virtual ICollection<Ingredient> Ingredients { get; set; } = new List<Ingredient>();
}

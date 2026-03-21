using System;
using System.Collections.Generic;

namespace FourLoveRestaurant.Models;

public partial class Menuitem
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public decimal? Price { get; set; }

    public string? Photo { get; set; }

    public bool? Isactive { get; set; }
}

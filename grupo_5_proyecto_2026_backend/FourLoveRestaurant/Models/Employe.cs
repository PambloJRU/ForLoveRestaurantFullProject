using System;
using System.Collections.Generic;

namespace FourLoveRestaurant.Models;

public partial class Employe
{
    public int Id { get; set; }

    public string Identification { get; set; } = null!;

    public string Name { get; set; } = null!;

    public string LastNames { get; set; } = null!;

    public string Shift { get; set; } = null!;

    public decimal Salary { get; set; }

    public bool? IsActive { get; set; }

    public virtual User? User { get; set; }
}

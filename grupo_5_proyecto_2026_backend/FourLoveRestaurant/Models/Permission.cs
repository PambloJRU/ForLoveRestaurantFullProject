using System;
using System.Collections.Generic;

namespace FourLoveRestaurant.Models;

public partial class Permission
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public bool? IsActve { get; set; }

    public virtual ICollection<Rol> IdRols { get; set; } = new List<Rol>();
}

using System;
using System.Collections.Generic;

namespace FourLoveRestaurant.Models;

public partial class Rol
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public bool? IsActve { get; set; }

    public virtual ICollection<User> Users { get; set; } = new List<User>();

    public virtual ICollection<Permission> IdPermissions { get; set; } = new List<Permission>();
}

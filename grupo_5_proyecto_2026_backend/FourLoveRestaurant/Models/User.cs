using System;
using System.Collections.Generic;

namespace FourLoveRestaurant.Models;

public partial class User
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public string Password { get; set; } = null!;

    public int IdEmploye { get; set; }

    public int IdRol { get; set; }

    public bool? IsActve { get; set; }

    public virtual Employe IdEmployeNavigation { get; set; } = null!;

    public virtual Rol IdRolNavigation { get; set; } = null!;
}

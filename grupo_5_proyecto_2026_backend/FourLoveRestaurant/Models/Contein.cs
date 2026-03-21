using System;
using System.Collections.Generic;

namespace FourLoveRestaurant.Models;

public partial class Contein
{
    public int? IdMenuitems { get; set; }

    public int? IdOrders { get; set; }

    public virtual Menuitem? IdMenuitemsNavigation { get; set; }

    public virtual Order? IdOrdersNavigation { get; set; }
}

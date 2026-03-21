using System;
using System.Collections.Generic;

namespace FourLoveRestaurant.Models;

public partial class Compone
{
    public int? IdIngredients { get; set; }

    public int? IdMenuitems { get; set; }

    public virtual Ingredient? IdIngredientsNavigation { get; set; }

    public virtual Menuitem? IdMenuitemsNavigation { get; set; }
}

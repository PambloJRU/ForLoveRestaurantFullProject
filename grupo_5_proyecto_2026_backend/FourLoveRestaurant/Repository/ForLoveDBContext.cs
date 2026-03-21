using System;
using System.Collections.Generic;
using FourLoveRestaurant.Models;
using Microsoft.EntityFrameworkCore;

namespace FourLoveRestaurant.Repository;

public partial class ForLoveDBContext : DbContext
{
    public ForLoveDBContext()
    {
    }

    public ForLoveDBContext(DbContextOptions<ForLoveDBContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Compone> Compones { get; set; }

    public virtual DbSet<Contein> Conteins { get; set; }

    public virtual DbSet<Employe> Employes { get; set; }

    public virtual DbSet<Ingredient> Ingredients { get; set; }

    public virtual DbSet<Menuitem> Menuitems { get; set; }

    public virtual DbSet<Order> Orders { get; set; }

    public virtual DbSet<Payment> Payments { get; set; }

    public virtual DbSet<Permission> Permissions { get; set; }

    public virtual DbSet<Rol> Rols { get; set; }

    public virtual DbSet<Supplier> Suppliers { get; set; }

    public virtual DbSet<Table> Tables { get; set; }

    public virtual DbSet<User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Compone>(entity =>
        {
            entity
                .HasNoKey()
                .ToTable("COMPONE");

            entity.Property(e => e.IdIngredients).HasColumnName("ID_INGREDIENTS");
            entity.Property(e => e.IdMenuitems).HasColumnName("ID_MENUITEMS");

            entity.HasOne(d => d.IdIngredientsNavigation).WithMany()
                .HasForeignKey(d => d.IdIngredients)
                .HasConstraintName("FK_ID_INGREDIENTS");

            entity.HasOne(d => d.IdMenuitemsNavigation).WithMany()
                .HasForeignKey(d => d.IdMenuitems)
                .HasConstraintName("FK_ID_MENUITEMS");
        });

        modelBuilder.Entity<Contein>(entity =>
        {
            entity
                .HasNoKey()
                .ToTable("CONTEIN");

            entity.Property(e => e.IdMenuitems).HasColumnName("ID_MENUITEMS");
            entity.Property(e => e.IdOrders).HasColumnName("ID_ORDERS");

            entity.HasOne(d => d.IdMenuitemsNavigation).WithMany()
                .HasForeignKey(d => d.IdMenuitems)
                .HasConstraintName("FK_ID_MENUITEMS2");

            entity.HasOne(d => d.IdOrdersNavigation).WithMany()
                .HasForeignKey(d => d.IdOrders)
                .HasConstraintName("FK_ID_ORDERS");
        });

        modelBuilder.Entity<Employe>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Employes__3214EC270D019BCD");

            entity.HasIndex(e => e.Identification, "UQ__Employes__724F06FD2492B526").IsUnique();

            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.Identification)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.LastNames)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.Salary).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.Shift)
                .HasMaxLength(50)
                .IsUnicode(false);
        });

        modelBuilder.Entity<Ingredient>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__INGREDIE__3214EC27D80EB9FA");

            entity.ToTable("INGREDIENTS");

            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.IdSuppliers).HasColumnName("ID_SUPPLIERS");
            entity.Property(e => e.Isactive)
                .HasDefaultValue(true, "ISACTIVEDF")
                .HasColumnName("ISACTIVE");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasColumnName("NAME");
            entity.Property(e => e.Photo)
                .HasMaxLength(100)
                .HasColumnName("PHOTO");
            entity.Property(e => e.Price)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("PRICE");

            entity.HasOne(d => d.IdSuppliersNavigation).WithMany(p => p.Ingredients)
                .HasForeignKey(d => d.IdSuppliers)
                .HasConstraintName("FK_IDSUPPLIERS");
        });

        modelBuilder.Entity<Menuitem>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__MENUITEM__3214EC27D025C58F");

            entity.ToTable("MENUITEMS");

            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.Description)
                .HasMaxLength(100)
                .HasColumnName("DESCRIPTION");
            entity.Property(e => e.Isactive).HasColumnName("ISACTIVE");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasColumnName("NAME");
            entity.Property(e => e.Photo)
                .HasMaxLength(200)
                .HasColumnName("PHOTO");
            entity.Property(e => e.Price)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("PRICE");
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__ORDERS__3214EC2779F9AEDA");

            entity.ToTable("ORDERS");

            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.Date).HasColumnName("DATE");
            entity.Property(e => e.IdTable).HasColumnName("ID_TABLE");
            entity.Property(e => e.Isactive).HasColumnName("ISACTIVE");
            entity.Property(e => e.Number).HasColumnName("NUMBER");

            entity.HasOne(d => d.IdTableNavigation).WithMany(p => p.Orders)
                .HasForeignKey(d => d.IdTable)
                .HasConstraintName("ID_TABLE");
        });

        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__PAYMENTS__3214EC273A7CA53E");

            entity.ToTable("PAYMENTS");

            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.Amount)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("AMOUNT");
            entity.Property(e => e.Date).HasColumnName("DATE");
            entity.Property(e => e.IdOrder).HasColumnName("ID_ORDER");
            entity.Property(e => e.Isactive).HasColumnName("ISACTIVE");
            entity.Property(e => e.Number).HasColumnName("NUMBER");

            entity.HasOne(d => d.IdOrderNavigation).WithMany(p => p.Payments)
                .HasForeignKey(d => d.IdOrder)
                .HasConstraintName("FK_ID_ORDER");
        });

        modelBuilder.Entity<Permission>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Permissi__3214EC2749DB4217");

            entity.HasIndex(e => e.Name, "UQ__Permissi__737584F6A208D9BD").IsUnique();

            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.Description)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.IsActve).HasDefaultValue(true);
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .IsUnicode(false);
        });

        modelBuilder.Entity<Rol>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Rols__3214EC279C790853");

            entity.HasIndex(e => e.Name, "UQ__Rols__737584F6FFB6A7DE").IsUnique();

            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.IsActve).HasDefaultValue(true);
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .IsUnicode(false);

            entity.HasMany(d => d.IdPermissions).WithMany(p => p.IdRols)
                .UsingEntity<Dictionary<string, object>>(
                    "RolPermission",
                    r => r.HasOne<Permission>().WithMany()
                        .HasForeignKey("IdPermission")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK_RolPermiso_Permiso"),
                    l => l.HasOne<Rol>().WithMany()
                        .HasForeignKey("IdRol")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK_RolPermiso_Rol"),
                    j =>
                    {
                        j.HasKey("IdRol", "IdPermission").HasName("PK__Rol_Perm__FDA9FC35676D7EDC");
                        j.ToTable("Rol_Permission");
                        j.IndexerProperty<int>("IdRol").HasColumnName("ID_Rol");
                        j.IndexerProperty<int>("IdPermission").HasColumnName("ID_Permission");
                    });
        });

        modelBuilder.Entity<Supplier>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__SUPPLIER__3214EC27FB36D918");

            entity.ToTable("SUPPLIERS");

            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.Email)
                .HasMaxLength(100)
                .HasColumnName("EMAIL");
            entity.Property(e => e.Identification)
                .HasMaxLength(100)
                .HasColumnName("IDENTIFICATION");
            entity.Property(e => e.Isactive).HasColumnName("ISACTIVE");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasColumnName("NAME");
            entity.Property(e => e.Phone)
                .HasMaxLength(20)
                .HasColumnName("PHONE");
            entity.Property(e => e.Photo)
                .HasMaxLength(200)
                .HasColumnName("PHOTO");
        });

        modelBuilder.Entity<Table>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__TABLES__3214EC27474C4711");

            entity.ToTable("TABLES");

            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.Capacity).HasColumnName("CAPACITY");
            entity.Property(e => e.Number).HasColumnName("NUMBER");
            entity.Property(e => e.State)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("STATE");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Users__3214EC27EF661207");

            entity.HasIndex(e => e.IdEmploye, "UQ__Users__FF205F4240CB60B3").IsUnique();

            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.IdEmploye).HasColumnName("ID_Employe");
            entity.Property(e => e.IdRol).HasColumnName("ID_Rol");
            entity.Property(e => e.IsActve).HasDefaultValue(true);
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.Password)
                .HasMaxLength(255)
                .IsUnicode(false);

            entity.HasOne(d => d.IdEmployeNavigation).WithOne(p => p.User)
                .HasForeignKey<User>(d => d.IdEmploye)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Usuarios_Empleados");

            entity.HasOne(d => d.IdRolNavigation).WithMany(p => p.Users)
                .HasForeignKey(d => d.IdRol)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Usuarios_Roles");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}

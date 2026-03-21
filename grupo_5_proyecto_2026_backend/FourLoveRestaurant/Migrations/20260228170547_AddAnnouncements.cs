using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FourLoveRestaurant.Migrations
{
    /// <inheritdoc />
    public partial class AddAnnouncements : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Announcements",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Announcements", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Employes",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Identification = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false),
                    Name = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: false),
                    LastNames = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: false),
                    Shift = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: false),
                    Salary = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: true, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Employes__3214EC270D019BCD", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "MENUITEMS",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NAME = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    DESCRIPTION = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    PRICE = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    PHOTO = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    ISACTIVE = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__MENUITEM__3214EC27D025C58F", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "Permissions",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: true),
                    IsActve = table.Column<bool>(type: "bit", nullable: true, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Permissi__3214EC2749DB4217", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "Rols",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: false),
                    IsActve = table.Column<bool>(type: "bit", nullable: true, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Rols__3214EC279C790853", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "SUPPLIERS",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PHOTO = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    NAME = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IDENTIFICATION = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ISACTIVE = table.Column<bool>(type: "bit", nullable: true),
                    PHONE = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    EMAIL = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__SUPPLIER__3214EC27FB36D918", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "TABLES",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NUMBER = table.Column<int>(type: "int", nullable: false),
                    CAPACITY = table.Column<int>(type: "int", nullable: true),
                    STATE = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__TABLES__3214EC27474C4711", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "Rol_Permission",
                columns: table => new
                {
                    ID_Rol = table.Column<int>(type: "int", nullable: false),
                    ID_Permission = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Rol_Perm__FDA9FC35676D7EDC", x => new { x.ID_Rol, x.ID_Permission });
                    table.ForeignKey(
                        name: "FK_RolPermiso_Permiso",
                        column: x => x.ID_Permission,
                        principalTable: "Permissions",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_RolPermiso_Rol",
                        column: x => x.ID_Rol,
                        principalTable: "Rols",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: false),
                    Password = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: false),
                    ID_Employe = table.Column<int>(type: "int", nullable: false),
                    ID_Rol = table.Column<int>(type: "int", nullable: false),
                    IsActve = table.Column<bool>(type: "bit", nullable: true, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Users__3214EC27EF661207", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Usuarios_Empleados",
                        column: x => x.ID_Employe,
                        principalTable: "Employes",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_Usuarios_Roles",
                        column: x => x.ID_Rol,
                        principalTable: "Rols",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "INGREDIENTS",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NAME = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PHOTO = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    PRICE = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    ISACTIVE = table.Column<bool>(type: "bit", nullable: true),
                    ID_SUPPLIERS = table.Column<int>(type: "int", nullable: true),
                    Stock = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__INGREDIE__3214EC27D80EB9FA", x => x.ID);
                    table.ForeignKey(
                        name: "FK_IDSUPPLIERS",
                        column: x => x.ID_SUPPLIERS,
                        principalTable: "SUPPLIERS",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "ORDERS",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NUMBER = table.Column<int>(type: "int", nullable: true),
                    DATE = table.Column<DateOnly>(type: "date", nullable: true),
                    ISACTIVE = table.Column<bool>(type: "bit", nullable: true),
                    ID_TABLE = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__ORDERS__3214EC2779F9AEDA", x => x.ID);
                    table.ForeignKey(
                        name: "ID_TABLE",
                        column: x => x.ID_TABLE,
                        principalTable: "TABLES",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "COMPONE",
                columns: table => new
                {
                    ID_INGREDIENTS = table.Column<int>(type: "int", nullable: true),
                    ID_MENUITEMS = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.ForeignKey(
                        name: "FK_ID_INGREDIENTS",
                        column: x => x.ID_INGREDIENTS,
                        principalTable: "INGREDIENTS",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_ID_MENUITEMS",
                        column: x => x.ID_MENUITEMS,
                        principalTable: "MENUITEMS",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "CONTEIN",
                columns: table => new
                {
                    ID_MENUITEMS = table.Column<int>(type: "int", nullable: true),
                    ID_ORDERS = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.ForeignKey(
                        name: "FK_ID_MENUITEMS2",
                        column: x => x.ID_MENUITEMS,
                        principalTable: "MENUITEMS",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_ID_ORDERS",
                        column: x => x.ID_ORDERS,
                        principalTable: "ORDERS",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "PAYMENTS",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NUMBER = table.Column<int>(type: "int", nullable: true),
                    DATE = table.Column<DateOnly>(type: "date", nullable: true),
                    ISACTIVE = table.Column<bool>(type: "bit", nullable: true),
                    ID_ORDER = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__PAYMENTS__3214EC273A7CA53E", x => x.ID);
                    table.ForeignKey(
                        name: "FK_ID_ORDER",
                        column: x => x.ID_ORDER,
                        principalTable: "ORDERS",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateIndex(
                name: "IX_COMPONE_ID_INGREDIENTS",
                table: "COMPONE",
                column: "ID_INGREDIENTS");

            migrationBuilder.CreateIndex(
                name: "IX_COMPONE_ID_MENUITEMS",
                table: "COMPONE",
                column: "ID_MENUITEMS");

            migrationBuilder.CreateIndex(
                name: "IX_CONTEIN_ID_MENUITEMS",
                table: "CONTEIN",
                column: "ID_MENUITEMS");

            migrationBuilder.CreateIndex(
                name: "IX_CONTEIN_ID_ORDERS",
                table: "CONTEIN",
                column: "ID_ORDERS");

            migrationBuilder.CreateIndex(
                name: "UQ__Employes__724F06FD2492B526",
                table: "Employes",
                column: "Identification",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_INGREDIENTS_ID_SUPPLIERS",
                table: "INGREDIENTS",
                column: "ID_SUPPLIERS");

            migrationBuilder.CreateIndex(
                name: "IX_ORDERS_ID_TABLE",
                table: "ORDERS",
                column: "ID_TABLE");

            migrationBuilder.CreateIndex(
                name: "IX_PAYMENTS_ID_ORDER",
                table: "PAYMENTS",
                column: "ID_ORDER");

            migrationBuilder.CreateIndex(
                name: "UQ__Permissi__737584F6A208D9BD",
                table: "Permissions",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Rol_Permission_ID_Permission",
                table: "Rol_Permission",
                column: "ID_Permission");

            migrationBuilder.CreateIndex(
                name: "UQ__Rols__737584F6FFB6A7DE",
                table: "Rols",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_ID_Rol",
                table: "Users",
                column: "ID_Rol");

            migrationBuilder.CreateIndex(
                name: "UQ__Users__FF205F4240CB60B3",
                table: "Users",
                column: "ID_Employe",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Announcements");

            migrationBuilder.DropTable(
                name: "COMPONE");

            migrationBuilder.DropTable(
                name: "CONTEIN");

            migrationBuilder.DropTable(
                name: "PAYMENTS");

            migrationBuilder.DropTable(
                name: "Rol_Permission");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "INGREDIENTS");

            migrationBuilder.DropTable(
                name: "MENUITEMS");

            migrationBuilder.DropTable(
                name: "ORDERS");

            migrationBuilder.DropTable(
                name: "Permissions");

            migrationBuilder.DropTable(
                name: "Employes");

            migrationBuilder.DropTable(
                name: "Rols");

            migrationBuilder.DropTable(
                name: "SUPPLIERS");

            migrationBuilder.DropTable(
                name: "TABLES");
        }
    }
}

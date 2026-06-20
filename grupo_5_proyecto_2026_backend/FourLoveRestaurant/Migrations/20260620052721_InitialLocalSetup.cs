using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FourLoveRestaurant.Migrations
{
    /// <inheritdoc />
    public partial class InitialLocalSetup : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Announcements");

            migrationBuilder.AddColumn<decimal>(
                name: "AMOUNT",
                table: "PAYMENTS",
                type: "decimal(10,2)",
                nullable: true,
                defaultValue: 0m);

            migrationBuilder.AlterColumn<bool>(
                name: "ISACTIVE",
                table: "INGREDIENTS",
                type: "bit",
                nullable: true,
                defaultValue: true,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldNullable: true)
                .Annotation("Relational:DefaultConstraintName", "ISACTIVEDF");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AMOUNT",
                table: "PAYMENTS");

            migrationBuilder.AlterColumn<bool>(
                name: "ISACTIVE",
                table: "INGREDIENTS",
                type: "bit",
                nullable: true,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldNullable: true,
                oldDefaultValue: true)
                .OldAnnotation("Relational:DefaultConstraintName", "ISACTIVEDF");

            migrationBuilder.CreateTable(
                name: "Announcements",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Announcements", x => x.Id);
                });
        }
    }
}

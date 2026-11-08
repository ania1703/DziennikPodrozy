using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DziennikPodrozy.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddTripIsDescribed : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsDescribed",
                table: "Trips",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsDescribed",
                table: "Trips");
        }
    }
}

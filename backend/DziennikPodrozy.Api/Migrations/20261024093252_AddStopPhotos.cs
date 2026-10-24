using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DziennikPodrozy.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddStopPhotos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "StopPhotos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TripStopId = table.Column<int>(type: "int", nullable: false),
                    Url = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Caption = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StopPhotos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StopPhotos_TripStops_TripStopId",
                        column: x => x.TripStopId,
                        principalTable: "TripStops",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_StopPhotos_TripStopId",
                table: "StopPhotos",
                column: "TripStopId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "StopPhotos");
        }
    }
}

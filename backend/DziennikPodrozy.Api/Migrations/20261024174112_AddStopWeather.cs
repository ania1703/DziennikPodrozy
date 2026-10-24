using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DziennikPodrozy.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddStopWeather : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "PrecipitationMm",
                table: "TripStops",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "TemperatureMax",
                table: "TripStops",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "TemperatureMin",
                table: "TripStops",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "WeatherCheckedAt",
                table: "TripStops",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "WeatherCode",
                table: "TripStops",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PrecipitationMm",
                table: "TripStops");

            migrationBuilder.DropColumn(
                name: "TemperatureMax",
                table: "TripStops");

            migrationBuilder.DropColumn(
                name: "TemperatureMin",
                table: "TripStops");

            migrationBuilder.DropColumn(
                name: "WeatherCheckedAt",
                table: "TripStops");

            migrationBuilder.DropColumn(
                name: "WeatherCode",
                table: "TripStops");
        }
    }
}

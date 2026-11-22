# Dziennik Podróży

Aplikacja webowa do prowadzenia prywatnego dziennika z podróży (mapa, wpisy, zdjęcia, notatki głosowe, pogoda, statystyki).

Technologie: React + TypeScript + Vite + Material UI (frontend), ASP.NET Core (.NET 9) + Entity Framework Core + SQL Server (backend).

## Uruchomienie

### Backend (`backend/DziennikPodrozy.Api`)

1. Zainstaluj .NET 9 SDK i SQL Server LocalDB.
2. Ustaw sekrety (nie są przechowywane w repozytorium):

```bash
dotnet user-secrets init
dotnet user-secrets set "Jwt:Key" "<losowy ciąg, minimum 32 znaki>"
dotnet user-secrets set "AdminSeed:Password" "<hasło konta administratora>"
```

3. Zastosuj migracje i uruchom:

```bash
dotnet ef database update
dotnet run --launch-profile https
```

Adres kontaktowy administratora (pokazywany przy logowaniu) ustawia się w `appsettings.json` (`Contact:AdminEmail`).
Na serwerze zamiast user-secrets użyj zmiennych środowiskowych, np. `Jwt__Key` i `AdminSeed__Password`.

### Frontend (`frontend`)

```bash
npm install
npm run dev
```

Adresy API i plików ustawia się w pliku `.env` (zmienne `VITE_API_BASE_URL`, `VITE_FILES_BASE_URL`).
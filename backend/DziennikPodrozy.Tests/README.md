# Testy backendu

Projekt xUnit z testami jednostkowymi (`Unit/`) i integracyjnymi (`Api/`).

## Uruchomienie

W tym folderze:

```bash
dotnet test
```

Przed uruchomieniem zatrzymaj backend (`dotnet run`), bo działająca aplikacja blokuje budowanie projektu.

## Co testują

- `Unit/`: czysta logika bez bazy i internetu (odległość haversine, eksport danych, zapis i odrzucanie plików, tłumaczenie błędów haseł, pogoda i geokodowanie z podstawionymi odpowiedziami).
- `Api/`: całe API uruchamiane w pamięci (`WebApplicationFactory`) na tymczasowej bazie SQLite, z podstawionymi odpowiedziami Nominatim i Open-Meteo.

Testy integracyjne **nie używają** prawdziwej bazy, user-secrets ani internetu: mają własny klucz JWT, konto administratora i tymczasowy folder na pliki (kasowany po testach).

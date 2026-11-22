# Testy frontendu

Testy Vitest czystej logiki z `src/utils` (odmiana polskich słów, kraje i kontynenty, osiągnięcia, daty i zakresy, wyszukiwanie bez polskich znaków, kolory dni, opis aktywności i inne).

## Uruchomienie

Jednorazowo (instalacja Vitest):

```bash
npm install -D vitest
```

W `package.json` dopisz w sekcji `scripts`:

```json
"test": "vitest run --config tests/vitest.config.ts"
```

Potem:

```bash
npm test
```

Testy leżą poza folderem `src`, więc nie wpływają na `npx tsc -b`.

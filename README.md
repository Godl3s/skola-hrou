# 🎮 Škola hrou

Zábavná webová aplikácia na učenie pre prvákov – v kockovom (pixelovom) svete.
Optimalizovaná pre mobil, funguje priamo v prehliadači, netreba nič inštalovať.

## Hry

| Hra | Čo trénuje |
|---|---|
| 👂 **Ušká** | Logopédia – rozlišovanie hlások Š/Č, S/Š, C/Č, Z/Ž (slovo zaznie nahlas) |
| 🔔 **Zvuky** | Sluchové vnímanie – spočítaj zahrané zvuky |
| 🧮 **Počítanie** | Sčítanie a odčítanie do 10/20, porovnávanie čísel |
| 📖 **Čítanie** | Obrázok a slovo, prvé písmenko, skladanie slov |
| 🎨 **Maľovanka** | Pixelové vymaľovanky podľa čísel + voľné kreslenie |
| 🏠 **Môj domček** | Odmena – za nazbierané 💎 sa stavia pixelový svet |

Za správne odpovede dieťa zbiera 💎 diamanty (ukladajú sa v prehliadači),
za ktoré sa mu postupne stavia pixelový domček.

## Technológie

- Čisté HTML + CSS + JavaScript (ES moduly) – **žiadny build, žiadne závislosti**
- Hovorené slovo: Web Speech API (slovenský hlas zariadenia)
- Zvuky: Web Audio API
- Ukladanie postupu: localStorage

## Spustenie lokálne

Stačí ľubovoľný statický server, napr.:

```bash
npx serve .
```

## Nasadenie na Vercel

1. Prihlás sa na [vercel.com](https://vercel.com)
2. **Add New → Project → Import** tento GitHub repozitár
3. Framework preset: **Other**, žiadne build nastavenia netreba
4. **Deploy** – hotovo, každý push na `main` sa nasadí automaticky

## Poznámka pre rodičov

Hra Ušká je zábavný doplnok k logopedickým cvičeniam, nenahrádza logopéda.
Ak zariadenie nečíta po slovensky, nainštalujte slovenský hlas
(Android: aplikácia „Google rozpoznávanie a syntéza reči", iOS: Nastavenia → Prístupnosť → Hovorený obsah → Hlasy).

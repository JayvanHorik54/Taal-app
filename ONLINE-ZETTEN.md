# De app online zetten

Vier stappen, ongeveer tien minuten. Daarna heeft iedereen een adres dat ze op
hun telefoon kunnen openen en desnoods aan hun beginscherm kunnen toevoegen.

## 1. Een database aanmaken

De profielen en de voortgang staan in een database, zodat je op je telefoon
verder kunt waar je op de tablet ophield.

1. Ga naar [neon.tech](https://neon.tech) en maak een gratis project aan — of
   doe het via Vercel: **Storage → Create Database → Neon**.
2. Kopieer de connection string. Die ziet eruit als
   `postgres://…@ep-iets.eu-central-1.aws.neon.tech/neondb?sslmode=require`.

Kies een regio in Europa; dat scheelt merkbaar in snelheid.

Het gratis pakket is ruim voldoende: zes mensen met wat woordenlijsten blijven
ver onder een tiende van wat erin past.

## 2. Twee codes verzinnen

**Een uitnodigingscode.** Die heeft iemand één keer nodig om een profiel aan te
maken. Zonder die code kan iedereen die het adres vindt zelf een profiel openen
en op jouw API-tegoed gaan praten. Bijvoorbeeld twee woorden met een streepje.

**Een sessiegeheim.** Dat ondertekent de sessiekoekjes. Maak er een met:

```bash
openssl rand -base64 32
```

Verzin die niet zelf — het moet echt willekeurig zijn.

## 3. Deployen

```bash
cd ~/Taal-app && npx vercel
```

De eerste keer vraagt hij je in te loggen (browser gaat open) en daarna een
paar dingen:

| Vraag | Antwoord |
| --- | --- |
| Set up and deploy? | **Y** |
| Which scope? | jouw eigen account |
| Link to existing project? | **N** |
| Project name | `taal-app` (of wat je wilt) |
| In which directory is your code? | `./` — gewoon enter |
| Modify settings? | **N** |

Je krijgt een adres terug, iets als `taal-app-xyz.vercel.app`.

## 4. De sleutels instellen

```bash
npx vercel env add DATABASE_URL production
```

```bash
npx vercel env add SESSION_SECRET production
```

```bash
npx vercel env add UITNODIGINGSCODE production
```

```bash
npx vercel env add ANTHROPIC_API_KEY production
```

Bij elk commando plak je de waarde en druk je op enter. Daarna één keer
opnieuw uitrollen zodat hij ze oppakt:

```bash
npx vercel --prod
```

De tabellen hoef je niet aan te maken: de app zet die zelf klaar bij het eerste
bezoek.

> Vergeet je `SESSION_SECRET` of `DATABASE_URL`, dan zegt het aanmeldscherm dat
> met zoveel woorden in plaats van stilletjes te falen.

## Klaar

Stuur iedereen het adres en de uitnodigingscode. Zij:

1. openen de link op hun telefoon
2. maken een profiel: voornaam, pincode, en die ene keer de uitnodigingscode
3. kiezen hun taal
4. zetten de tekst desgewenst groter (knop rechtsboven, of op het eerste scherm)
5. doen de niveautest — dan begint de app op hun niveau

Op iPhone kunnen ze via Deel → *Zet op beginscherm* een icoon maken; dan opent
hij als een gewone app, zonder adresbalk.

Daarna is het alleen nog naam aantikken en pincode invullen. Een sessie blijft
negentig dagen geldig, dus in de praktijk vraagt hij er zelden om.

## Later iets aanpassen

```bash
cd ~/Taal-app && npx vercel --prod
```

Voortgang raakt daarbij niet kwijt: die staat in de database, niet in de app.

## Kosten

Vercel en Neon zijn allebei gratis voor dit formaat. Je betaalt alleen voor de
AI-functies, per gebruik: ongeveer een halve cent per gespreksbeurt. Zes mensen
die dagelijks een kwartier praten komen samen rond de vijftien dollar per maand
uit.

Wil je dat begrenzen, dan kan dat nu per profiel — je weet immers wie er praat.
Dat zit er nog niet in; zie de openstaande punten in `README.md`.

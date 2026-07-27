# Azulejo

Een taalapp die je stap voor stap naar een echt gesprek brengt. Woordenschat is
het tegelveld, grammatica is de cenefa — de rand die het veld bij elkaar houdt.

**Spaans en Engels** staan er nu in. De engine kent geen van beide talen: alles
wat taalspecifiek is zit in `src/content/<code>/`. Een taal toevoegen is content
toevoegen, geen code herschrijven.

Je voortgang wordt **per profiel en per taal apart** bijgehouden. Iedereen in
huis heeft zijn eigen naam en pincode, en deelt niets met de rest — geen streak,
geen cijfers, geen niveau. Omdat het aan je profiel hangt en niet aan je
browser, ga je op je telefoon verder waar je op de tablet ophield.

## Starten

```bash
cp .env.example .env.local
```

Zet in `.env.local` één regel voor de database:

```
DATABASE_URL=pglite:./.pglite
```

Dat draait een echte Postgres (WebAssembly) in het serverproces, met de
gegevens in een map ernaast. Zo kun je alles uitproberen zonder eerst een
database in de cloud aan te maken. Voor productie zet je hier de connection
string van Neon neer; zie `ONLINE-ZETTEN.md`.

```bash
npm run dev
```

Open http://localhost:3000. Het eerste scherm vraagt om een profiel: een
voornaam en een pincode van vier tot acht cijfers. De tabellen zet de app zelf
klaar.

### AI-functies aanzetten (optioneel)

Charla (gesprekken voeren), nieuwe woordenlijsten laten maken en
grammaticahoofdstukken laten aanvullen lopen via de Claude API.

```bash
cp .env.example .env.local
```

Zet je sleutel in `.env.local` en start de server opnieuw. De sleutel blijft aan
de serverkant; hij komt nooit in de browser.

Zonder sleutel werkt de rest gewoon: de woordenlijsten, de uitgeschreven
grammaticahoofdstukken, de niveautest, de oefensessies, de toetsen, de
eindexamens en de bliksemronde.

### Online zetten

Zodra de app op een adres staat is hij voor iedereen bereikbaar die de link
heeft — en achter de gesprekken zit een sleutel die per gebruik geld kost.
Aanmelden is daar de drempel: wie geen profiel heeft, komt niet bij de
AI-functies. En een profiel maken kan alleen met de uitnodigingscode:

```
UITNODIGINGSCODE=iets-dat-je-doorgeeft
```

Laat je die leeg, dan kan iedereen die het adres kent een profiel openen. Lokaal
is dat prima; online niet. Zie `ONLINE-ZETTEN.md` voor het geheel.

## Wat er in zit

| Onderdeel | Wat het doet |
| --- | --- |
| **Profielen** | Iedereen in huis een eigen naam en pincode. Voortgang hangt aan het profiel, dus je gaat op elk apparaat verder waar je ophield. Vijf keer een verkeerde pincode en het profiel gaat een kwartier op slot. |
| **Tekstgrootte** | Drie standen, met de knop rechtsboven of op het eerste scherm. Het hele ontwerp rekent in rem, dus tekst én witruimte groeien mee. De keuze staat vóór de eerste weergave, zodat er geen sprong van klein naar groot is. |
| **Niveautest** | Rondes van zes vragen die steeds moeilijker worden. Bepaalt waar je begint, en zet de woorden van niveaus die je beheerst alvast klaar als herhaling in plaats van als nieuw. |
| **Muur** | Overzicht van je tegels, je streak, je cijferlijst en de toelatingseisen voor het eindexamen. |
| **Oefensessie** | Herhaling volgens een SM-2-achtige planning. Per woord wisselt de vraagvorm mee met hoe goed je het kent: herkennen, schrijven, verstaan, invullen in een zin, en uitspreken. |
| **Woorden** | Zestien lijsten van vijftien woorden per taal, met voorbeeldzinnen. Vertalingen afdekken om jezelf te overhoren. Nieuwe lijsten laten genereren per thema en niveau. |
| **Regels** | 34 grammaticahoofdstukken per taal (A1–B2), elk toegespitst op wat Nederlandstaligen struikelt. Spaans heeft A1 en A2 uitgeschreven, Engels A1. De rest vult de AI op verzoek aan. |
| **Eindexamen** | Twintig vragen over woorden én grammatica, zonder feedback tussendoor. Een 6,0 opent het volgende niveau. |
| **Charla** | Gesprekspartner die zich aanpast aan jouw niveau, jouw geleerde woorden verwerkt en fouten corrigeert. Typen of hardop praten. |
| **Relámpago** | Zestig seconden woorden raden, met combo's. Telt mee voor je herhaling. |

## Hoe het in elkaar zit

```
src/
  content/          taalspecifiek — hier woont het Spaans
    types.ts        de modellen: Deck, Lesson, Topic, LanguagePack
    registry.ts     welke talen de app kent
    es/             Spaans: woorden, leerlijn, lessen, scenario's, niveautest
    en/             Engels: idem
  lib/              taalonafhankelijke engine
    srs.ts          herhalingsplanning
    answer.ts       antwoorden nakijken (Unicode-veilig, dus ook Grieks/Cyrillisch)
    progress.ts     voortgangsmodel en afgeleide gegevens
    samenvoegen.ts  twee versies van dezelfde voortgang tot één maken
    store.tsx       toestand: profiel, taal, voortgang; localStorage + server
    account.ts      clientkant van aanmelden en synchroniseren
    db.ts           de database (Neon in productie, PGlite lokaal)
    profielen.ts    profielen en voortgang: alles wat de database in en uit gaat
    token.ts        sessietokens ondertekenen en nakijken
    sessie.ts       het sessiekoekje
    pincode.ts      pincodes hashen met scrypt
    weergave.ts     tekstgrootte (instelling van het apparaat)
    toegang.ts      uitnodigingscode voor nieuwe profielen
    speech.ts       uitspraak en spraakherkenning
  components/       tegels, oefeningen, toetsen, navigatie, aanmelden
  app/              schermen en de API-routes
```

**Een taal toevoegen** is één map onder `src/content/<code>/` en één regel in
`registry.ts`. De engine leest alleen wat er in het `LanguagePack` staat:
schrift, spraakcode, lidwoorden, persoonsvormen, extra toetsenbordtekens en
zelfs de namen van de twee spelvormen.

**Voortgang bewaart alleen wat van jou is** — planning, cijfers, zelfgemaakte
lijsten — en verwijst naar woorden via een stabiele sleutel. Een typefout in de
content corrigeren werkt dus meteen overal door zonder je voortgang te raken.

**Twee apparaten botsen niet.** De database is de waarheid, `localStorage` is
een kopie: er wordt eerst plaatselijk geschreven zodat het scherm meteen klopt,
en daarna gaat het naar de server. Zo werkt de app door in de metro.

Opslaan is nooit overschrijven maar **samenvoegen** (`samenvoegen.ts`). Dat kan
omdat bijna alles hier één kant op groeit: een woord dat je vaker hebt geoefend,
een cijfer dat erbij komt, een teller die oploopt. Die bewerking is idempotent
en volgorde-onafhankelijk — daar staan tests op — dus het maakt niet uit welk
apparaat als eerste synchroniseert, en dubbel synchroniseren telt niet dubbel.

Wat je daarmee inlevert: twee apparaten die tegelijk offline dezelfde twintig
antwoorden geven, tellen als twintig en niet als veertig. Dat is de goede kant
om te missen.

## Commando's

```bash
npm run dev     # ontwikkelserver
```

```bash
npm run build   # productiebuild
```

```bash
npm test        # engine, samenvoegen, sessietokens en de database (PGlite)
```

```bash
npm run lint    # ESLint
```

De tests draaien met `--conditions=react-server`, zodat de `server-only`-guard
in de serverbestanden blijft staan en de tests er tóch bij kunnen. De
databasetests draaien tegen PGlite: echt Postgres, in hetzelfde proces.

## Nog niet gedaan

- **Verbruik per profiel.** Je weet nu wie er praat, maar er zit geen teller of
  limiet op. Bij zes mensen op één API-sleutel is dat het eerste wat je mist.
- **Pincode vergeten.** Er is geen herstelweg; je maakt dan een nieuw profiel
  aan of gooit de regel uit de database.
- **Profiel verwijderen** kan alleen in de database (de voortgang gaat vanzelf
  mee, dankzij `on delete cascade`).

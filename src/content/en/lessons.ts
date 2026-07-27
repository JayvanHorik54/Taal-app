import type { Lesson } from "../types.ts";

/**
 * Uitgeschreven grammaticahoofdstukken Engels: A1 (e01–e10). Wat hier niet in
 * staat wordt op verzoek door de AI aangevuld en daarna in de voortgang
 * bewaard.
 *
 * De valkuilen zijn geschreven voor Nederlandstaligen: do-support, de -s bij
 * he/she/it, en de woordvolgorde die in het Nederlands wél schuift.
 */
export const lessons: Record<string, Lesson> = {
  e01: {
    core: "A en an gebruik je als iets nieuw is, the als jullie allebei weten welk ding je bedoelt.",
    intro: [
      "Het Nederlands heeft de, het en een. Het Engels heeft a, an en the — minder vormen, maar wel andere gewoontes.",
      "Of het a of an wordt hangt af van de klánk, niet van de letter. An apple, an hour (de h zwijgt), maar a university, want dat begint met een joe-klank. Zeg het woord hardop en je hoort welke het moet zijn.",
      "Het grootste verschil met het Nederlands zit in wat je wéglaat. Praat je in het algemeen over een meervoud of over iets ontelbaars, dan komt er geen lidwoord: Dogs are loyal, I like music. Zet je er the voor, dan bedoel je specifieke honden of specifieke muziek.",
    ],
    table: {
      title: "a, an of niets",
      rows: [
        ["klinkerklank", "an apple, an hour, an egg"],
        ["medeklinkerklank", "a book, a university, a car"],
        ["al bekend of uniek", "the sun, the film we saw"],
        ["algemeen, meervoud", "Dogs are loyal."],
        ["algemeen, ontelbaar", "I like music."],
      ],
    },
    rules: [
      { title: "Klank, geen letter", text: "An hour begint met een klinkerklank ondanks de h; a university begint met een medeklinkerklank ondanks de u." },
      { title: "Beroepen krijgen a of an", text: "She is a nurse. In het Nederlands zeg je 'zij is verpleegkundige' zonder lidwoord, in het Engels moet hij erbij." },
    ],
    examples: [
      { target: "I bought a book and an umbrella.", native: "Ik kocht een boek en een paraplu." },
      { target: "The book I bought is very good.", native: "Het boek dat ik kocht is heel goed." },
      { target: "She is a doctor.", native: "Zij is dokter." },
      { target: "I don't like coffee.", native: "Ik hou niet van koffie." },
    ],
    pitfall: "Nederlanders zetten er vaak the bij waar het niet hoort. 'I like the music' betekent dat je díe muziek mooi vindt. Bedoel je muziek in het algemeen, dan laat je het lidwoord weg.",
    exercises: [
      { type: "choice", prompt: "I'd like ___ orange, please.", options: ["a", "an", "the"], answer: "an", why: "Orange begint met een klinkerklank." },
      { type: "choice", prompt: "She wants to be ___ engineer.", options: ["a", "an", "some"], answer: "an", why: "Engineer begint met een klinkerklank, en een beroep krijgt een lidwoord." },
      { type: "fill", prompt: "This is ___ house where I grew up.", answer: "the", why: "Je bedoelt één bepaald huis." },
      { type: "choice", prompt: "___ are friendly animals.", options: ["The dogs", "Dogs", "A dog"], answer: "Dogs", why: "Een algemene uitspraak over een meervoud krijgt geen lidwoord." },
      { type: "choice", prompt: "We waited for ___ hour.", options: ["a", "an", "the"], answer: "an", why: "De h van hour zwijgt, dus je hoort een klinker." },
      { type: "transform", prompt: "Vertaal: Ik hou van muziek.", answer: "I like music.", why: "Algemeen en ontelbaar, dus geen lidwoord." },
    ],
  },
  e02: {
    core: "Meestal komt er een -s bij, maar het einde van het woord bepaalt of het -s, -es of iets heel anders wordt.",
    intro: [
      "De hoofdregel is simpel: book wordt books. Daar kom je een heel eind mee.",
      "Eindigt het woord op een sisklank — -s, -sh, -ch, -x — dan komt er -es bij, omdat je anders twee sisklanken achter elkaar krijgt: bus wordt buses, watch wordt watches. Staat er een medeklinker vóór de y, dan wordt het -ies: city wordt cities. Maar na een klinker gebeurt er niets bijzonders: day wordt days.",
      "En dan is er een klein groepje dat zich nergens iets van aantrekt: man wordt men, child wordt children, foot wordt feet, person wordt people. Die leer je gewoon uit je hoofd.",
    ],
    table: {
      title: "Meervoud maken",
      rows: [
        ["standaard + s", "book → books"],
        ["na -s, -sh, -ch, -x + es", "bus → buses, watch → watches"],
        ["medeklinker + y → ies", "city → cities"],
        ["klinker + y → alleen s", "day → days"],
        ["-f of -fe → ves", "knife → knives"],
      ],
    },
    rules: [
      { title: "Onregelmatig", text: "man/men, woman/women, child/children, foot/feet, tooth/teeth, person/people. En sheep en fish blijven hetzelfde." },
      { title: "Geen meervoud mogelijk", text: "Information, advice, news, furniture en money zijn ontelbaar. Informations bestaat niet." },
    ],
    examples: [
      { target: "There are three buses an hour.", native: "Er gaan drie bussen per uur." },
      { target: "Both cities are worth visiting.", native: "Beide steden zijn een bezoek waard." },
      { target: "The children are in the garden.", native: "De kinderen zijn in de tuin." },
      { target: "I need some advice.", native: "Ik heb advies nodig." },
    ],
    pitfall: "Informations en advices bestaan niet. Deze woorden zijn in het Engels ontelbaar: je zegt some information, of a piece of advice als je er één bedoelt.",
    exercises: [
      { type: "transform", prompt: "Zet in het meervoud: city", answer: "cities", why: "Medeklinker vóór de y, dus -ies." },
      { type: "transform", prompt: "Zet in het meervoud: watch", answer: "watches", why: "Na een sisklank komt -es." },
      { type: "choice", prompt: "There are two ___ in the room.", options: ["childs", "children", "childrens"], answer: "children", why: "Child is onregelmatig." },
      { type: "fill", prompt: "I bought three ___ (knife).", answer: "knives", why: "De -fe wordt -ves." },
      { type: "choice", prompt: "She gave me some good ___.", options: ["advices", "advice", "advise"], answer: "advice", why: "Advice is ontelbaar en heeft geen meervoud." },
      { type: "transform", prompt: "Zet in het meervoud: day", answer: "days", why: "Na een klinker komt alleen een -s." },
    ],
  },
  e03: {
    core: "To be is het enige Engelse werkwoord met drie verschillende vormen in de tegenwoordige tijd.",
    intro: [
      "I am, you are, he is. Alle andere werkwoorden hebben er maar twee, dit werkwoord heeft er drie. Precies daarom is het ook het eerste dat je uit je hoofd leert.",
      "In gesproken en geschreven Engels gebruik je bijna altijd de samengetrokken vorm: I'm, you're, he's, we're, they're. Alles voluit schrijven klinkt stijf, alsof je iets benadrukt.",
      "Vragen maak je door om te draaien — Are you ready? — en niet met do. Dat is het enige werkwoord waarbij dat mag; bij alle andere heb je do of does nodig.",
    ],
    table: {
      title: "to be — tegenwoordige tijd",
      rows: [
        ["I", "am (I'm)"],
        ["you", "are (you're)"],
        ["he / she / it", "is (he's)"],
        ["we", "are (we're)"],
        ["you (mv.)", "are (you're)"],
        ["they", "are (they're)"],
      ],
    },
    rules: [
      { title: "Vraag: gewoon omdraaien", text: "Are you ready? Is he here? Er komt geen do bij." },
      { title: "Toestanden met to be", text: "I am hungry, I am cold, I am right, I am forty — waar het Nederlands 'hebben' of 'gelijk hebben' gebruikt." },
    ],
    examples: [
      { target: "I'm from the Netherlands.", native: "Ik kom uit Nederland." },
      { target: "She isn't at home right now.", native: "Ze is nu niet thuis." },
      { target: "Are you ready to go?", native: "Ben je klaar om te gaan?" },
      { target: "We're very hungry.", native: "We hebben erge honger." },
    ],
    pitfall: "Ik heb honger wordt I am hungry, niet I have hunger. Hetzelfde geldt voor I am cold, I am thirsty en I am right — het Engels gebruikt daar zijn.",
    exercises: [
      { type: "conjugate", verb: "to be", tense: "present simple", answers: ["am", "are", "is", "are", "are", "are"], why: "Alleen I en he/she/it wijken af van are." },
      { type: "fill", prompt: "She ___ my sister.", answer: "is", why: "Bij she hoort is." },
      { type: "choice", prompt: "___ you tired?", options: ["Do", "Are", "Is"], answer: "Are", why: "Bij to be draai je om, je gebruikt geen do." },
      { type: "fill", prompt: "They ___ not at home.", answer: "are", why: "Bij they hoort are." },
      { type: "transform", prompt: "Vertaal: Ik heb honger.", answer: "I am hungry.", why: "Het Engels zegt zijn waar het Nederlands hebben zegt." },
      { type: "choice", prompt: "We ___ ready now.", options: ["is", "am", "are"], answer: "are", why: "Bij we hoort are." },
    ],
  },
  e04: {
    core: "Have en have got betekenen hetzelfde als je bezit bedoelt; have got is spreektaal, have is neutraler.",
    intro: [
      "Bij have verandert er maar één ding: he, she en it krijgen has. Verder is het overal have.",
      "In Brits Engels hoor je voor bezit heel vaak have got: I've got a car betekent precies hetzelfde als I have a car. Alleen het vragen en ontkennen gaat anders. Bij have heb je do nodig — Do you have a car? — en bij have got draai je om: Have you got a car?",
      "Have gebruik je ook in vaste uitdrukkingen waar got niet in past: have breakfast, have a shower, have a look, have a good time. Daar kun je nooit got tussen zetten.",
    ],
    table: {
      title: "have en have got",
      rows: [
        ["bezit, neutraal", "I have a car."],
        ["bezit, spreektaal", "I've got a car."],
        ["vraag met have", "Do you have a car?"],
        ["vraag met have got", "Have you got a car?"],
        ["vaste uitdrukking", "I have breakfast at eight."],
      ],
    },
    rules: [
      { title: "Alleen he, she en it", text: "Die krijgen has. Alle andere personen hebben have." },
      { title: "Got past niet overal", text: "Bij have breakfast, have a shower of have a look zeg je nooit have got." },
    ],
    examples: [
      { target: "I have two brothers.", native: "Ik heb twee broers." },
      { target: "She's got a new job.", native: "Ze heeft een nieuwe baan." },
      { target: "Do you have a moment?", native: "Heb je even?" },
      { target: "We usually have dinner at seven.", native: "We eten meestal om zeven uur." },
    ],
    pitfall: "Have got werkt alleen bij bezit. 'I have got breakfast' klinkt alsof je het ontbijt in je handen houdt — je bedoelt I have breakfast.",
    exercises: [
      { type: "conjugate", verb: "to have", tense: "present simple", answers: ["have", "have", "has", "have", "have", "have"], why: "Alleen he, she en it krijgen has." },
      { type: "fill", prompt: "He ___ a big house.", answer: "has", why: "Bij he hoort has." },
      { type: "choice", prompt: "___ you have any questions?", options: ["Do", "Are", "Has"], answer: "Do", why: "Bij have zonder got heb je do nodig." },
      { type: "fill", prompt: "I ___ got two sisters.", answer: "have", why: "Bij I hoort have." },
      { type: "choice", prompt: "We ___ lunch at one o'clock.", options: ["have got", "have", "has"], answer: "have", why: "In een vaste uitdrukking gebruik je have zonder got." },
      { type: "transform", prompt: "Vertaal: Zij heeft geen auto.", answer: "She doesn't have a car.", why: "Ontkennen met have gaat via doesn't." },
    ],
  },
  e05: {
    core: "De present simple gebruik je voor gewoontes en feiten — en alleen bij he, she en it komt er een -s bij.",
    intro: [
      "Deze tijd gebruik je voor wat je regelmatig doet (I work in Utrecht), voor feiten (Water boils at 100 degrees) en voor dienstregelingen (The train leaves at six).",
      "De vorm verandert maar op één plek: he, she en it krijgen een -s. I work, you work, he works. Eindigt het werkwoord op -ch, -sh, -o of -x, dan wordt het -es: he watches, she goes. Staat er een medeklinker vóór de y, dan wordt het -ies: he studies.",
      "Woorden als always, usually, often, sometimes en never horen bij deze tijd en staan vóór het werkwoord: I always work. Alleen na to be gaan ze erachter: I am always late.",
    ],
    table: {
      title: "to work — present simple",
      rows: [
        ["I / you / we / they", "work"],
        ["he / she / it", "works"],
        ["na -ch, -sh, -o", "he watches, she goes"],
        ["medeklinker + y", "he studies"],
        ["signaalwoorden", "always, usually, often, never, every day"],
      ],
    },
    rules: [
      { title: "De derde persoon krijgt -s", text: "He work bestaat niet. Deze letter is de meest vergeten letter van het Engels." },
      { title: "Plaats van het bijwoord", text: "Vóór een gewoon werkwoord (I never eat meat), maar ná to be (I am never late)." },
    ],
    examples: [
      { target: "I work in Utrecht.", native: "Ik werk in Utrecht." },
      { target: "She goes to the gym twice a week.", native: "Ze gaat twee keer per week naar de sportschool." },
      { target: "Water boils at 100 degrees.", native: "Water kookt bij 100 graden." },
      { target: "They never eat meat.", native: "Ze eten nooit vlees." },
    ],
    pitfall: "Die -s bij he, she en it wordt het vaakst vergeten van allemaal. 'He work here' klinkt voor een Engelstalige meteen fout, ook al begrijpt hij je prima.",
    exercises: [
      { type: "fill", prompt: "He ___ (work) at the hospital.", answer: "works", why: "Bij he komt er een -s bij." },
      { type: "choice", prompt: "She ___ to school by bike.", options: ["go", "goes", "gos"], answer: "goes", why: "Na een -o komt -es." },
      { type: "fill", prompt: "They ___ (live) in Rotterdam.", answer: "live", why: "Bij they verandert het werkwoord niet." },
      { type: "choice", prompt: "My brother ___ football every Sunday.", options: ["play", "plays", "playes"], answer: "plays", why: "Derde persoon enkelvoud krijgt gewoon -s." },
      { type: "transform", prompt: "Vertaal: Zij studeert medicijnen.", answer: "She studies medicine.", why: "Medeklinker vóór de y, dus -ies." },
      { type: "choice", prompt: "I ___ late for work.", options: ["am always", "always am", "always"], answer: "am always", why: "Na to be komt het bijwoord erachter." },
    ],
  },
  e06: {
    core: "Bij een gewoon werkwoord heb je do of does nodig om een vraag te stellen of iets te ontkennen.",
    intro: [
      "Het Nederlands draait de zin gewoon om: 'Werk jij hier?' Het Engels kan dat niet, en zet er een hulpwerkwoord voor: Do you work here?",
      "Do gebruik je bij I, you, we en they; does bij he, she en it. Zodra does in de zin staat, verdwijnt de -s van het hoofdwerkwoord: Does he work here? — niet does he works.",
      "Ontkennen werkt hetzelfde: don't of doesn't plus het hele werkwoord. She doesn't like it. Twee werkwoorden hebben dit niet nodig: to be en de modale werkwoorden. Bij Are you ready? en Can you swim? komt er nooit een do bij.",
    ],
    table: {
      title: "do en does",
      rows: [
        ["vraag: I / you / we / they", "Do you speak English?"],
        ["vraag: he / she / it", "Does she speak English?"],
        ["ontkenning", "I don't know. / He doesn't know."],
        ["to be: geen do", "Are you ready?"],
        ["modaal: geen do", "Can you help me?"],
      ],
    },
    rules: [
      { title: "De -s verhuist", text: "Staat does er, dan gaat de -s van het werkwoord af: Does he live here?" },
      { title: "Korte antwoorden", text: "Yes, I do. No, she doesn't. Op een do-vraag antwoord je niet met am of is." },
    ],
    examples: [
      { target: "Do you speak English?", native: "Spreek je Engels?" },
      { target: "She doesn't work on Fridays.", native: "Ze werkt niet op vrijdag." },
      { target: "Does he know the answer?", native: "Weet hij het antwoord?" },
      { target: "I don't understand.", native: "Ik begrijp het niet." },
    ],
    pitfall: "De verleiding is groot om het Nederlands te volgen en 'Speak you English?' te zeggen. Die zin bestaat niet. Bij elk gewoon werkwoord heb je do of does nodig.",
    exercises: [
      { type: "choice", prompt: "___ she like coffee?", options: ["Do", "Does", "Is"], answer: "Does", why: "Bij she hoort does." },
      { type: "fill", prompt: "I ___ (not know) the answer.", answer: "don't know", why: "Ontkennen gaat met don't plus het hele werkwoord." },
      { type: "choice", prompt: "Does he ___ here?", options: ["work", "works", "working"], answer: "work", why: "Na does valt de -s weg." },
      { type: "fill", prompt: "They ___ (not live) in London.", answer: "don't live", why: "Bij they hoort don't." },
      { type: "transform", prompt: "Maak er een vraag van: You speak Dutch.", answer: "Do you speak Dutch?", why: "Een gewoon werkwoord heeft do nodig." },
      { type: "choice", prompt: "___ she a doctor?", options: ["Do", "Is", "Does"], answer: "Is", why: "To be heeft geen do nodig; je draait gewoon om." },
    ],
  },
  e07: {
    core: "There is en there are zeggen dát iets bestaat of ergens is — het Nederlandse 'er is' en 'er zijn'.",
    intro: [
      "There is gebruik je bij één ding of bij iets ontelbaars, there are bij een meervoud. In spreektaal hoor je bijna altijd there's.",
      "In de verleden tijd wordt het there was en there were. En vragen maak je door om te draaien: Is there a bank near here?",
      "Let op dat deze there niets te maken heeft met de there die 'daar' betekent. 'There is a book there' is een volstrekt normale zin: er ligt daar een boek.",
    ],
    table: {
      title: "there is / there are",
      rows: [
        ["enkelvoud", "There is a problem."],
        ["meervoud", "There are two problems."],
        ["ontelbaar", "There is some milk left."],
        ["verleden tijd", "There was / There were"],
        ["vraag", "Is there a bank near here?"],
      ],
    },
    rules: [
      { title: "Niet it is", text: "'It is a bank near here' klopt niet. Wil je zeggen dat iets bestaat, dan is het There is." },
      { title: "Bij een opsomming", text: "Het werkwoord richt zich naar het eerste ding: There is a chair and two tables." },
    ],
    examples: [
      { target: "There is a supermarket on the corner.", native: "Er is een supermarkt op de hoek." },
      { target: "There are twenty students in the class.", native: "Er zijn twintig studenten in de klas." },
      { target: "Is there a toilet here?", native: "Is hier een toilet?" },
      { target: "There were a lot of people.", native: "Er waren veel mensen." },
    ],
    pitfall: "Nederlanders beginnen zulke zinnen vaak met it. 'It is a problem' betekent 'het is een probleem'. Wil je zeggen dat er een probleem ís, dan is het There is a problem.",
    exercises: [
      { type: "choice", prompt: "___ three cats in the garden.", options: ["There is", "There are", "It is"], answer: "There are", why: "Drie katten is meervoud." },
      { type: "fill", prompt: "___ is a letter for you.", answer: "There", why: "Je zegt dat iets bestaat, niet wat het is." },
      { type: "choice", prompt: "___ any milk in the fridge?", options: ["Is there", "Are there", "Is it"], answer: "Is there", why: "Milk is ontelbaar, dus enkelvoud." },
      { type: "fill", prompt: "Yesterday ___ a lot of people at the market.", answer: "there were", why: "Verleden tijd en meervoud." },
      { type: "transform", prompt: "Vertaal: Er is een probleem.", answer: "There is a problem.", why: "Niet it is, maar there is." },
      { type: "choice", prompt: "___ a bank near here?", options: ["Is it", "Is there", "Has there"], answer: "Is there", why: "Je vraagt of iets bestaat." },
    ],
  },
  e08: {
    core: "Een bijvoeglijk naamwoord staat vóór het zelfstandig naamwoord en verandert nooit van vorm.",
    intro: [
      "A red car, red cars — reds cars bestaat niet. Er komt nooit een meervouds-s bij, en er is geen mannelijk of vrouwelijk.",
      "Zet je er meerdere achter elkaar, dan komt een mening eerst en een feit daarna: a lovely old house. Twee of drie is in de praktijk het maximum.",
      "De woordvolgorde van de zin ligt veel vaster dan in het Nederlands: onderwerp, werkwoord, rest. Plaats komt vóór tijd: I work in Amsterdam every Monday. En anders dan in het Nederlands blijft die volgorde staan, ook als er een bepaling vooraan komt.",
    ],
    table: {
      title: "Volgorde",
      rows: [
        ["bijvoeglijk vóór zelfstandig", "a red car"],
        ["nooit meervoud", "red cars, niet reds cars"],
        ["onderwerp – werkwoord – rest", "I saw him yesterday."],
        ["plaats vóór tijd", "She works in Leeds every day."],
        ["mening vóór feit", "a lovely old house"],
      ],
    },
    rules: [
      { title: "Geen verbuiging", text: "Big, bigger en biggest zijn de enige vormen. Er komt nooit een meervouds-s achter." },
      { title: "De volgorde blijft staan", text: "Yesterday I saw him — niet 'Yesterday saw I him', ook al doet het Nederlands dat wel." },
    ],
    examples: [
      { target: "She has a beautiful old house.", native: "Zij heeft een prachtig oud huis." },
      { target: "They bought two red bikes.", native: "Ze kochten twee rode fietsen." },
      { target: "I work in Amsterdam every Monday.", native: "Ik werk elke maandag in Amsterdam." },
      { target: "Last year we went to Spain.", native: "Vorig jaar gingen we naar Spanje." },
    ],
    pitfall: "In het Nederlands schuift het werkwoord naar voren na een bepaling: 'Gisteren zag ik hem'. In het Engels blijft de volgorde gewoon staan: Yesterday I saw him.",
    exercises: [
      { type: "choice", prompt: "She bought two ___.", options: ["reds cars", "red cars", "cars red"], answer: "red cars", why: "Het bijvoeglijk naamwoord komt ervoor en krijgt geen -s." },
      { type: "transform", prompt: "Zet in de juiste volgorde: house / old / a / beautiful", answer: "a beautiful old house", why: "Een mening komt vóór een feit." },
      { type: "choice", prompt: "___ my neighbour at the market.", options: ["Yesterday saw I", "Yesterday I saw", "I yesterday saw"], answer: "Yesterday I saw", why: "De volgorde onderwerp-werkwoord blijft staan." },
      { type: "fill", prompt: "He works ___ London every week.", answer: "in", why: "Plaats komt vóór tijd." },
      { type: "transform", prompt: "Vertaal: Ik werk elke dag in Utrecht.", answer: "I work in Utrecht every day.", why: "Eerst de plaats, dan de tijd." },
      { type: "choice", prompt: "They live in a ___ flat.", options: ["small nice", "nice small", "small nices"], answer: "nice small", why: "Nice is een mening en komt vóór het feit small." },
    ],
  },
  e09: {
    core: "Voor bezit gebruik je my, your, his of her — en bij personen en namen de 's.",
    intro: [
      "My, your, his, her, its, our en their veranderen nooit mee met wat er bezeten wordt: my book, my books.",
      "His of her richt zich naar de bezitter, niet naar het ding. Praat je over Anna en haar broer, dan is het her brother — ook al is die broer een man. Het Nederlands kijkt daar precies andersom naar.",
      "Bij personen en dieren gebruik je 's: Peter's car, the dog's tail. Eindigt een meervoud al op een -s, dan komt er alleen een apostrof achter: the students' room. Voor dingen gebruik je liever of: the roof of the house.",
    ],
    table: {
      title: "Bezit",
      rows: [
        ["vóór een zelfstandig naamwoord", "my book, her car"],
        ["persoon + 's", "Peter's car"],
        ["meervoud op -s + apostrof", "the students' room"],
        ["dingen: of", "the roof of the house"],
        ["its of it's", "its colour (bezit) / it's cold (it is)"],
      ],
    },
    rules: [
      { title: "Richt je naar de bezitter", text: "Her brother als de bezitter een vrouw is, his sister als het een man is." },
      { title: "It's betekent altijd it is", text: "Bezit is its, zonder apostrof. Dit is de meest gemaakte schrijffout van het Engels." },
    ],
    examples: [
      { target: "This is my sister's car.", native: "Dit is de auto van mijn zus." },
      { target: "Anna is here with her husband.", native: "Anna is hier met haar man." },
      { target: "The dog wagged its tail.", native: "De hond kwispelde met zijn staart." },
      { target: "The roof of the building is new.", native: "Het dak van het gebouw is nieuw." },
    ],
    pitfall: "Nederlanders zeggen 'his sister' over een vrouw, omdat ze aan de zus denken. Het Engels kijkt naar de bezitter: is dat een vrouw, dan is het her sister.",
    exercises: [
      { type: "choice", prompt: "Anna is coming with ___ brother.", options: ["his", "her", "its"], answer: "her", why: "De bezitter is Anna, en zij is een vrouw." },
      { type: "fill", prompt: "This is ___ (Peter) bike.", answer: "Peter's", why: "Bij een persoon gebruik je 's." },
      { type: "choice", prompt: "The dog hurt ___ paw.", options: ["it's", "its", "his"], answer: "its", why: "Bezit is its, zonder apostrof." },
      { type: "fill", prompt: "The roof ___ the house is old.", answer: "of", why: "Bij dingen gebruik je of in plaats van 's." },
      { type: "transform", prompt: "Vertaal: de auto van mijn broer", answer: "my brother's car", why: "Bij een persoon komt de 's achter de bezitter." },
      { type: "choice", prompt: "___ very cold today.", options: ["Its", "It's", "Its'"], answer: "It's", why: "Met apostrof staat het voor it is." },
    ],
  },
  e10: {
    core: "Een vraagwoord staat vooraan, en daarna volgt de gewone vraagvolgorde met do, is of can.",
    intro: [
      "What, where, when, who, why, how, which en whose — daarmee kom je overal. De bouw is steeds hetzelfde: vraagwoord, hulpwerkwoord, onderwerp, werkwoord. Where do you live? What is she doing?",
      "Eén uitzondering: is het vraagwoord zélf het onderwerp, dan hoef je geen do te gebruiken. Who lives here? What happened? Daar zou 'Who does live here' juist raar klinken.",
      "How combineert graag met andere woorden: how much, how many, how long, how often, how old. En in een indirecte vraag draait de volgorde terug naar normaal: Do you know where the station is?",
    ],
    table: {
      title: "De vraagwoorden",
      rows: [
        ["what", "wat, welk"],
        ["where", "waar"],
        ["when", "wanneer"],
        ["who", "wie"],
        ["why", "waarom"],
        ["how", "hoe"],
        ["which", "welke, uit een groep"],
        ["whose", "van wie"],
      ],
    },
    rules: [
      { title: "Vraagwoord als onderwerp", text: "Dan komt er geen do bij: Who wants tea? What happened?" },
      { title: "Indirecte vraag", text: "Daarna weer de gewone volgorde: I don't know where he lives." },
    ],
    examples: [
      { target: "Where do you live?", native: "Waar woon je?" },
      { target: "How long have you been here?", native: "Hoe lang ben je hier al?" },
      { target: "Who wants a cup of tea?", native: "Wie wil een kopje thee?" },
      { target: "Do you know where the station is?", native: "Weet je waar het station is?" },
    ],
    pitfall: "In een indirecte vraag draait de volgorde terug. 'Can you tell me where is the station' is fout; het moet where the station is.",
    exercises: [
      { type: "fill", prompt: "___ do you live?", answer: "Where", why: "Je vraagt naar een plaats." },
      { type: "choice", prompt: "___ wants some tea?", options: ["Who does", "Who", "Whom does"], answer: "Who", why: "Het vraagwoord is hier het onderwerp, dus geen do." },
      { type: "choice", prompt: "___ old are you?", options: ["What", "How", "Which"], answer: "How", why: "Leeftijd vraag je met how old." },
      { type: "fill", prompt: "___ book is this?", answer: "Whose", why: "Je vraagt van wie het is." },
      { type: "transform", prompt: "Vertaal: Weet je waar hij woont?", answer: "Do you know where he lives?", why: "In een indirecte vraag komt de gewone volgorde terug." },
      { type: "choice", prompt: "___ many people were there?", options: ["How", "What", "Which"], answer: "How", why: "Aantallen vraag je met how many." },
    ],
  },
};

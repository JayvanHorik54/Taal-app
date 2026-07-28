import type { Lesson } from "../types.ts";

/**
 * Uitgeschreven grammaticahoofdstukken Grieks: A1 (el01–el10). Wat hier niet in
 * staat wordt op verzoek door de AI aangevuld en daarna in de voortgang
 * bewaard.
 *
 * De valkuilen zijn geschreven voor Nederlandstaligen: een ander schrift, het
 * geslacht dat overal doorwerkt, de naamval na een voorzetsel, en het
 * persoonlijk voornaamwoord dat je juist wéglaat.
 */
export const lessons: Record<string, Lesson> = {
  el01: {
    core: "Het Griekse alfabet heeft vierentwintig letters, en een handvol vaste combinaties die samen één klank vormen.",
    intro: [
      "Grieks leren lezen is de eerste drempel en meteen ook de laatste: het schrift is volstrekt regelmatig. Anders dan in het Engels weet je bij elk woord hoe je het uitspreekt zodra je de letters kent.",
      "Een paar letters lijken op de onze maar klinken anders. Β is een v, Δ is de zachte th van het Engelse this, Θ is de scherpe th van think, en Χ is onze g uit 'lachen'. Ρ is gewoon een r, geen p.",
      "Daarnaast zijn er combinaties die je als één klank leest. ΟΥ is oe, ΑΙ is e, ΕΙ en ΟΙ zijn allebei ie. En ΜΠ, ΝΤ en ΓΚ klinken aan het begin van een woord als b, d en g.",
    ],
    table: {
      title: "Letters die je op het verkeerde been zetten",
      rows: [
        ["β", "v — βιβλίο, boek"],
        ["δ", "zachte th — δέκα, tien"],
        ["θ", "scherpe th — θέλω, ik wil"],
        ["χ", "g als in lachen — χέρι, hand"],
        ["ρ", "r, geen p — ρόδα, wiel"],
        ["ου", "oe — μουσική, muziek"],
        ["ει / οι", "ie — είναι, is"],
        ["μπ / ντ", "b / d — μπίρα, ντομάτα"],
      ],
    },
    rules: [
      { title: "Eén tonos per woord", text: "Elk woord van twee lettergrepen of meer krijgt precies één accentstreepje, en dat streepje zegt waar de klemtoon ligt: καλημέρα, ευχαριστώ." },
      { title: "De sigma aan het eind", text: "Midden in een woord schrijf je σ, aan het eind ς. Hetzelfde teken en dezelfde klank, alleen een andere plek: Θεσσαλονίκης." },
    ],
    examples: [
      { target: "Καλημέρα, τι κάνεις;", native: "Goedemorgen, hoe gaat het?" },
      { target: "Το βιβλίο είναι στο τραπέζι.", native: "Het boek ligt op de tafel." },
      { target: "Ευχαριστώ πολύ.", native: "Heel erg bedankt." },
      { target: "Δεν καταλαβαίνω.", native: "Ik begrijp het niet." },
    ],
    pitfall: "Nederlanders lezen Ρ als een p en Χ als een x, omdat die letters er zo uitzien. Ρ is een gewone r en Χ is de g van 'lachen': het woord όχι klinkt als 'ochi', niet als 'oxi'.",
    exercises: [
      { type: "choice", prompt: "Welke klank heeft β in het woord βιβλίο?", options: ["b", "v", "w"], answer: "v", why: "De Griekse bèta klinkt als onze v; voor een b heb je μπ nodig." },
      { type: "choice", prompt: "Hoe lees je de combinatie ου in μουσική?", options: ["oe", "au", "ie"], answer: "oe", why: "Ου is in elk woord oe, zonder uitzondering." },
      { type: "transform", prompt: "Schrijf in Griekse letters: kalimera", answer: "καλημέρα", why: "Elke klank heeft precies één letter, en de tonos staat op μέ." },
      { type: "fill", prompt: "Vul de juiste sigma in: Θεσσαλονίκη___", answer: "ς", why: "Aan het eind van een woord schrijf je de sigma als ς." },
      { type: "choice", prompt: "Aan het begin van een woord klinkt μπ als…", options: ["b", "mp", "f"], answer: "b", why: "Μπ vooraan is onze b: μπίρα betekent bier." },
      { type: "transform", prompt: "Schrijf in Griekse letters: efcharisto", answer: "ευχαριστώ", why: "Ευ klinkt als 'ef' voor een scherpe medeklinker, en de tonos staat achteraan." },
    ],
  },
  el02: {
    core: "Elk zelfstandig naamwoord heeft een geslacht, en het lidwoord verandert mee met naamval en getal.",
    intro: [
      "Het Grieks heeft drie geslachten: mannelijk met ο, vrouwelijk met η en onzijdig met το. Anders dan bij ons hoor je het geslacht meestal al aan de uitgang, dus je hoeft niet elk woord los uit je hoofd te leren.",
      "Het lidwoord staat er vaker dan in het Nederlands. Bij namen (ο Γιάννης), bij bezit en bij algemene uitspraken hoort het er gewoon bij: η ζωή είναι ωραία, het leven is mooi.",
      "En het lidwoord verbuigt mee. Als onderwerp is het ο, η, το; als lijdend voorwerp wordt het τον, τη en το. In het meervoud is het οι, οι, τα, en als lijdend voorwerp τους, τις, τα.",
    ],
    table: {
      title: "Het bepaald lidwoord",
      rows: [
        ["mannelijk, onderwerp", "ο φίλος"],
        ["mannelijk, voorwerp", "τον φίλο"],
        ["vrouwelijk, onderwerp", "η φίλη"],
        ["vrouwelijk, voorwerp", "τη φίλη"],
        ["onzijdig", "το παιδί — blijft το"],
        ["meervoud, onderwerp", "οι φίλοι, οι φίλες, τα παιδιά"],
      ],
    },
    rules: [
      { title: "Het onbepaald lidwoord is het telwoord één", text: "Ένας, μία en ένα betekenen zowel 'een' als 'één'. Bedoel je iets algemeens in het meervoud, dan laat je het lidwoord gewoon weg." },
      { title: "Namen krijgen een lidwoord", text: "Je zegt ο Γιάννης en η Μαρία, ook midden in een zin. Zonder lidwoord klinkt het als een telegram." },
    ],
    examples: [
      { target: "Ο φίλος μου μένει στην Αθήνα.", native: "Mijn vriend woont in Athene." },
      { target: "Η Μαρία διαβάζει ένα βιβλίο.", native: "Maria leest een boek." },
      { target: "Το παιδί παίζει στον κήπο.", native: "Het kind speelt in de tuin." },
      { target: "Τα παιδιά είναι στο σχολείο.", native: "De kinderen zijn op school." },
    ],
    pitfall: "Nederlanders laten het lidwoord weg bij namen en bij algemene uitspraken, omdat dat in het Nederlands ook zo gaat. In het Grieks klinkt 'Μαρία είναι εδώ' onaf: het moet η Μαρία είναι εδώ.",
    exercises: [
      { type: "choice", prompt: "___ γυναίκα διαβάζει.", options: ["Ο", "Η", "Το"], answer: "Η", why: "Γυναίκα is vrouwelijk en krijgt dus η." },
      { type: "choice", prompt: "___ παιδί παίζει έξω.", options: ["Ο", "Η", "Το"], answer: "Το", why: "Woorden op -ι zijn onzijdig en krijgen το." },
      { type: "fill", prompt: "Βλέπω ___ φίλο μου. (mannelijk, lijdend voorwerp)", answer: "τον", why: "Als lijdend voorwerp wordt ο tot τον." },
      { type: "choice", prompt: "___ φίλοι είναι εδώ.", options: ["Ο", "Οι", "Τα"], answer: "Οι", why: "Mannelijk meervoud als onderwerp is οι." },
      { type: "transform", prompt: "Vertaal: Maria is hier.", answer: "Η Μαρία είναι εδώ.", why: "Bij een naam hoort in het Grieks een lidwoord." },
      { type: "choice", prompt: "Ξέρω ___ Γιάννη.", options: ["ο", "τον", "του"], answer: "τον", why: "Ξέρω heeft een lijdend voorwerp, dus de accusatief τον." },
    ],
  },
  el03: {
    core: "Wie iets doet staat in de nominatief, wie het ondergaat in de accusatief — en dat zie je aan de uitgang.",
    intro: [
      "Het Nederlands laat de volgorde het werk doen: 'de hond bijt de man' betekent iets anders dan 'de man bijt de hond'. Het Grieks laat de uitgang het werk doen, en kan de volgorde dus omdraaien zonder dat de betekenis verandert.",
      "Om te beginnen heb je er twee nodig. De nominatief is het onderwerp, de accusatief is het lijdend voorwerp én alles wat na een voorzetsel komt. De andere naamvallen kunnen wachten.",
      "Bij mannelijke woorden gebeurt het meeste: ο φίλος wordt τον φίλο, want de -ς valt weg. Vrouwelijke woorden veranderen alleen van lidwoord, en onzijdige woorden veranderen helemaal niet.",
    ],
    table: {
      title: "Nominatief en accusatief",
      rows: [
        ["mannelijk op -ος", "ο φίλος → τον φίλο"],
        ["mannelijk op -ας", "ο άντρας → τον άντρα"],
        ["vrouwelijk", "η φίλη → τη φίλη"],
        ["onzijdig op -ο", "το βιβλίο → το βιβλίο"],
        ["na een voorzetsel", "για τον φίλο, με τη Μαρία"],
      ],
    },
    rules: [
      { title: "De -ς is het teken van het onderwerp", text: "Bij mannelijke woorden staat de -ς alleen in de nominatief. Zie je hem staan, dan is dat woord degene die de handeling verricht." },
      { title: "Na een voorzetsel altijd de accusatief", text: "Σε, από, με, για, χωρίς — na al deze woordjes komt de accusatief, zonder uitzondering." },
    ],
    examples: [
      { target: "Ο Γιάννης βλέπει τον Νίκο.", native: "Jannis ziet Nikos." },
      { target: "Τον Νίκο τον βλέπει ο Γιάννης.", native: "Nikos, díe ziet Jannis." },
      { target: "Αγοράζω ένα βιβλίο για τη μητέρα μου.", native: "Ik koop een boek voor mijn moeder." },
      { target: "Ο καφές είναι ζεστός.", native: "De koffie is heet." },
    ],
    pitfall: "Nederlanders letten op de volgorde en niet op de uitgang. In 'τον Νίκο βλέπει ο Γιάννης' staat Nikos vooraan, maar de -ς verraadt dat Jannis degene is die kijkt.",
    exercises: [
      { type: "fill", prompt: "Βλέπω ___ (ο φίλος).", answer: "τον φίλο", why: "Als lijdend voorwerp verliest het mannelijke woord zijn -ς." },
      { type: "choice", prompt: "Μιλάω με ___ Μαρία.", options: ["η", "τη", "της"], answer: "τη", why: "Na het voorzetsel με komt de accusatief." },
      { type: "transform", prompt: "Zet in de accusatief: ο άντρας", answer: "τον άντρα", why: "Mannelijke woorden op -ας verliezen in de accusatief hun -ς." },
      { type: "choice", prompt: "Wie kijkt er in 'Τη Μαρία τη βλέπει ο Κώστας'?", options: ["Μαρία", "Κώστας", "dat is niet te zien"], answer: "Κώστας", why: "Κώστας draagt de uitgang van de nominatief en is dus het onderwerp." },
      { type: "fill", prompt: "Το δώρο είναι για ___ (ο Νίκος).", answer: "τον Νίκο", why: "Για is een voorzetsel en vraagt om de accusatief." },
      { type: "transform", prompt: "Vertaal: Ik zoek de sleutel.", answer: "Ψάχνω το κλειδί.", why: "Onzijdige woorden zien er in de accusatief hetzelfde uit als in de nominatief." },
    ],
  },
  el04: {
    core: "De uitgang van een woord verraadt zijn geslacht, en diezelfde uitgang bepaalt hoe het meervoud eruitziet.",
    intro: [
      "Woorden op -ος, -ας en -ης zijn meestal mannelijk; woorden op -α en -η vrouwelijk; woorden op -ο, -ι en -μα onzijdig. Met die zes uitgangen dek je het overgrote deel van de woordenschat af.",
      "Het meervoud volgt daar rechtstreeks uit. Mannelijk -ος wordt -οι, terwijl -ας en -ης allebei -ες worden. Vrouwelijk -α en -η worden ook -ες. Onzijdig -ο wordt -α, -ι wordt -ια en -μα wordt -ματα.",
      "De klemtoon blijft meestal staan waar hij stond, maar hij mag nooit verder naar voren dan de derde lettergreep van achteren. Daarom is het το πρόβλημα maar των προβλημάτων: de tonos schuift een plaats op omdat het woord langer wordt.",
    ],
    table: {
      title: "Uitgang, geslacht en meervoud",
      rows: [
        ["-ος (m)", "ο δρόμος → οι δρόμοι"],
        ["-ας (m)", "ο άντρας → οι άντρες"],
        ["-ης (m)", "ο μαθητής → οι μαθητές"],
        ["-α (v)", "η ώρα → οι ώρες"],
        ["-η (v)", "η αδελφή → οι αδελφές"],
        ["-ο (o)", "το βουνό → τα βουνά"],
        ["-ι (o)", "το παιδί → τα παιδιά"],
        ["-μα (o)", "το πρόβλημα → τα προβλήματα"],
      ],
    },
    rules: [
      { title: "Onzijdig verraadt zichzelf", text: "Eindigt een woord op -ι of -μα, dan is het onzijdig. Uitzonderingen zijn er nauwelijks, en dat maakt το een veilige gok." },
      { title: "De klemtoon mag niet te ver naar voren", text: "Het Grieks accentueert nooit verder terug dan de derde lettergreep, dus schuift de tonos mee zodra er een lettergreep bij komt." },
    ],
    examples: [
      { target: "Οι δρόμοι είναι γεμάτοι κόσμο.", native: "De straten staan vol mensen." },
      { target: "Τα παιδιά τρώνε φρούτα.", native: "De kinderen eten fruit." },
      { target: "Έχουμε δύο προβλήματα.", native: "We hebben twee problemen." },
      { target: "Οι αδελφές μου μένουν στην Κρήτη.", native: "Mijn zussen wonen op Kreta." },
    ],
    pitfall: "Het is verleidelijk om overal -ες achter te plakken, zoals in het Nederlands overal -en gaat. Onzijdige woorden doen juist het omgekeerde: το βιβλίο wordt τα βιβλία, met een -α.",
    exercises: [
      { type: "transform", prompt: "Zet in het meervoud: ο δρόμος", answer: "οι δρόμοι", why: "Mannelijke woorden op -ος krijgen in het meervoud -οι." },
      { type: "transform", prompt: "Zet in het meervoud: το παιδί", answer: "τα παιδιά", why: "Onzijdige woorden op -ι krijgen -ια, en de klemtoon verspringt." },
      { type: "choice", prompt: "Welk geslacht heeft το μάθημα?", options: ["mannelijk", "vrouwelijk", "onzijdig"], answer: "onzijdig", why: "Woorden op -μα zijn altijd onzijdig." },
      { type: "fill", prompt: "η ώρα → οι ___", answer: "ώρες", why: "Vrouwelijke woorden op -α krijgen in het meervoud -ες." },
      { type: "choice", prompt: "Het meervoud van το πρόβλημα is…", options: ["τα προβλήματα", "οι προβλήμες", "τα προβλήμα"], answer: "τα προβλήματα", why: "Woorden op -μα krijgen de uitgang -ματα." },
      { type: "transform", prompt: "Zet in het meervoud: ο μαθητής", answer: "οι μαθητές", why: "Mannelijke woorden op -ης krijgen in het meervoud -ες." },
    ],
  },
  el05: {
    core: "Είμαι en έχω zijn de twee werkwoorden die je meteen nodig hebt, en allebei gaan ze hun eigen gang.",
    intro: [
      "Είμαι hoort bij de groep die op -μαι eindigt en volgt dus niet het gewone rijtje van -ω. Je leert hem het beste als één blok uit je hoofd, want je gebruikt hem in elke tweede zin.",
      "Έχω is juist volstrekt regelmatig: έχω, έχεις, έχει, έχουμε, έχετε, έχουν. Wat wél anders is dan bij ons, is wannéér je hem gebruikt.",
      "Het Grieks zegt namelijk 'ik ben' waar het Nederlands 'ik heb' zegt. Leeftijd is είμαι τριάντα χρονών, en honger en dorst hebben helemaal geen hulpwerkwoord nodig: πεινάω en διψάω zijn zelfstandige werkwoorden.",
    ],
    table: {
      title: "είμαι — tegenwoordige tijd",
      rows: [
        ["εγώ", "είμαι"],
        ["εσύ", "είσαι"],
        ["αυτός / αυτή / αυτό", "είναι"],
        ["εμείς", "είμαστε"],
        ["εσείς", "είστε"],
        ["αυτοί / αυτές / αυτά", "είναι"],
      ],
    },
    rules: [
      { title: "Είναι doet dubbel werk", text: "De derde persoon enkelvoud en meervoud zijn allebei είναι. Wie het onderwerp is haal je uit de zin, niet uit het werkwoord." },
      { title: "Ontkennen met δεν", text: "Δεν staat altijd vlak vóór het werkwoord: δεν είμαι, δεν έχω. Er komt niets tussen behalve een zwak voornaamwoord." },
    ],
    examples: [
      { target: "Είμαι από την Ολλανδία.", native: "Ik kom uit Nederland." },
      { target: "Δεν είμαστε έτοιμοι ακόμα.", native: "We zijn nog niet klaar." },
      { target: "Έχεις αδέλφια;", native: "Heb je broers of zussen?" },
      { target: "Είναι τριάντα χρονών.", native: "Hij is dertig jaar." },
    ],
    pitfall: "Voor 'ik heb honger' grijpen Nederlanders naar έχω. Het Grieks heeft daar één werkwoord voor: πεινάω. Hetzelfde geldt voor dorst, διψάω — maar gelijk hebben is wél έχω δίκιο.",
    exercises: [
      { type: "conjugate", verb: "είμαι", tense: "ενεστώτας", answers: ["είμαι", "είσαι", "είναι", "είμαστε", "είστε", "είναι"], why: "Είμαι volgt het rijtje op -μαι en heeft twee keer είναι." },
      { type: "conjugate", verb: "έχω", tense: "ενεστώτας", answers: ["έχω", "έχεις", "έχει", "έχουμε", "έχετε", "έχουν"], why: "Έχω is volledig regelmatig en volgt het gewone rijtje op -ω." },
      { type: "fill", prompt: "Εμείς ___ φοιτητές.", answer: "είμαστε", why: "Bij εμείς hoort de vorm είμαστε." },
      { type: "choice", prompt: "Αυτοί ___ στο σπίτι.", options: ["είναι", "είμαστε", "είσαι"], answer: "είναι", why: "De derde persoon meervoud is net als het enkelvoud είναι." },
      { type: "transform", prompt: "Vertaal: Ik heb geen tijd.", answer: "Δεν έχω χρόνο.", why: "Δεν staat vlak vóór het werkwoord, en χρόνος wordt in de accusatief χρόνο." },
      { type: "choice", prompt: "Πόσων χρονών ___;", options: ["είσαι", "έχεις", "κάνεις"], answer: "είσαι", why: "Leeftijd gaat in het Grieks met είμαι en niet met έχω." },
    ],
  },
  el06: {
    core: "Bij een regelmatig werkwoord op -ω verandert alleen de uitgang, en die uitgang zegt al wie er handelt.",
    intro: [
      "Γράφω, γράφεις, γράφει, γράφουμε, γράφετε, γράφουν. Dat rijtje geldt voor honderden werkwoorden, en zodra je het kent kun je bij elke nieuwe stam meteen zes vormen maken.",
      "Omdat de uitgang het onderwerp al aangeeft, laat het Grieks het persoonlijk voornaamwoord meestal weg. Γράφω is een complete zin; εγώ γράφω zeg je alleen als je nadruk wilt leggen.",
      "De tegenwoordige tijd dekt zowel 'ik schrijf' als 'ik ben aan het schrijven'. Er is geen aparte vorm voor iets dat nú bezig is, wat een stuk eenvoudiger is dan het Engels met zijn continuous.",
    ],
    table: {
      title: "γράφω — tegenwoordige tijd",
      rows: [
        ["εγώ", "γράφω"],
        ["εσύ", "γράφεις"],
        ["αυτός / αυτή / αυτό", "γράφει"],
        ["εμείς", "γράφουμε"],
        ["εσείς", "γράφετε"],
        ["αυτοί / αυτές / αυτά", "γράφουν"],
      ],
    },
    rules: [
      { title: "De klemtoon blijft op de stam", text: "Bij deze groep verspringt de tonos nooit: γράφω, γράφουμε, γράφουν. Verspringt hij wel, dan zit je in de groep van -άω." },
      { title: "Εσείς is ook de beleefde vorm", text: "De tweede persoon meervoud gebruik je tegen een groep én tegen iemand die je niet kent: τι θέλετε;" },
    ],
    examples: [
      { target: "Διαβάζω μια εφημερίδα.", native: "Ik lees een krant." },
      { target: "Τι κάνετε αύριο;", native: "Wat doet u morgen?" },
      { target: "Μένουμε κοντά στη θάλασσα.", native: "We wonen dicht bij de zee." },
      { target: "Δεν καταλαβαίνουν ελληνικά.", native: "Ze verstaan geen Grieks." },
    ],
    pitfall: "Nederlanders zetten uit gewoonte overal εγώ, εσύ en αυτός voor. In het Grieks klinkt dat alsof je iemand tegenspreekt: εγώ πληρώνω betekent 'ík betaal en jij niet'.",
    exercises: [
      { type: "conjugate", verb: "γράφω", tense: "ενεστώτας", answers: ["γράφω", "γράφεις", "γράφει", "γράφουμε", "γράφετε", "γράφουν"], why: "Alleen de uitgang verandert; de klemtoon blijft op de stam staan." },
      { type: "fill", prompt: "Εμείς ___ (μένω) στην Αθήνα.", answer: "μένουμε", why: "Bij εμείς hoort de uitgang -ουμε." },
      { type: "choice", prompt: "Αυτοί ___ πολύ γρήγορα.", options: ["διαβάζει", "διαβάζουν", "διαβάζουμε"], answer: "διαβάζουν", why: "De derde persoon meervoud krijgt de uitgang -ουν." },
      { type: "transform", prompt: "Vertaal: Ik ben een brief aan het schrijven.", answer: "Γράφω ένα γράμμα.", why: "Het Grieks heeft geen aparte vorm voor iets dat nu bezig is." },
      { type: "fill", prompt: "Τι ___ (κάνω) εσύ;", answer: "κάνεις", why: "Bij εσύ hoort de uitgang -εις." },
      { type: "choice", prompt: "Wanneer zeg je εγώ γράφω in plaats van γράφω?", options: ["altijd", "als je nadruk legt", "nooit"], answer: "als je nadruk legt", why: "Het voornaamwoord voeg je alleen toe wanneer je een tegenstelling bedoelt." },
    ],
  },
  el07: {
    core: "Een bijvoeglijk naamwoord neemt het geslacht, het getal en de naamval over van het woord waar het bij hoort.",
    intro: [
      "Καλός, καλή, καλό — dezelfde stam met drie uitgangen. Welke je pakt hangt volledig af van het zelfstandig naamwoord ernaast, en dus niet van wat je zelf wilt benadrukken.",
      "Dat werkt door in het meervoud (καλοί, καλές, καλά) en in de naamvallen: βλέπω έναν καλό φίλο. Het bijvoeglijk naamwoord schuift precies mee met het lidwoord, wat het onthouden makkelijker maakt dan het lijkt.",
      "Staat het bijvoeglijk naamwoord ná het werkwoord είμαι, dan buigt het nog steeds mee met het onderwerp: η σούπα είναι ζεστή, maar ο καφές είναι ζεστός.",
    ],
    table: {
      title: "καλός — de drie geslachten",
      rows: [
        ["mannelijk enkelvoud", "ο καλός φίλος"],
        ["vrouwelijk enkelvoud", "η καλή φίλη"],
        ["onzijdig enkelvoud", "το καλό παιδί"],
        ["mannelijk meervoud", "οι καλοί φίλοι"],
        ["vrouwelijk meervoud", "οι καλές φίλες"],
        ["onzijdig meervoud", "τα καλά παιδιά"],
      ],
    },
    rules: [
      { title: "Het staat vóór het zelfstandig naamwoord", text: "Net als bij ons: ένα μεγάλο σπίτι. Zet je het erachter met είμαι ertussen, dan wordt het een mededeling: το σπίτι είναι μεγάλο." },
      { title: "Πολύ verandert nooit", text: "Als versterking bij een bijvoeglijk naamwoord blijft πολύ altijd hetzelfde, ongeacht geslacht of getal: πολύ καλή, πολύ καλοί." },
    ],
    examples: [
      { target: "Είναι ένα πολύ ωραίο μέρος.", native: "Het is een heel mooie plek." },
      { target: "Η θάλασσα είναι κρύα σήμερα.", native: "De zee is koud vandaag." },
      { target: "Αγόρασα καινούρια παπούτσια.", native: "Ik heb nieuwe schoenen gekocht." },
      { target: "Οι δρόμοι είναι στενοί εδώ.", native: "De straten zijn hier smal." },
    ],
    pitfall: "In het Nederlands is 'een goed boek' en 'een goede vriend' bijna hetzelfde woord. In het Grieks moet je eerst het geslacht weten voordat je het bijvoeglijk naamwoord kunt opschrijven: καλό βιβλίο, maar καλός φίλος.",
    exercises: [
      { type: "fill", prompt: "Η σούπα είναι ___ (ζεστός).", answer: "ζεστή", why: "Σούπα is vrouwelijk, dus het bijvoeglijk naamwoord krijgt -ή." },
      { type: "choice", prompt: "Το σπίτι είναι ___.", options: ["μεγάλος", "μεγάλη", "μεγάλο"], answer: "μεγάλο", why: "Σπίτι is onzijdig, dus de uitgang is -ο." },
      { type: "transform", prompt: "Zet in het meervoud: ο καλός φίλος", answer: "οι καλοί φίλοι", why: "Het lidwoord en het bijvoeglijk naamwoord gaan allebei mee naar het meervoud." },
      { type: "fill", prompt: "Βλέπω έναν ___ (ωραίος) κήπο.", answer: "ωραίο", why: "In de accusatief verliest het mannelijke bijvoeglijk naamwoord zijn -ς." },
      { type: "choice", prompt: "Οι φίλες μου είναι ___.", options: ["καλοί", "καλές", "καλά"], answer: "καλές", why: "Φίλες is vrouwelijk meervoud, dus de uitgang is -ές." },
      { type: "transform", prompt: "Vertaal: Het is een heel oud huis.", answer: "Είναι ένα πολύ παλιό σπίτι.", why: "Πολύ verandert nooit, en παλιό richt zich naar het onzijdige σπίτι." },
    ],
  },
  el08: {
    core: "Het onderwerp zit al in de uitgang, dus een persoonlijk voornaamwoord voeg je alleen toe voor de nadruk.",
    intro: [
      "Εγώ, εσύ, αυτός, εμείς, εσείς, αυτοί bestaan allemaal, maar je hoort ze veel minder dan in het Nederlands. Θέλω καφέ is een complete zin; εγώ θέλω καφέ zegt: ík wil koffie, wat de rest doet weet ik niet.",
      "Waar je ze wél gebruikt is bij een tegenstelling, na een voorzetsel en als je in je eentje antwoordt zonder werkwoord: Ποιος θέλει; — Εγώ. Verder kun je ze rustig laten staan waar ze staan.",
      "Αυτός, αυτή en αυτό betekenen ook 'deze' en 'die'. Ze verwijzen dus niet alleen naar personen maar ook naar dingen, en ze buigen mee: αυτόν, αυτήν, αυτό.",
    ],
    table: {
      title: "De sterke voornaamwoorden",
      rows: [
        ["εγώ", "ik — εγώ πληρώνω"],
        ["εσύ", "jij — εσύ τι λες;"],
        ["αυτός / αυτή / αυτό", "hij / zij / het"],
        ["εμείς", "wij — εμείς φεύγουμε"],
        ["εσείς", "jullie, en ook u"],
        ["na een voorzetsel", "για μένα, με σένα, σε αυτόν"],
      ],
    },
    rules: [
      { title: "Εσείς is ook 'u'", text: "Tegen iemand die je niet kent gebruik je de meervoudsvorm: τι θέλετε να πιείτε; Onder jongeren gaat het meestal meteen over op εσύ." },
      { title: "Na een voorzetsel andere vormen", text: "Niet εγώ en εσύ maar μένα en σένα: για μένα, χωρίς εσένα, μαζί σου." },
    ],
    examples: [
      { target: "Εγώ μένω εδώ, εσύ πού μένεις;", native: "Ik woon hier, waar woon jij?" },
      { target: "Αυτό είναι για σένα.", native: "Dit is voor jou." },
      { target: "Εμείς φεύγουμε τώρα.", native: "Wij gaan nu weg." },
      { target: "Αυτή δουλεύει σε νοσοκομείο.", native: "Zij werkt in een ziekenhuis." },
    ],
    pitfall: "Wie elke zin met εγώ begint, klinkt in het Grieks alsof hij zichzelf voortdurend tegenover anderen zet. Laat het voornaamwoord weg tenzij je echt een tegenstelling bedoelt.",
    exercises: [
      { type: "choice", prompt: "Wat is de gewone manier om 'ik wil koffie' te zeggen?", options: ["Θέλω καφέ.", "Εγώ θέλω καφέ.", "Καφέ εγώ θέλω."], answer: "Θέλω καφέ.", why: "Zonder nadruk laat je het persoonlijk voornaamwoord weg." },
      { type: "fill", prompt: "Αυτό το δώρο είναι για ___ (εσύ).", answer: "σένα", why: "Na een voorzetsel gebruik je de vorm σένα." },
      { type: "choice", prompt: "Tegen een onbekende in een winkel zeg je…", options: ["Τι θέλεις;", "Τι θέλετε;", "Τι θέλουν;"], answer: "Τι θέλετε;", why: "De beleefde aanspreekvorm is de tweede persoon meervoud." },
      { type: "transform", prompt: "Vertaal: Wij vertrekken morgen.", answer: "Εμείς φεύγουμε αύριο.", why: "Hier zet je εμείς erbij, want je stelt jezelf tegenover de rest." },
      { type: "fill", prompt: "Ποιος θέλει παγωτό; — ___!", answer: "Εγώ", why: "In een antwoord zonder werkwoord staat het sterke voornaamwoord alleen." },
      { type: "choice", prompt: "Μίλησα με ___ χθες.", options: ["αυτός", "αυτόν", "αυτού"], answer: "αυτόν", why: "Na het voorzetsel με komt de accusatief αυτόν." },
    ],
  },
  el09: {
    core: "Bezit zet je áchter het woord met een klein onbeklemtoond woordje, en verder doet de genitief het werk.",
    intro: [
      "Το σπίτι μου, το σπίτι σου, το σπίτι του: het bezittelijk woordje komt ná het zelfstandig naamwoord en draagt geen eigen klemtoon. Het lidwoord blijft daarbij gewoon staan, anders dan in het Nederlands.",
      "Die woordjes zijn de genitiefvormen van de persoonlijke voornaamwoorden: μου, σου, του, της, μας, σας, τους. Του is van hem en της van haar, dus ze richten zich naar de bezitter en niet naar het bezit.",
      "Voor bezit door een naam of een ander zelfstandig naamwoord gebruik je de genitief van dat woord: το αυτοκίνητο του Γιάννη, η πόρτα του σπιτιού. Het bezit staat vooraan, de bezitter erachter.",
    ],
    table: {
      title: "Bezit",
      rows: [
        ["van mij", "το σπίτι μου"],
        ["van jou", "το σπίτι σου"],
        ["van hem", "το σπίτι του"],
        ["van haar", "το σπίτι της"],
        ["van ons", "το σπίτι μας"],
        ["van een naam", "το σπίτι του Γιάννη"],
      ],
    },
    rules: [
      { title: "Het lidwoord blijft staan", text: "Je zegt το όνομά μου, niet όνομά μου. Waar het Nederlands het lidwoord vervangt door 'mijn', zet het Grieks ze allebei neer." },
      { title: "Soms een tweede tonos", text: "Ligt de klemtoon op de derde lettergreep van achteren, dan komt er een extra accent bij: το όνομά μου, ο δάσκαλός μου." },
    ],
    examples: [
      { target: "Το όνομά μου είναι Άννα.", native: "Mijn naam is Anna." },
      { target: "Η αδελφή της μένει στη Θεσσαλονίκη.", native: "Haar zus woont in Thessaloniki." },
      { target: "Αυτό είναι το αυτοκίνητο του Γιάννη.", native: "Dit is de auto van Jannis." },
      { target: "Τα παιδιά τους πάνε σχολείο.", native: "Hun kinderen gaan naar school." },
    ],
    pitfall: "Nederlanders zetten het bezittelijk woord vooraan en laten het lidwoord weg, precies zoals in 'mijn huis'. In het Grieks zijn dat twee fouten in één: het moet το σπίτι μου.",
    exercises: [
      { type: "fill", prompt: "Πώς είναι το όνομα ___; (van jou)", answer: "σου", why: "Het bezittelijk woordje komt achter het zelfstandig naamwoord." },
      { type: "choice", prompt: "Η μητέρα ___ μαγειρεύει καλά. (van hem)", options: ["του", "της", "τους"], answer: "του", why: "Του richt zich naar de bezitter, en die is hier mannelijk." },
      { type: "transform", prompt: "Vertaal: mijn huis", answer: "το σπίτι μου", why: "Het lidwoord blijft staan en het bezit komt erachter." },
      { type: "fill", prompt: "Αυτό είναι το ποδήλατο ___ Νίκου.", answer: "του", why: "Bezit door een naam gaat via de genitief, hier met του." },
      { type: "choice", prompt: "Τα βιβλία ___ είναι στο τραπέζι. (van ons)", options: ["μου", "μας", "σας"], answer: "μας", why: "Μας is de genitiefvorm die bij εμείς hoort." },
      { type: "transform", prompt: "Vertaal: Haar broer werkt in Athene.", answer: "Ο αδελφός της δουλεύει στην Αθήνα.", why: "Της staat achter αδελφός en verwijst naar een vrouwelijke bezitter." },
    ],
  },
  el10: {
    core: "Een vraag herken je aan het vraagwoord en aan de toon — de woordvolgorde hoef je niet om te draaien.",
    intro: [
      "Τι, πού, πώς, πότε, ποιος, γιατί en πόσο staan vooraan, en daarna volgt de zin zoals hij ook zonder vraag zou luiden: πού μένεις; Er komt geen hulpwerkwoord bij, zoals het Engels dat met do doet.",
      "Ook zonder vraagwoord kan een gewone zin een vraag worden. Θέλεις καφέ; heeft precies dezelfde volgorde als de mededeling — alleen je stem gaat omhoog, en aan het eind staat een Grieks vraagteken.",
      "Dat vraagteken ziet eruit als onze puntkomma. De puntkomma zelf wordt geschreven als een punt boven de regel, en dat is meteen de grootste valstrik van de Griekse interpunctie.",
    ],
    table: {
      title: "De vraagwoorden",
      rows: [
        ["τι", "wat"],
        ["πού", "waar"],
        ["πώς", "hoe"],
        ["πότε", "wanneer"],
        ["ποιος / ποια / ποιο", "wie, welke"],
        ["γιατί", "waarom"],
        ["πόσο / πόσα", "hoeveel"],
      ],
    },
    rules: [
      { title: "Πού en πώς dragen een tonos", text: "Als vraagwoord krijgen ze een accent. Zonder accent betekent που 'die' of 'dat' en πως 'dat' — hetzelfde woord in een heel andere rol." },
      { title: "Ποιος buigt mee", text: "Het is ποιος άντρας, ποια γυναίκα, ποιο παιδί — en als lijdend voorwerp ποιον: ποιον βλέπεις;" },
    ],
    examples: [
      { target: "Πού μένεις;", native: "Waar woon je?" },
      { target: "Τι ώρα είναι;", native: "Hoe laat is het?" },
      { target: "Γιατί δεν ήρθες χθες;", native: "Waarom ben je gisteren niet gekomen?" },
      { target: "Πόσο κάνει αυτό;", native: "Hoeveel kost dit?" },
    ],
    pitfall: "Het Griekse vraagteken is een puntkomma. Wie een zin afsluit met een gewoon vraagteken valt meteen op, en wie een ; als puntkomma leest, denkt dat er een vraag staat waar er geen is.",
    exercises: [
      { type: "fill", prompt: "___ μένεις; (waar)", answer: "Πού", why: "Als vraagwoord krijgt πού een tonos." },
      { type: "choice", prompt: "___ ώρα φεύγει το τρένο;", options: ["Τι", "Πού", "Γιατί"], answer: "Τι", why: "Naar een tijdstip vraag je met τι ώρα." },
      { type: "choice", prompt: "Hoe sluit je een Griekse vraag af?", options: ["met een vraagteken", "met een puntkomma", "met een dubbele punt"], answer: "met een puntkomma", why: "Het Griekse vraagteken heeft de vorm van onze puntkomma." },
      { type: "transform", prompt: "Vertaal: Hoe heet je?", answer: "Πώς σε λένε;", why: "Letterlijk 'hoe noemen ze je', een vaste uitdrukking met πώς." },
      { type: "fill", prompt: "___ βλέπεις; (wie, als lijdend voorwerp)", answer: "Ποιον", why: "Ποιος buigt mee en wordt als lijdend voorwerp ποιον." },
      { type: "choice", prompt: "Πόσο ___ αυτό το βιβλίο;", options: ["κάνει", "είναι", "έχει"], answer: "κάνει", why: "Naar de prijs vraag je met πόσο κάνει." },
    ],
  },
};

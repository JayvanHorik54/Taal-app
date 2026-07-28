import type { PlacementItem } from "../types.ts";

/**
 * Zes vragen per niveau voor de niveautest. Gekozen op wat écht onderscheidt
 * tussen niveaus bij Nederlandstaligen — het geslacht, de naamval na een
 * voorzetsel, het verschil tussen de twee verleden tijden en de να-zin — en
 * niet op wat toevallig moeilijke woorden zijn.
 */
export const placement: PlacementItem[] = [
  /* ── A1 ─────────────────────────────────────────────────── */
  {
    level: "A1",
    prompt: "Η μητέρα μου ___ στην κουζίνα.",
    options: ["είμαι", "είναι", "είμαστε"],
    answer: "είναι",
    why: "Bij een onderwerp in het enkelvoud hoort de vorm είναι.",
  },
  {
    level: "A1",
    prompt: "___ σπίτι είναι μεγάλο.",
    options: ["Ο", "Η", "Το"],
    answer: "Το",
    why: "Σπίτι is onzijdig en krijgt dus het lidwoord το.",
  },
  {
    level: "A1",
    prompt: "Εμείς ___ στην Ολλανδία.",
    options: ["μένω", "μένεις", "μένουμε"],
    answer: "μένουμε",
    why: "Bij εμείς hoort de uitgang -ουμε.",
  },
  {
    level: "A1",
    prompt: "Αγοράζω ___ ψωμί.",
    options: ["ένας", "μία", "ένα"],
    answer: "ένα",
    why: "Ψωμί is onzijdig, dus het onbepaald lidwoord is ένα.",
  },
  {
    level: "A1",
    prompt: "Το βιβλίο ___ είναι στο τραπέζι. (van mij)",
    options: ["μου", "μας", "του"],
    answer: "μου",
    why: "Het bezittelijk woordje staat achter het zelfstandig naamwoord.",
  },
  {
    level: "A1",
    prompt: "___ είναι το όνομά σου;",
    options: ["Πού", "Ποιο", "Πόσο"],
    answer: "Ποιο",
    why: "Ποιο buigt mee met het onzijdige όνομα en vraagt naar welk.",
  },

  /* ── A2 ─────────────────────────────────────────────────── */
  {
    level: "A2",
    prompt: "Χθες ___ στο σινεμά.",
    options: ["πηγαίνω", "πήγα", "θα πάω"],
    answer: "πήγα",
    why: "Χθες is afgesloten, dus gebruik je de aoristos.",
  },
  {
    level: "A2",
    prompt: "Αύριο ___ στη δουλειά με το ποδήλατο.",
    options: ["πηγαίνω", "πήγα", "θα πάω"],
    answer: "θα πάω",
    why: "De toekomst maak je met θα plus de stam van de aoristos.",
  },
  {
    level: "A2",
    prompt: "Κάθε μέρα ___ καφέ στο μπαλκόνι.",
    options: ["ήπια", "έπινα", "πίνω"],
    answer: "πίνω",
    why: "Een gewoonte in het heden staat in de tegenwoordige tijd.",
  },
  {
    level: "A2",
    prompt: "Μιλάω ___ τηλέφωνο αυτή τη στιγμή.",
    options: ["σε", "στο", "από"],
    answer: "στο",
    why: "Σε smelt samen met het lidwoord το tot στο.",
  },
  {
    level: "A2",
    prompt: "___ μου το αλάτι, σε παρακαλώ.",
    options: ["Δίνω", "Δώσε", "Δίνεις"],
    answer: "Δώσε",
    why: "Een verzoek gaat in de gebiedende wijs, en die is hier δώσε.",
  },
  {
    level: "A2",
    prompt: "Τον Νίκο ___ είδα χθες το βράδυ.",
    options: ["τον", "του", "της"],
    answer: "τον",
    why: "Het zwakke voornaamwoord herhaalt het lijdend voorwerp en staat in de accusatief.",
  },

  /* ── B1 ─────────────────────────────────────────────────── */
  {
    level: "B1",
    prompt: "Θέλω ___ πάω στην Ελλάδα το καλοκαίρι.",
    options: ["να", "θα", "που"],
    answer: "να",
    why: "Het Grieks heeft geen infinitief; na θέλω volgt een να-zin.",
  },
  {
    level: "B1",
    prompt: "Μην ___ τόσο δυνατά, κοιμούνται τα παιδιά.",
    options: ["μιλάς", "μιλάει", "μίλησα"],
    answer: "μιλάς",
    why: "Bij een verbod gebruik je μην met de persoonsvorm van de aangesprokene.",
  },
  {
    level: "B1",
    prompt: "Αυτό το βουνό είναι ___ ψηλό από το άλλο.",
    options: ["πιο", "πολύ", "πάρα"],
    answer: "πιο",
    why: "De vergrotende trap maak je met πιο vóór het bijvoeglijk naamwoord.",
  },
  {
    level: "B1",
    prompt: "Έχω ήδη ___ το γράμμα.",
    options: ["γράφει", "γράψει", "γράψω"],
    answer: "γράψει",
    why: "De voltooide tijd is έχω plus de onveranderlijke vorm op -ει.",
  },
  {
    level: "B1",
    prompt: "Αν ___ χρόνο αύριο, θα περάσω από το γραφείο.",
    options: ["έχω", "είχα", "έχεις"],
    answer: "έχω",
    why: "Bij een reële voorwaarde volgt na αν de tegenwoordige tijd.",
  },
  {
    level: "B1",
    prompt: "Το αυτοκίνητο ___ αδελφού μου είναι καινούριο.",
    options: ["το", "του", "τον"],
    answer: "του",
    why: "Bezit door een zelfstandig naamwoord gaat via de genitief.",
  },

  /* ── B2 ─────────────────────────────────────────────────── */
  {
    level: "B2",
    prompt: "Ο άνθρωπος ___ ήρθε χθες είναι γιατρός.",
    options: ["που", "ποιος", "όποιος"],
    answer: "που",
    why: "Που is het onveranderlijke betrekkelijk voornaamwoord van het Grieks.",
  },
  {
    level: "B2",
    prompt: "___ την πόρτα, είδε ότι το φως ήταν αναμμένο.",
    options: ["Ανοίγοντας", "Ανοιγμένος", "Ανοίγει"],
    answer: "Ανοίγοντας",
    why: "Het deelwoord op -οντας beschrijft een handeling die gelijktijdig gebeurt.",
  },
  {
    level: "B2",
    prompt: "Το σπίτι χτίστηκε ___ τον παππού μου.",
    options: ["από", "με", "για"],
    answer: "από",
    why: "In de lijdende vorm noem je de handelende persoon met από.",
  },
  {
    level: "B2",
    prompt: "Μου είπε ότι ___ την επόμενη μέρα.",
    options: ["θα έρθει", "θα ερχόταν", "ήρθε"],
    answer: "θα ερχόταν",
    why: "In de indirecte rede over het verleden schuift θα έρθει door naar θα ερχόταν.",
  },
  {
    level: "B2",
    prompt: "Παρόλο ___ έβρεχε, βγήκαμε για περπάτημα.",
    options: ["που", "ότι", "γιατί"],
    answer: "που",
    why: "Παρόλο που is de vaste combinatie voor 'hoewel'.",
  },
  {
    level: "B2",
    prompt: "___ δεν ήρθε στο πάρτι τελικά.",
    options: ["Κανένας", "Κάποιος", "Όποιος"],
    answer: "Κανένας",
    why: "Bij een ontkenning met δεν hoort κανένας; het Grieks ontkent dubbel.",
  },

  /* ── C1 ─────────────────────────────────────────────────── */
  {
    level: "C1",
    prompt: "___ πάση περιπτώσει, θα σε ενημερώσω αύριο.",
    options: ["Εν", "Σε", "Με"],
    answer: "Εν",
    why: "Εν πάση περιπτώσει is een versteende uitdrukking met een oude naamval.",
  },
  {
    level: "C1",
    prompt: "Όταν ___ το βιβλίο, θα σου το δώσω.",
    options: ["διαβάζω", "διαβάσω", "θα διαβάσω"],
    answer: "διαβάσω",
    why: "Na όταν staat bij een afgeronde handeling de stam van de aoristos, zonder θα.",
  },
  {
    level: "C1",
    prompt: "___ με ενόχλησε περισσότερο ήταν ο θόρυβος.",
    options: ["Αυτό που", "Ό,τι που", "Ποιο"],
    answer: "Αυτό που",
    why: "Voor nadruk begin je met αυτό που; de combinatie ό,τι που bestaat niet.",
  },
  {
    level: "C1",
    prompt: "___ προσπάθησε πολύ, δεν τα κατάφερε.",
    options: ["Μολονότι", "Επειδή", "Ώστε"],
    answer: "Μολονότι",
    why: "Μολονότι is het formele woord voor 'hoewel' en leidt een toegeving in.",
  },
  {
    level: "C1",
    prompt: "Σας ___ να παρευρεθείτε στην εκδήλωση της Τρίτης.",
    options: ["καλούμε", "φωνάζουμε", "λέμε"],
    answer: "καλούμε",
    why: "In formeel Grieks nodig je uit met καλώ; φωνάζω hoort bij de spreektaal.",
  },
  {
    level: "C1",
    prompt: "___ λίγη υπομονή και θα τα καταφέρεις.",
    options: ["Κάνε", "Βάλε", "Πάρε"],
    answer: "Κάνε",
    why: "Κάνω υπομονή is de vaste combinatie voor geduld hebben.",
  },
];

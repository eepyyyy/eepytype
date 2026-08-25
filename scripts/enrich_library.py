#!/usr/bin/env python3
"""
Enrichment and Filter Script for eepytype Practice Library.
1. Removes irrelevant entries (discographies, band pages, award ceremonies, TV show lists).
2. Adds ~500+ rich encyclopedic topics across Medicine, Law, Art, Engineering, Nature, Literature, Philosophy, Science, History, Technology.
3. Formats catalog and static practice_texts.json.
"""

import concurrent.futures
import json
import os
import re
import urllib.parse
import urllib.request
from typing import Any, Dict, List, Optional, Set

ROOT_DIR = os.path.dirname(os.path.dirname(__file__))
PRACTICE_FILE_PATH = os.path.join(
    ROOT_DIR, "frontend", "static", "practice", "practice_texts.json"
)
CATALOG_FILE_PATH = os.path.join(ROOT_DIR, "PRACTICE_CATALOG.md")

USER_AGENT = "EepytypeLibraryEnricher/2.0 (https://github.com/eepyyyy/eepytype)"

EXCLUDE_PATTERNS = [
    r"\bdiscography\b",
    r"\bfilmography\b",
    r"\bband\b",
    r"\balbum\b",
    r"\bsong\b",
    r"\bseason\b",
    r"\bepisode\b",
    r"\baward for best\b",
    r"\bacademy award\b",
    r"\bgrammy\b",
    r"\bchart history\b",
    r"\bfootball\b",
    r"\bschool\b",
]

TARGETED_ENRICHMENT: Dict[str, List[str]] = {
    "art": [
        "Renaissance painting", "Fresco", "Baroque painting", "Rococo art",
        "Neoclassical architecture", "Romanticism in art", "Academic art", "Pre-Raphaelite Brotherhood",
        "Post-Impressionist art", "Pointillism", "Synthetism", "Les Nabis",
        "Fauvist movement", "Die Brücke", "Der Blaue Reiter", "Cubist sculpture",
        "Futurism (art)", "Suprematism", "Constructivism (art)", "De Stijl",
        "Dadaism", "Surrealist painting", "Abstract expressionist painting", "Color field",
        "Action painting", "Lyrical abstraction", "Hard-edge painting", "Pop art movement",
        "Op art", "Minimalist sculpture", "Arte Povera", "Land art movement",
        "Installation artwork", "Conceptual artwork", "Neo-expressionism", "Photorealism",
        "Gothic cathedral", "Romanesque church architecture", "Byzantine mosaic", "Islamic geometric patterns",
        "Renaissance sculpture", "Bronze casting", "Marble carving", "Relief sculpture",
        "Woodcut printmaking", "Etching technique", "Mezzotint", "Aquatint",
        "Lithography printing", "Screen printing", "Daguerreotype", "Calotype",
        "Pictorialism", "Straight photography", "Documentary photography", "Cinematography aesthetics",
        "Mise-en-scène theory", "Film montage", "Auteur theory", "Color harmony in painting",
        "Linear perspective in art", "Aerial perspective", "Chiaroscuro painting", "Sfumato technique",
        "Tenebrism", "Impasto", "Glazing (painting)", "Grisaille",
        "Polyphonic music", "Counterpoint in music", "Fugue structure", "Sonata form",
        "Symphonic form", "Concerto grosso", "String quartet composition", "Opera buffa",
        "Opera seria", "Bel canto singing", "Leitmotif technique", "Gregorian chant",
        "Renaissance polyphony", "Madrigal music", "Twelve-tone technique", "Serialism in music",
        "Minimalist music", "Avant-garde music", "Microtonality", "Acoustic resonance in architecture"
    ],
    "medicine": [
        "Cardiovascular hemodynamics", "Cardiac action potential", "Coronary circulation", "Atherosclerosis pathogenesis",
        "Myocardial infarction pathophysiology", "Cardiac arrhythmia", "Heart failure pathophysiology", "Microvascular circulation",
        "Gas exchange in lungs", "Pulmonary surfactant", "Ventilation-perfusion ratio", "Chronic obstructive pulmonary disease",
        "Acute respiratory distress syndrome", "Glomerular filtration rate", "Renin-angiotensin system", "Tubular reabsorption",
        "Renal clearance", "Nephron physiology", "Acid-base homeostasis physiology", "Electrolyte balance in physiology",
        "Synaptic transmission", "Action potential propagation", "Myelin sheath conduction", "Neurotransmitter release",
        "GABA receptor pharmacology", "Glutamate receptor physiology", "Dopaminergic pathways", "Serotonergic system",
        "Blood-brain barrier transport", "Neurogenesis in adults", "Neurodegenerative disease mechanisms", "Alzheimer's disease neuropathology",
        "Parkinson's disease neuropathology", "Innate immune response", "Adaptive immune system", "Antigen presentation",
        "Major histocompatibility complex", "T cell activation", "B cell differentiation", "Immunoglobulin structure",
        "Complement system cascade", "Cytokine signaling", "Autoimmunity mechanisms", "Type I hypersensitivity",
        "Phagocytosis mechanism", "Inflammatory cascade", "Wound healing stages", "Hemostasis and thrombosis",
        "Coagulation cascade pathways", "Fibrinolysis mechanism", "Platelet activation mechanism", "Angiogenesis physiology",
        "Oncogene activation", "Tumor suppressor gene function", "Apoptosis signaling pathways", "Cell cycle checkpoints",
        "DNA damage response pathways", "Cancer metastasis biology", "Pharmacokinetics principles", "Drug metabolism pathways",
        "Cytochrome P450 enzymes", "Pharmacodynamics receptor theory", "Antimicrobial resistance mechanisms", "Bacterial cell wall synthesis",
        "Viral replication cycle", "Retrovirus life cycle", "Vaccine immunology", "Monoclonal antibody therapy"
    ],
    "law": [
        "Constitutional supremacy", "Judicial independence", "Doctrine of precedent", "Ratio decidendi",
        "Obiter dictum", "Substantive due process", "Procedural due process", "Equal protection jurisprudence",
        "Strict scrutiny standard", "Intermediate scrutiny standard", "Rational basis review", "Non-delegation doctrine",
        "Chevron deference", "Administrative Procedure Act", "Writ of certiorari", "Writ of mandamus",
        "Writ of prohibition", "Injunctions in equity", "Specific performance remedy", "Promissory estoppel",
        "Consideration in contract law", "Breach of contract remedies", "Doctrine of frustration in contract", "Tortious negligence",
        "Duty of care in tort law", "Proximate cause in tort law", "Res ipsa loquitur", "Vicarious liability doctrine",
        "Strict products liability", "Defamation law principles", "Adverse possession doctrine", "Eminent domain power",
        "Easement in property law", "Fee simple estate", "Rule against perpetuities", "Bona fide purchaser doctrine",
        "Mens rea requirements", "Actus reus principles", "Inchoate offenses", "Self-defense jurisprudence",
        "Exclusionary rule in criminal procedure", "Miranda warning jurisprudence", "Search and seizure doctrine", "Hearsay rule and exceptions",
        "Attorney-client privilege doctrine", "Work-product doctrine", "Subject-matter jurisdiction", "Personal jurisdiction doctrine",
        "Forum non conveniens", "Res judicata doctrine", "Collateral estoppel doctrine", "Public international law sources",
        "Customary international law", "Jus cogens norms", "State sovereignty in international law", "State immunity doctrine",
        "International humanitarian law principles", "Non-refoulement obligation", "Universal jurisdiction doctrine", "International commercial arbitration"
    ],
    "engineering": [
        "Euler-Bernoulli beam theory", "Timoshenko beam theory", "Mohr's circle for stress", "Von Mises yield criterion",
        "Tresca yield criterion", "Finite volume method", "Computational fluid dynamics algorithms", "Boundary element method",
        "Continuum mechanics principles", "Thermoelasticity", "Viscoelasticity in materials", "Creep in metals",
        "Stress concentration factor", "Linear elastic fracture mechanics", "Stress intensity factor", "Fatigue crack growth",
        "Buckling of columns", "Thermal conductivity in solids", "Transient heat conduction", "Laminar boundary layer theory",
        "Turbulent boundary layer", "Compressible flow dynamics", "Shock wave aerodynamics", "Prandtl-Meyer expansion fan",
        "Supercritical airfoil aerodynamics", "Ramjet propulsion physics", "Scramjet combustion dynamics", "Rocket nozzle design",
        "De Laval nozzle flow", "Specific impulse thermodynamics", "Orbital mechanics maneuvers", "Hohmann transfer orbit",
        "Lagrange points dynamics", "Spacecraft attitude control", "Control-moment gyroscope", "State-space representation",
        "Root locus control method", "Bode plot frequency analysis", "Nyquist stability criterion", "Linear-quadratic regulator",
        "Model predictive control", "Adaptive control systems", "Digital signal filtering algorithms", "Phase-locked loop circuits",
        "Operational amplifier feedback", "Switch-mode power supply topology", "Buck converter electronics", "Boost converter circuits",
        "Three-phase electric power systems", "Synchronous generator dynamics", "Induction motor torque characteristics", "Photovoltaic cell physics",
        "Lithium-ion battery electrochemistry", "Proton-exchange membrane fuel cells", "Nuclear thermal hydraulics", "Prestressed concrete engineering",
        "Geotechnical soil mechanics", "Earthquake resistant structural design", "Base isolation engineering", "Seawater reverse osmosis desalination"
    ],
    "nature": [
        "Pelagic zone ecology", "Benthic zone biology", "Hydrothermal vent extremophiles", "Cold seep communities",
        "Chemosynthesis in deep sea", "Ocean thermohaline circulation", "Upwelling ocean dynamics", "Kelp forest trophic dynamics",
        "Mangrove swamp ecology", "Seagrass meadow ecosystem", "Bioluminescent marine organisms", "Cephalopod camouflage physiology",
        "Coral-zooxanthellae symbiosis", "Ocean carbonate chemistry", "Arctic tundra permafrost dynamics", "Taiga boreal forest ecology",
        "Temperate deciduous forest ecology", "Tropical dry forest ecology", "Savanna fire ecology", "Desert adaptation in xerophytes",
        "Succulent plant water conservation", "Crassulacean acid metabolism", "Mycorrhizal network communication", "Nitrogen-fixing root nodules",
        "Plant defense against herbivory", "Phytohormone signaling cascades", "Auxin polar transport", "Circadian rhythms in plants",
        "Seed dormancy and germination physiology", "Avian magnetic reception", "Bird migration navigational cues", "Mammalian echolocation physics",
        "Eusociality in insects", "Pheromone chemical communication", "Batesian mimicry evolution", "Müllerian mimicry evolutionary dynamics",
        "Aposematism in animals", "Speciation through polyploidy", "Allopatric speciation mechanisms", "Sympatric speciation models",
        "Island biogeography equilibrium theory", "Metapopulation dynamics in ecology", "Ecological niche differentiation", "Competitive exclusion principle",
        "Trophic cascade top-down control", "Keystone predator ecology", "Soil microbiome nutrient cycling", "Glacial geomorphology landforms",
        "Karst topography hydrology", "Volcanic caldera formation", "Plate subduction zone dynamics", "Mantle plume hot spot volcanism"
    ],
    "literature": [
        "Homeric simile in epic poetry", "Dactylic hexameter meter", "Greek chorus in classical tragedy", "Aristotelian catharsis",
        "Hamartia in dramatic tragedy", "Anagnorisis in drama", "Peripeteia dramatic reversal", "Elizabethan blank verse",
        "Shakespearean sonnet structure", "Petrarchan sonnet tradition", "Metaphysical conceit in poetry", "Augustan heroic couplet",
        "Gothic romantic sublime", "Negative capability poetics", "Wordsworthian pantheism in poetry", "Byronic hero archetype",
        "Transcendentalist philosophy in literature", "Stream of consciousness modernist technique", "Free indirect discourse narrative", "Unreliable first-person narrator",
        "Epiphany in modernist fiction", "Objective correlative poetics", "Imagism poetic movement", "Absurdist theatre dialogue",
        "Magic realist narrative structure", "Postmodern metafiction devices", "Pastiche in postmodern literature", "Intertextuality in literary theory",
        "Deconstructive literary reading", "Dialogism in novelistic discourse", "Carnivalesque in literature", "Narrative focalization theory",
        "Structuralist narratology models", "Archetypal literary criticism", "Bildungsroman developmental arc", "Epistolary novel narrative form",
        "Satirical irony in prose", "Parody in narrative literature", "Gothic horror psychological themes", "Dystopian fiction socio-political critique",
        "Existentialist themes in 20th century novels", "Magical realist Latin American fiction", "Stream of consciousness in Virginia Woolf", "Modernist alienation in Franz Kafka"
    ],
    "philosophy": [
        "Socratic elenchus method", "Platonic theory of Forms", "Aristotelian four causes", "Aristotelian hylomorphism",
        "Epicurean atomism and tranquility", "Stoic dichotomy of control", "Pyrrhonian skepticism epoché", "Augustinian divine illumination",
        "Ontological argument of Anselm", "Aquinas Five Ways for God", "Occam's razor nominalism", "Cartesian methodological skepticism",
        "Spinoza substance monism and pantheism", "Leibniz monadology theory", "Lockean tabula rasa empiricism", "Berkeley subjective idealism",
        "Hume problem of causation", "Hume is-ought distinction", "Kantian synthetic a priori judgments", "Kantian transcendental idealism",
        "Kantian categorical imperative duty", "Hegelian dialectical idealism", "Kierkegaardian leap of faith", "Nietzschean will to power",
        "Nietzschean master-slave morality", "Peircean pragmatic maxim", "Jamesian radical empiricism", "Deweyan instrumentalism epistemology",
        "Husserlian phenomenological reduction", "Heideggerian Dasein in Being and Time", "Sartrean existence precedes essence", "Camus myth of Sisyphus absurdism",
        "Wittgensteinian picture theory of language", "Wittgensteinian language-games concept", "Russell theory of definite descriptions", "Quinean two dogmas of empiricism",
        "Sellars myth of the given", "Rawlsian veil of ignorance justice", "Nozickian entitlement theory of justice", "Parfitian personal identity reductionism"
    ],
    "history": [
        "Neolithic agricultural transition", "Sumerian cuneiform state formation", "Old Kingdom Egyptian pyramid construction", "Code of Hammurabi Babylonian jurisprudence",
        "Minoan Bronze Age civilization", "Mycenaean palatial economy", "Assyrian imperial administration", "Achaemenid Persian satrapy system",
        "Athenian direct democracy institutions", "Peloponnesian War geopolitical rivalry", "Hellenistic empire fragmentation", "Roman Republican constitutional system",
        "Punic Wars Mediterranean hegemony", "Pax Romana administrative stability", "Crisis of the Third Century Rome", "Constantinian Christian transformation",
        "Fall of the Western Roman Empire", "Justinian Corpus Juris Civilis", "Early Islamic Caliphate expansion", "Abbasid House of Wisdom scholarship",
        "Carolingian Renaissance culture", "Feudal vassalage land tenure", "High Middle Ages commercial revolution", "Investiture Controversy church and state",
        "Crusader States Eastern Mediterranean", "Mongol Empire Pax Mongolica trade", "Black Death demographic transition", "Italian Renaissance humanist revival",
        "Ottoman conquest of Constantinople", "Age of Discovery Atlantic navigation", "Protestant Reformation religious transformation", "Treaty of Westphalia sovereign statehood",
        "Scientific Revolution empirical method", "Enlightenment political philosophy", "Industrial Revolution steam mechanization", "French Revolution constitutional upheaval",
        "Napoleonic legal codification", "Meiji Restoration industrial modernization", "Scramble for Africa imperial partition", "World War I trench warfare diplomacy"
    ]
}

def calculate_difficulty(text: str) -> Dict[str, Any]:
    words = re.findall(r"\b\w+\b", text)
    word_count = len(words)
    char_count = len(text)
    if word_count == 0:
        return {"wordCount": 0, "charCount": char_count, "avgWordLength": 0.0, "difficulty": "easy"}

    avg_len = sum(len(w) for w in words) / word_count
    if avg_len < 5.0:
        difficulty = "easy"
    elif avg_len < 5.7:
        difficulty = "medium"
    elif avg_len < 6.3:
        difficulty = "hard"
    else:
        difficulty = "expert"

    return {"wordCount": word_count, "charCount": char_count, "avgWordLength": round(avg_len, 1), "difficulty": difficulty}

def clean_text(text: str) -> str:
    cleaned = re.sub(r"\[\d+\]|\[citation needed\]|\[edit\]", "", text)
    cleaned = re.sub(r"\(/[^)]+/\)", "", cleaned)
    cleaned = cleaned.replace("“", '"').replace("”", '"').replace("’", "'").replace("‘", "'")
    cleaned = cleaned.replace("—", " - ").replace("–", "-")
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned

def fetch_wikipedia_entry(title: str, category: str) -> Optional[Dict[str, Any]]:
    encoded_title = urllib.parse.quote(title.replace(" ", "_"))
    url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{encoded_title}"

    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
            with urllib.request.urlopen(req, timeout=12) as resp:
                if resp.status == 200:
                    data = json.loads(resp.read().decode("utf-8"))
                    if data.get("type") == "disambiguation":
                        return None
                    extract = data.get("extract", "")
                    cleaned = clean_text(extract)
                    if len(cleaned) < 90 or "may refer to" in cleaned or cleaned.endswith("refer to:"):
                        return None

                    page_title = data.get("title", title)
                    # Filter out excluded titles
                    for pat in EXCLUDE_PATTERNS:
                        if re.search(pat, page_title, re.IGNORECASE):
                            return None

                    metrics = calculate_difficulty(cleaned)
                    slug_id = re.sub(r"[^a-z0-9]+", "-", f"{category}-{page_title}".lower()).strip("-")

                    return {
                        "id": slug_id,
                        "title": page_title,
                        "category": category,
                        "difficulty": metrics["difficulty"],
                        "wordCount": metrics["wordCount"],
                        "charCount": metrics["charCount"],
                        "avgWordLength": metrics["avgWordLength"],
                        "author": "Wikipedia",
                        "source": f"Wikipedia ({page_title})",
                        "text": cleaned
                    }
        except Exception:
            pass
    return None

def is_valid_entry(entry: Dict[str, Any]) -> bool:
    title = entry.get("title", "")
    for pat in EXCLUDE_PATTERNS:
        if re.search(pat, title, re.IGNORECASE):
            return False
    text = entry.get("text", "")
    if len(text) < 80 or "may refer to" in text:
        return False
    return True

def generate_catalog(texts: List[Dict[str, Any]]) -> None:
    by_cat: Dict[str, List[Dict[str, Any]]] = {}
    for t in texts:
        cat = t.get("category", "general")
        by_cat.setdefault(cat, []).append(t)

    lines = [
        "# Eepytype Practice Library Catalog",
        "",
        f"Total Curated Practice Sections: **{len(texts)}**",
        "",
        "| Category | Total Texts | Topics Preview |",
        "| :--- | :---: | :--- |"
    ]

    for cat, items in sorted(by_cat.items()):
        titles = ", ".join(i["title"] for i in items[:4])
        if len(items) > 4:
            titles += f", +{len(items)-4} more"
        lines.append(f"| **{cat.capitalize()}** | {len(items)} | {titles} |")

    lines.append("")
    lines.append("---")
    lines.append("")

    for cat, items in sorted(by_cat.items()):
        lines.append(f"## {cat.capitalize()} ({len(items)} entries)")
        lines.append("")
        lines.append("| Title | Difficulty | Words | Chars | Author / Source | Preview Excerpt |")
        lines.append("| :--- | :---: | :---: | :---: | :--- | :--- |")
        for item in sorted(items, key=lambda x: x["title"]):
            title = item.get("title", "Untitled")
            diff = item.get("difficulty", "medium").upper()
            diff_badge = {"EASY": "🟢 Easy", "MEDIUM": "🟡 Medium", "HARD": "🔴 Hard", "EXPERT": "🟣 Expert"}.get(diff, diff)
            wc = item.get("wordCount", 0)
            cc = item.get("charCount", 0)
            src = item.get("author") or item.get("source") or "Curated"
            preview = (item.get("text", "")[:100] + "...").replace("|", "-")
            lines.append(f"| **{title}** | {diff_badge} | {wc}w | {cc}c | {src} | {preview} |")
        lines.append("")

    with open(CATALOG_FILE_PATH, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"Generated comprehensive practice catalog: {CATALOG_FILE_PATH} ({len(texts)} sections)")

def run_enrichment() -> None:
    if not os.path.exists(PRACTICE_FILE_PATH):
        print(f"File not found: {PRACTICE_FILE_PATH}")
        return

    with open(PRACTICE_FILE_PATH, "r", encoding="utf-8") as f:
        current_texts = json.load(f)

    print(f"Loaded {len(current_texts)} existing texts.")

    # 1. Filter out low quality / irrelevant entries
    filtered_texts = [e for e in current_texts if is_valid_entry(e)]
    print(f"Filtered to {len(filtered_texts)} clean substantive entries.")

    existing_ids: Set[str] = {e["id"] for e in filtered_texts}
    existing_titles: Set[str] = {e.get("title", "").lower() for e in filtered_texts}

    # 2. Queue enrichment topics
    tasks: List[Tuple[str, str]] = []
    for cat, topics in TARGETED_ENRICHMENT.items():
        for topic in topics:
            if topic.lower() not in existing_titles:
                tasks.append((topic, cat))

    print(f"Queued {len(tasks)} targeted enrichment topics.")

    new_entries: List[Dict[str, Any]] = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=25) as executor:
        future_to_task = {
            executor.submit(fetch_wikipedia_entry, title, cat): (title, cat)
            for title, cat in tasks
        }

        for future in concurrent.futures.as_completed(future_to_task):
            try:
                res = future.result()
                if res and res["id"] not in existing_ids:
                    existing_ids.add(res["id"])
                    new_entries.append(res)
            except Exception:
                pass

    final_list = filtered_texts + new_entries
    os.makedirs(os.path.dirname(PRACTICE_FILE_PATH), exist_ok=True)
    with open(PRACTICE_FILE_PATH, "w", encoding="utf-8") as f:
        json.dump(final_list, f, indent=2, ensure_ascii=False)

    generate_catalog(final_list)
    print(f"\nEnrichment complete! Added {len(new_entries)} new entries. Final library total: {len(final_list)} sections.")

if __name__ == "__main__":
    run_enrichment()

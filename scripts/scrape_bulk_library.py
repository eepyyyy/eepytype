#!/usr/bin/env python3
"""
Bulk Practice Text Scraper & Library Generator for eepytype.
Scrapes ~1,500+ curated, high-quality texts across 10 core genres:
Science, Philosophy, Engineering, Technology, Literature, History,
Medicine, Law, Nature, and Art.
Uses concurrent threading with Wikipedia REST API summaries.
"""

import concurrent.futures
import json
import os
import re
import time
import urllib.parse
import urllib.request
from typing import Any, Dict, List, Optional, Tuple

ROOT_DIR = os.path.dirname(os.path.dirname(__file__))
PRACTICE_FILE_PATH = os.path.join(
    ROOT_DIR, "frontend", "static", "practice", "practice_texts.json"
)
CATALOG_FILE_PATH = os.path.join(ROOT_DIR, "PRACTICE_CATALOG.md")

USER_AGENT = "EepytypePracticeScraper/2.0 (https://github.com/eepyyyy/eepytype; practice-library-curation)"

# Curated topics organized by category (120-150 topics each -> 1,300+ topics total)
GENRE_TOPICS: Dict[str, List[str]] = {
    "science": [
        "Quantum mechanics", "General relativity", "Special relativity", "Quantum electrodynamics",
        "Quantum chromodynamics", "Standard Model", "String theory", "Thermodynamics",
        "Statistical mechanics", "Classical mechanics", "Electromagnetism", "Optics",
        "Fluid mechanics", "Dark matter", "Dark energy", "Cosmic microwave background",
        "Black hole", "Gravitational wave", "Neutron star", "Supernova",
        "Higgs boson", "Quark", "Lepton", "Antimatter",
        "Plasma (physics)", "Nuclear fusion", "Nuclear fission", "Superconductivity",
        "Bose–Einstein condensate", "Quantum entanglement", "Quantum teleportation", "Chaos theory",
        "Astrophysics", "Physical cosmology", "Planetary science", "Solar System",
        "Exoplanet", "Organic chemistry", "Inorganic chemistry", "Biochemistry",
        "Physical chemistry", "Analytical chemistry", "Periodic table", "Chemical bond",
        "Covalent bond", "Ionic bonding", "Hydrogen bond", "Catalysis",
        "Polymer chemistry", "Electrochemistry", "Stoichiometry", "Molecular orbital theory",
        "Coordination complex", "Enzyme catalysis", "Crystallography", "Spectroscopy",
        "Mass spectrometry", "Chromatography", "Photosynthesis", "Cellular respiration",
        "Carbon cycle", "Nitrogen cycle", "Genetics", "CRISPR gene editing",
        "Molecular biology", "Evolutionary biology", "Natural selection", "DNA replication",
        "Protein biosynthesis", "Cell membrane", "Mitochondrion", "Ribosome",
        "Epigenetics", "Microbiology", "Immunology", "Plate tectonics",
        "Volcanology", "Mineralogy", "Stratigraphy", "Oceanography",
        "Marine biology", "Paleontology", "Meteorology", "Atmospheric science",
        "Climate change", "Glaciology", "Biogeography", "Geomorphology",
        "Hydrology", "Radioactive decay", "Alpha particle", "Beta particle",
        "Gamma ray", "Doppler effect", "Photoelectric effect", "Heisenberg uncertainty principle",
        "Wave–particle duality", "Schrödinger equation", "Maxwell's equations", "Lorentz transformation",
        "Feynman diagram", "Cosmic ray", "Hubble's law", "Big Bang",
        "Stellar evolution", "Red giant", "White dwarf", "Pulsar",
        "Quasar", "Accretion disk", "Event horizon", "Hawking radiation",
        "Speed of light", "Absolute zero", "Entropy (statistical thermodynamics)", "Second law of thermodynamics",
        "Chemical equilibrium", "Acid–base reaction", "Redox", "Organic synthesis",
        "Green chemistry", "Nanotechnology", "Graphene", "Fullerene"
    ],
    "philosophy": [
        "Stoicism", "Utilitarianism", "Epistemology", "Existentialism",
        "Determinism", "Free will", "Categorical imperative", "Absurdism",
        "Nihilism", "Pragmatism", "Social contract", "Phenomenology (philosophy)",
        "Mind–body dualism", "Virtue ethics", "Deontology", "Rationalism",
        "Empiricism", "Dialectic", "Solipsism", "Monism",
        "Dualism in cosmology", "Idealism", "Materialism", "Physicalism",
        "Nominalism", "Philosophical realism", "Skepticism", "Cynicism (philosophy)",
        "Epicureanism", "Hedonism", "Consequentialism", "Moral relativism",
        "Moral realism", "Ethics of care", "Altruism", "Egoism",
        "Political philosophy", "Distributive justice", "Philosophy of mind", "Philosophy of language",
        "Philosophy of science", "Philosophy of mathematics", "Philosophy of space and time", "Ontology",
        "Metaphysics", "Hermeneutics", "Structuralism", "Post-structuralism",
        "Deconstruction", "Critical theory", "Frankfurt School", "Logical positivism",
        "Ordinary language philosophy", "Semantics", "Philosophy of logic", "Gettier problem",
        "Trolley problem", "Ship of Theseus", "Chinese room", "Allegory of the cave",
        "Brain in a vat", "Pascal's wager", "Omnipotence paradox", "Thus Spoke Zarathustra",
        "Übermensch", "Eternal return", "Propositional logic", "Modal logic",
        "Deductive reasoning", "Inductive reasoning", "Abductive reasoning", "Tabula rasa",
        "Cogito, ergo sum", "Noumenon", "Phenomenon", "Kantianism",
        "Hegelianism", "Spinozism", "Leibnizianism", "Cartesianism",
        "Platonism", "Aristotelianism", "Scholasticism", "Thomism",
        "Humanism", "Confucianism", "Taoism", "Buddhist philosophy",
        "Advaita Vedanta", "Zen", "Mohism", "Legalism (Chinese philosophy)",
        "Hermeticism", "Panpsychism", "Falsifiability", "Instrumentalism",
        "Fallibilism", "Analytic philosophy", "Continental philosophy", "Aesthetics",
        "Philosophy of history", "Philosophy of religion", "Epistemic injustice", "Epistemological anarchism",
        "Paradigms (Kuhn)", "Problem of induction", "Qualia", "Consciousness",
        "Hard problem of consciousness", "Epiphenomenalism", "Functionalism (philosophy of mind)", "Emergentism",
        "Teleology", "Essentialism", "Existential humanism", "Virtue epistemology"
    ],
    "engineering": [
        "Gas turbine", "Aerodynamics", "Turbojet", "Turbofan",
        "Finite element method", "Control theory", "Fluid dynamics", "Heat transfer",
        "Turbopump", "Robotics", "Materials science", "Chemical engineering",
        "Civil engineering", "Mechanical engineering", "Electrical engineering", "Structural engineering",
        "Aerospace engineering", "Biomedical engineering", "Nuclear engineering", "Marine engineering",
        "Environmental engineering", "Industrial engineering", "Systems engineering", "Geotechnical engineering",
        "Optical engineering", "Acoustical engineering", "Petroleum engineering", "Mining engineering",
        "Computer engineering", "Microelectromechanical systems", "Mechatronics", "Internal combustion engine",
        "Steam engine", "Rocket engine", "Rocket propulsion", "Supersonic flight",
        "Hypersonic flight", "Bernoulli's principle", "Navier–Stokes equations", "Reynolds number",
        "Boundary layer", "Lift (force)", "Drag (physics)", "Airfoil",
        "Composite material", "Metallurgy", "Semiconductor device fabrication", "Photovoltaics",
        "Wind turbine", "Hydroelectricity", "Nuclear reactor", "Power grid",
        "Transformer", "Electric motor", "Alternator", "Battery storage power station",
        "Fuel cell", "Refrigeration", "HVAC", "Heat exchanger",
        "Hydraulics", "Pneumatics", "PID controller", "Kalman filter",
        "Programmable logic controller", "Computer numerical control", "3D printing", "Additive manufacturing",
        "Computer-aided design", "Tensile strength", "Fatigue (material)", "Fracture mechanics",
        "Stress–strain analysis", "Elasticity (physics)", "Plasticity (physics)", "Structural analysis",
        "Truss", "Suspension bridge", "Tunnel boring machine", "Skyscraper design and construction",
        "Dam", "Wastewater treatment", "Desalination", "Combustion",
        "Avionics", "Fly-by-wire", "Hovercraft", "Supercharger",
        "Turbocharger", "Fluid coupling", "Torque converter", "Gear train",
        "Epicyclic gearing", "Differential (mechanical device)", "Bearing (mechanical)", "Tribology",
        "Lubrication", "Corrosion", "Galvanization", "Anodizing",
        "Semiconductor manufacturing", "Cleanroom", "Photolithography", "Signal processing",
        "Digital signal processor", "Analog-to-digital converter", "Operational amplifier", "Printed circuit board"
    ],
    "technology": [
        "Public-key cryptography", "Distributed computing", "Reinforcement learning", "Kernel (operating system)",
        "Large language model", "Compiler", "Computer network", "Cryptographic hash function",
        "Turing machine", "Relational database", "Quantum computing", "Cloud computing",
        "Computer security", "Computer graphics", "Blockchain", "Artificial neural network",
        "Deep learning", "Machine learning", "Natural language processing", "Computer vision",
        "Transformer (deep learning architecture)", "Generative adversarial network", "Convolutional neural network", "Recurrent neural network",
        "Attention (machine learning)", "Microprocessor", "CPU cache", "Graphics processing unit",
        "Field-programmable gate array", "Application-specific integrated circuit", "Instruction set architecture", "RISC-V",
        "X86", "ARM architecture family", "Virtual memory", "File system",
        "Memory management", "Multithreading (computer architecture)", "Concurrency (computer science)", "Parallel computing",
        "Distributed consensus", "Raft (algorithm)", "Paxos (computer science)", "CAP theorem",
        "Byzantine fault", "Zero-knowledge proof", "RSA (cryptosystem)", "Elliptic-curve cryptography",
        "Advanced Encryption Standard", "Diffie–Hellman key exchange", "Transport Layer Security", "Domain Name System",
        "Border Gateway Protocol", "Internet protocol suite", "Routing", "Packet switching",
        "Software-defined networking", "Microservices", "Containerization (computing)", "Kubernetes",
        "Linux", "Unix", "Garbage collection (computer science)", "Just-in-time compilation",
        "Abstract syntax tree", "Formal language", "Regular expression", "Graph database",
        "NoSQL", "Key–value database", "Time series database", "Solid-state drive",
        "Flash memory", "Dynamic random-access memory", "High-performance computing", "Edge computing",
        "Internet of things", "Autonomous vehicle", "Augmented reality", "Virtual reality",
        "Ray tracing (graphics)", "Rasterisation", "WebAssembly", "Hypertext Transfer Protocol",
        "GraphQL", "REST", "Serverless computing", "Continuous integration",
        "Version control", "Git", "Peer-to-peer", "BitTorrent",
        "Search engine indexing", "Information retrieval", "Recommendation system", "Object-oriented programming",
        "Functional programming", "Type system", "Memory safety", "Static program analysis"
    ],
    "literature": [
        "Romanticism", "Modernist literature", "Magical realism", "Greek tragedy",
        "Gothic fiction", "Epic poetry", "Satire", "Postmodern literature",
        "Victorian literature", "Renaissance literature", "Stream of consciousness", "Allegory",
        "Bildungsroman", "Picaresque novel", "Dystopia", "Science fiction",
        "Detective fiction", "Historical fiction", "Mythopoeia", "Pastoral",
        "Transcendentalism", "Beat Generation", "Lost Generation", "Harlem Renaissance",
        "Theatre of the Absurd", "Surrealism", "Russian literature", "French literature",
        "German literature", "Latin American literature", "Japanese literature", "Chinese literature",
        "Indian literature", "Epic of Gilgamesh", "Odyssey", "Iliad",
        "Aeneid", "Divine Comedy", "The Canterbury Tales", "Don Quixote",
        "Hamlet", "Macbeth", "King Lear", "Paradise Lost",
        "Faust, Part One", "Frankenstein", "Pride and Prejudice", "Moby-Dick",
        "Crime and Punishment", "War and Peace", "The Brothers Karamazov", "Anna Karenina",
        "Ulysses (novel)", "The Great Gatsby", "To the Lighthouse", "Nineteen Eighty-Four",
        "Brave New World", "The Stranger (Camus novel)", "The Metamorphosis", "One Hundred Years of Solitude",
        "The Waste Land", "In Search of Lost Time", "Heart of Darkness", "Dubliners",
        "The Sound and the Fury", "Invisible Man", "Beloved (novel)", "Midnight's Children",
        "Things Fall Apart", "The Trial", "Les Misérables", "The Count of Monte Cristo",
        "Jane Eyre", "Wuthering Heights", "Great Expectations", "Middlemarch",
        "Madame Bovary", "Leaves of Grass", "Sonnet", "Haiku",
        "Free verse", "Metaphor", "Irony", "Literary realism",
        "Naturalism (literature)", "Fable", "Parable", "Essay",
        "Biography", "Autobiography", "Memoir", "Novella",
        "Short story", "Flash fiction", "Tragicomedy", "Soliloquy",
        "Monologue", "Unreliable narrator", "Foreshadowing", "Alliteration"
    ],
    "history": [
        "Renaissance", "Industrial Revolution", "Scientific Revolution", "Age of Enlightenment",
        "Space Race", "Silk Road", "Ancient Egypt", "Ancient Greece",
        "Roman Empire", "Byzantine Empire", "Middle Ages", "Bronze Age",
        "Iron Age", "Mesopotamia", "Indus Valley Civilisation", "Ancient Rome",
        "Roman Republic", "Pax Romana", "Han dynasty", "Tang dynasty",
        "Song dynasty", "Ming dynasty", "Ottoman Empire", "Mongol Empire",
        "Achaemenid Empire", "Aztec Empire", "Inca Empire", "Maya civilization",
        "Viking Age", "Crusades", "Magna Carta", "Black Death",
        "Age of Discovery", "Reformation", "French Revolution", "American Revolution",
        "Napoleonic Wars", "American Civil War", "Meiji Restoration", "Scramble for Africa",
        "World War I", "Russian Revolution", "League of Nations", "Great Depression",
        "World War II", "The Holocaust", "Battle of Stalingrad", "Attack on Pearl Harbor",
        "Manhattan Project", "Atomic bombings of Hiroshima and Nagasaki", "United Nations", "Cold War",
        "Marshall Plan", "Berlin Wall", "Korean War", "Vietnam War",
        "Cuban Missile Crisis", "Apollo program", "Moon landing", "Dissolution of the Soviet Union",
        "European Union", "Decolonization of Africa", "Maritime history", "History of printing",
        "History of agriculture", "History of writing", "History of medicine", "History of science",
        "Neolithic Revolution", "Code of Hammurabi", "Library of Alexandria", "Colosseum",
        "Parthenon", "Great Wall of China", "Taj Mahal", "Constantinople",
        "Islamic Golden Age", "House of Wisdom", "Fall of Constantinople", "Hanseatic League",
        "Spanish Empire", "British Empire", "Mughal Empire", "Safavid Iran",
        "Tokugawa shogunate", "Seven Years' War", "Treaty of Westphalia", "Congress of Vienna",
        "Suez Canal", "Panama Canal", "Treaty of Versailles", "Spanish Civil War"
    ],
    "medicine": [
        "Neuroplasticity", "Immune system", "Cardiovascular system", "Pharmacology",
        "Action potential", "Genetics", "Virology", "Pathology",
        "Human anatomy", "Epidemiology", "Hematology", "Oncology",
        "Endocrinology", "Neurology", "Pulmonology", "Gastroenterology",
        "Nephrology", "Dermatology", "Ophthalmology", "Otolaryngology",
        "Orthopedic surgery", "Anesthesia", "Radiology", "Surgery",
        "Pediatrics", "Psychiatry", "Clinical trial", "Antibiotic",
        "Vaccine", "Antibody", "Antigen", "T cell",
        "B cell", "Macrophage", "Phagocyte", "Pathogen",
        "Bacteria", "Virus", "Fungus", "Prion",
        "Autoimmune disease", "Inflammation", "Stem cell", "Gene therapy",
        "Pharmacokinetics", "Pharmacodynamics", "Chemical synapse", "Neuron",
        "Central nervous system", "Peripheral nervous system", "Blood–brain barrier", "Cerebrum",
        "Cerebellum", "Heart", "Blood pressure", "Electrocardiography",
        "Hemoglobin", "Coagulation", "Homeostasis", "Metabolism",
        "Insulin", "Diabetes", "Apoptosis", "Mitosis",
        "Meiosis", "DNA repair", "Mutation", "Magnetic resonance imaging",
        "Computed tomography", "Medical ultrasound", "X-ray", "Endoscopy",
        "Chemotherapy", "Radiation therapy", "Organ transplantation", "Emergency medicine",
        "Intensive care medicine", "Public health", "Evidence-based medicine", "Circulatory system",
        "Lymphatic system", "Digestive system", "Respiratory system", "Urinary system",
        "Musculoskeletal system", "Integumentary system", "Endocrine system", "Neurotransmitter"
    ],
    "law": [
        "Rule of law", "Constitutional law", "Separation of powers", "Universal Declaration of Human Rights",
        "Common law", "Jurisprudence", "Civil law (legal system)", "International law",
        "Criminal law", "Tort", "Contract", "Property law",
        "Administrative law", "Judicial review", "Due process", "Habeas corpus",
        "Presumption of innocence", "Burden of proof (law)", "Statutory interpretation", "Precedent",
        "Legal positivism", "Natural law", "Legal realism", "Equity (law)",
        "Customary law", "Geneva Conventions", "International Court of Justice", "International Criminal Court",
        "Human rights", "Civil liberties", "Freedom of speech", "Freedom of religion",
        "Right to privacy", "Copyright", "Patent", "Trademark",
        "Intellectual property", "Corporate law", "Competition law", "Environmental law",
        "Labour law", "Admiralty law", "Space law", "Cyberlaw",
        "Treaty", "Nuremberg trials", "United States Bill of Rights", "Code of Justinian",
        "Napoleonic Code", "Constitutionalism", "Sovereignty", "Federalism",
        "Extradition", "Right of asylum", "Arbitration", "Mediation",
        "Dispute resolution", "Evidence (law)", "Cross-examination", "Double jeopardy",
        "Mens rea", "Actus reus", "Strict liability", "Injunction",
        "Damages (law)", "Jurisdiction", "Legal personality", "Corporate personhood",
        "Trust law", "Fiduciary", "Legal ethics", "Legal professional privilege",
        "Probate", "Testamentary capacity", "Bankruptcy", "Securities regulation",
        "Class action", "Plea bargain", "Sentencing", "Restorative justice"
    ],
    "nature": [
        "Marine biology", "Ecosystem", "Biodiversity", "Coral reef",
        "Rainforest", "Amazon rainforest", "Deep sea", "Abyssal zone",
        "Hydrothermal vent", "Ocean current", "Gulf Stream", "El Niño",
        "Mariana Trench", "Great Barrier Reef", "Taiga", "Tundra",
        "Savanna", "Desert", "Sahara", "Arctic",
        "Antarctica", "Glacier", "Ice age", "Permafrost",
        "Volcano", "Ring of Fire", "Geyser", "Waterfall",
        "Grand Canyon", "Aurora", "Ozone depletion", "Atmosphere of Earth",
        "Stratosphere", "Water cycle", "Mangrove", "Kelp forest",
        "Wetland", "Estuary", "Soil biology", "Mycorrhiza",
        "Fungus", "Pollination", "Speciation", "Evolution",
        "Adaptive radiation", "Convergent evolution", "Symbiosis", "Mutualism (biology)",
        "Parasitism", "Commensalism", "Biomass (ecology)", "Trophic level",
        "Food web", "Keystone species", "Apex predator", "Endangered species",
        "Conservation biology", "Animal migration", "Hibernation", "Bioluminescence",
        "Camouflage", "Mimicry", "Animal echolocation", "Cetacea",
        "Whale vocalization", "Coral bleaching", "Deforestation", "Ocean acidification",
        "Monsoon", "Cyclone", "Tornado", "Tsunami",
        "Cave", "Stalactite", "Geological formation", "Fossil",
        "Amber", "Flora", "Fauna", "Photosynthetic pigment",
        "Old-growth forest", "Redwood National and State Parks", "Galápagos Islands", "Serengeti"
    ],
    "art": [
        "Art history", "Music theory", "Impressionism", "Architecture",
        "Aesthetics", "Renaissance art", "Baroque", "Rococo",
        "Neoclassicism", "Romanticism", "Realism (arts)", "Post-Impressionism",
        "Pointillism", "Fauvism", "Expressionism", "Cubism",
        "Futurism", "Dada", "Surrealism", "Abstract expressionism",
        "Pop art", "Minimalism", "Conceptual art", "Contemporary art",
        "Modern art", "Gothic architecture", "Romanesque architecture", "Classical architecture",
        "Bauhaus", "Art Nouveau", "Art Deco", "Brutalist architecture",
        "Deconstructivism", "Landscape architecture", "Urban design", "Sculpture",
        "Bronze sculpture", "Marble sculpture", "Fresco", "Oil painting",
        "Tempera", "Watercolor painting", "Printmaking", "Woodcut",
        "Engraving", "Etching", "Lithography", "Photography",
        "Cinematography", "Film editing", "Mise-en-scène", "Color theory",
        "Perspective (graphical)", "Chiaroscuro", "Sfumato", "Golden ratio",
        "Composition (visual arts)", "Calligraphy", "Typography", "Graphic design",
        "Industrial design", "Fashion design", "Theatre", "Opera",
        "Classical music", "Symphony", "Concerto", "Sonata",
        "Fugue", "Harmony", "Counterpoint", "Polyphony",
        "Jazz", "Blues", "Choreography", "Ballet",
        "Modern dance", "Museum", "Art conservation and restoration", "Mosaic",
        "Stained glass", "Pottery", "Ceramic art", "Textile arts",
        "Performance art", "Installation art", "Land art", "Street art"
    ]
}

def calculate_difficulty(text: str) -> Dict[str, Any]:
    words = re.findall(r"\b\w+\b", text)
    word_count = len(words)
    char_count = len(text)

    if word_count == 0:
        return {
            "wordCount": 0,
            "charCount": char_count,
            "avgWordLength": 0.0,
            "difficulty": "easy"
        }

    avg_len = sum(len(w) for w in words) / word_count

    if avg_len < 5.0:
        difficulty = "easy"
    elif avg_len < 5.7:
        difficulty = "medium"
    elif avg_len < 6.3:
        difficulty = "hard"
    else:
        difficulty = "expert"

    return {
        "wordCount": word_count,
        "charCount": char_count,
        "avgWordLength": round(avg_len, 1),
        "difficulty": difficulty
    }

def clean_text(text: str) -> str:
    # Remove citation brackets like [1], [2], [citation needed]
    cleaned = re.sub(r"\[\d+\]|\[citation needed\]|\[edit\]", "", text)
    # Remove IPA / pronunciation notes often inside parens or slashes
    cleaned = re.sub(r"\(/[^)]+/\)", "", cleaned)
    # Normalize unicode quotes and dashes
    cleaned = cleaned.replace("“", '"').replace("”", '"').replace("’", "'").replace("‘", "'")
    cleaned = cleaned.replace("—", " - ").replace("–", "-")
    # Normalize whitespace
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned

def fetch_wikipedia_entry(title: str, category: str) -> Optional[Dict[str, Any]]:
    """Fetches clean extract summary from Wikipedia REST API with retry."""
    encoded_title = urllib.parse.quote(title.replace(" ", "_"))
    url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{encoded_title}"

    for attempt in range(3):
        try:
            req = urllib.request.Request(
                url,
                headers={"User-Agent": USER_AGENT}
            )
            with urllib.request.urlopen(req, timeout=12) as resp:
                if resp.status == 200:
                    data = json.loads(resp.read().decode("utf-8"))
                    page_type = data.get("type", "")
                    if page_type == "disambiguation":
                        return None

                    extract = data.get("extract", "")
                    cleaned = clean_text(extract)
                    if len(cleaned) < 80:
                        return None

                    page_title = data.get("title", title)
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
            time.sleep(0.5 * (attempt + 1))

    return None

def load_existing_texts() -> List[Dict[str, Any]]:
    if os.path.exists(PRACTICE_FILE_PATH):
        try:
            with open(PRACTICE_FILE_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []
    return []

def save_texts(texts: List[Dict[str, Any]]) -> None:
    os.makedirs(os.path.dirname(PRACTICE_FILE_PATH), exist_ok=True)
    with open(PRACTICE_FILE_PATH, "w", encoding="utf-8") as f:
        json.dump(texts, f, indent=2, ensure_ascii=False)
    print(f"Saved {len(texts)} practice texts to {PRACTICE_FILE_PATH}")

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

def run_bulk_scraper() -> None:
    existing = load_existing_texts()
    existing_map = {e["id"]: e for e in existing}
    print(f"Starting with {len(existing)} existing practice sections.")

    tasks: List[Tuple[str, str]] = []
    for cat, topics in GENRE_TOPICS.items():
        for topic in topics:
            tasks.append((topic, cat))

    print(f"Total topics queued for scraping: {len(tasks)}")

    new_entries: List[Dict[str, Any]] = []
    success_count = 0
    skipped_count = 0

    with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
        future_to_task = {
            executor.submit(fetch_wikipedia_entry, topic, cat): (topic, cat)
            for topic, cat in tasks
        }

        for future in concurrent.futures.as_completed(future_to_task):
            topic, cat = future_to_task[future]
            try:
                result = future.result()
                if result:
                    entry_id = result["id"]
                    if entry_id not in existing_map:
                        existing_map[entry_id] = result
                        new_entries.append(result)
                        success_count += 1
                        if success_count % 50 == 0:
                            print(f"  [Progress] Scraped {success_count} new sections...")
                    else:
                        skipped_count += 1
                else:
                    skipped_count += 1
            except Exception as e:
                skipped_count += 1

    # Preserve order: existing items followed by all new entries appended at the end
    final_list = existing + new_entries
    save_texts(final_list)
    generate_catalog(final_list)
    print(f"\nScraping complete! Added {len(new_entries)} new practice sections. Total in library: {len(final_list)}")

if __name__ == "__main__":
    run_bulk_scraper()

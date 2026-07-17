// =============================================================
// ESCAPE FROM SECTION 8 - DATA STRUCTURES
// =============================================================

// Constants
const STARTING_MONEY = 12.40;
const MAX_ACTIONS_PER_DAY = 5;

// Game phases
const GAME_PHASES = {
    PRE_LOCKDOWN: "pre_lockdown",
    LOCKDOWN: "lockdown",
    NEW_NORMAL: "new_normal"
};

// Property tiers for escape
const PROPERTY_TIERS = [
    { name: "raw land and a camo tent (off the county's radar)", money: 3000, legit: 20 },
    { name: "an out-of-state, low-priced starter home", money: 15000, legit: 35 },
    { name: "raw land with a septic tank and solar, living out of an RV or tiny home", money: 25000, legit: 35 },
    { name: "a $40k manufactured home on a $700/mo lot", money: 40000, legit: 40 },
    { name: "a real house - 20% down on $350k or more", money: 70000, legit: 55 },
];

// Jobs database
const JOBS = {
    "Rusty Skillet": {
        boss: "Earl",
        kind: "diner",
        pay_range: [35, 55],
        tips_range: [5, 25],
        vitality_cost: 8,
        meal_perk: true,
    },
    "Miller's Salvage": {
        boss: "Miller",
        kind: "salvage yard",
        pay_range: [55, 85],
        tips_range: [0, 0],
        vitality_cost: 16,
        meal_perk: false,
    },
};

// Residents database
const RESIDENTS = {
    "Tina": { desc: "Late 50s, chain smoker. Predatory smile. Transactional. Bolder than she looks - she doesn't tip-toe when she wants something.", player_rep: 0, anger: 0, drunk: false },
    "Gabe": { desc: "Thin, hollow-eyed. Heavy drinker.", player_rep: 0, anger: 0, drunk: false },
    "Lisa": { desc: "Gaunt, track marks. Information broker. Flirty, opportunistic, quick to lift something unattended - but not a brawler.", player_rep: 0, anger: 0, drunk: true },
    "Frank": { desc: "Ex-military, convicted. Dangerous.", player_rep: 0, anger: 0, drunk: true },
    "Phyllis": { desc: "75, dementia. Mostly oblivious.", player_rep: 0, anger: 0, drunk: false },
    "Bill": { desc: "50s, lube shop. Grumpy.", player_rep: 0, anger: 0, drunk: true },
    "Gladys": { desc: "500+ lbs. Diapers.", player_rep: 0, anger: 0, drunk: false },
    "Rebecca": { desc: "Late 60s. Closet drunk. Gossiper. Transactional.", player_rep: 0, anger: 0, drunk: true },
    "Tom": { desc: "65, drug runner.", player_rep: 0, anger: 0, drunk: false },
};

// Shopping catalog
const SHOPPING_CATALOG = {
    "1": { name: "Cat food (3-day supply)", price: 8, apply: (player, qty) => { player.cat_food_days += 3 * qty; return `Cat food +${3*qty} days.`; } },
    "2": { name: "Cat litter", price: 5, apply: (player, qty) => { player.cat_mood = "content"; return "Litter refreshed."; } },
    "3": { name: "Toilet paper (12-pack)", price: 6, apply: (player, qty) => { player.toilet_paper_rolls += 12 * qty; return `TP +${12*qty} rolls.`; } },
    "4": { name: "Bidet attachment", price: 30, apply: (player, qty) => { if (!player.has_bidet) { player.has_bidet = true; player.inventory.push("Bidet"); } return "Bidet installed."; } },
    "5": { name: "Used book", price: 3, apply: (player, qty) => { if (!player.has_book) { player.has_book = true; player.inventory.push("Used Book"); } return "Book acquired."; } },
    "6": { name: "Wrench set", price: 25, apply: (player, qty) => { player.mechanics_skill = Math.min(10, player.mechanics_skill + qty); player.has_tool_kit = true; if (!player.inventory.includes("Wrench Set")) player.inventory.push("Wrench Set"); return `Tool kit acquired. Mechanics skill +${qty}.`; } },
    "7": { name: "Screwdriver set", price: 15, apply: (player, qty) => { player.has_tool_kit = true; player.mechanics_skill = Math.min(10, player.mechanics_skill + qty); if (!player.inventory.includes("Screwdriver Set")) player.inventory.push("Screwdriver Set"); return `Screwdriver set acquired. Mechanics skill +${qty}.`; } },
    "8": { name: "Duct tape", price: 4, apply: (player, qty) => { if (!player.inventory.includes("Duct Tape")) player.inventory.push("Duct Tape"); return "Duct tape. Fixes everything. Almost."; } },
    "9": { name: "Plywood sheet", price: 12, apply: (player, qty) => { for (let i = 0; i < qty; i++) player.inventory.push("Plywood Sheet"); return `${qty} plywood sheet(s) for building.`; } },
    "A": { name: "2x4 lumber", price: 6, apply: (player, qty) => { for (let i = 0; i < qty; i++) player.inventory.push("2x4 Lumber"); return `${qty} 2x4(s) for framing.`; } },
    "B": { name: "Solar panel kit", price: 120, apply: (player, qty) => { if (!player.has_solar_panel) { player.has_solar_panel = true; player.inventory.push("Solar Panel Kit"); } return "Solar panel kit. Off-grid power."; } },
    "C": { name: "Good boots", price: 30, apply: (player, qty) => { if (!player.inventory.includes("Good Boots")) player.inventory.push("Good Boots"); return "Good boots acquired."; } },
    "D": { name: "Camp stove", price: 25, apply: (player, qty) => { if (!player.has_camp_stove) { player.has_camp_stove = true; player.inventory.push("Camp Stove"); } return "Camp stove acquired."; } },
    "E": { name: "Body camera", price: 60, apply: (player, qty) => { if (!player.bodycam_owned) { player.bodycam_owned = true; player.inventory.push("Body Camera"); } return "Body cam acquired."; } },
    "F": { name: "Bulk food (7-day supply)", price: 15, apply: (player, qty) => { player.food_supply_days += 7 * qty; return `Bulk food +${7*qty} days.`; } },
    "G": { name: "Seeds (starter pack)", price: 5, apply: (player, qty) => { player.inventory.push(`Seeds x${qty}`); return `Seeds x${qty}.`; } },
    "H": { name: "Planter box materials", price: 20, apply: (player, qty) => { if (!player.has_tool_kit) return "FAILED: Need tool kit first."; if (!player.has_planter) { player.has_planter = true; player.inventory.push("Planter Box"); } return "Planter box built."; } },
    "I": { name: "Large pot", price: 8, apply: (player, qty) => { if (!player.inventory.includes("Large Pot")) player.inventory.push("Large Pot"); return "Large pot for cooking."; } },
    "J": { name: "Frying pan", price: 8, apply: (player, qty) => { if (!player.inventory.includes("Frying Pan")) player.inventory.push("Frying Pan"); return "Frying pan for cooking."; } },
    "K": { name: "Dried beans (5-day supply)", price: 6, apply: (player, qty) => { player.food_supply_days += 5 * qty; player.inventory.push(`Dried Beans x${qty}`); return `Dried beans x${qty} (cheap protein, lasts).`; } },
    "L": { name: "Water jug (clean)", price: 4, apply: (player, qty) => { player.has_clean_water = true; player.water_days_without = 0; player.inventory.push(`Water Jug x${qty}`); return `Water jug x${qty} (clean water secured).`; } },
    "M": { name: "Dish soap", price: 3, apply: (player, qty) => { player.inventory.push(`Dish Soap x${qty}`); return `Dish soap x${qty}.`; } },
    "N": { name: "Candy bar (quick energy)", price: 2, apply: (player, qty) => { player.candy_bars += qty; return `Candy bars +${qty}.`; } },
    "O": { name: "Energy drink (bigger boost, costs vitality)", price: 3, apply: (player, qty) => { player.energy_drinks += qty; return `Energy drinks +${qty}.`; } },
    "P": { name: "Coffee packet", price: 1, apply: (player, qty) => { player.coffee_packets += qty; return `Coffee packets +${qty}.`; } },
    "Q": { name: "Folding market table", price: 25, apply: (player, qty) => { player.market_equipment.add("table"); return "Folding table acquired."; } },
    "R": { name: "10x10 canopy", price: 60, apply: (player, qty) => { player.market_equipment.add("canopy"); return "10x10 canopy acquired."; } },
    "S": { name: "Folding chair", price: 10, apply: (player, qty) => { player.market_equipment.add("chair"); return "Folding chair acquired."; } },
    "T": { name: "Custom market signage", price: 8, apply: (player, qty) => { player.market_equipment.add("signage"); return "Custom signage made up."; } },
    "U": { name: "3D printer", price: 150, apply: (player, qty) => { player.has_3d_printer = true; if (!player.inventory.includes("3D Printer")) player.inventory.push("3D Printer"); return "3D printer acquired."; } },
    "V": { name: "Filament spool", price: 10, apply: (player, qty) => { player.filament_spools += qty; return `Filament spools +${qty}.`; } },
    "W": { name: "Soap-making kit", price: 30, apply: (player, qty) => { player.has_soap_kit = true; if (!player.inventory.includes("Soap Kit")) player.inventory.push("Soap Kit"); return "Soap-making kit acquired."; } },
    "X": { name: "Soap ingredient batch", price: 8, apply: (player, qty) => { player.soap_ingredients += qty; return `Soap ingredient batches +${qty}.`; } },
    "Y": { name: "Used guitar", price: 40, apply: (player, qty) => { player.has_guitar = true; if (!player.inventory.includes("Guitar")) player.inventory.push("Guitar"); return "Used guitar acquired. Might draw a crowd at the market."; } },
    "Z": { name: "Flower stock (one market day)", price: 15, apply: (player, qty) => { player.flower_stock += qty; return `Flower stock +${qty}.`; } },
    "AA": { name: "Art supplies kit", price: 35, apply: (player, qty) => { player.has_art_kit = true; if (!player.inventory.includes("Art Supplies")) player.inventory.push("Art Supplies"); return "Art supplies kit acquired."; } },
    "AB": { name: "Leatherworking kit", price: 45, apply: (player, qty) => { player.has_leather_kit = true; if (!player.inventory.includes("Leatherworking Kit")) player.inventory.push("Leatherworking Kit"); return "Leatherworking kit acquired."; } },
    "AC": { name: "Desktop computer", price: 200, apply: (player, qty) => { player.has_computer = true; if (!player.inventory.includes("Desktop Computer")) player.inventory.push("Desktop Computer"); return "Desktop computer acquired. Bulky, but capable."; } },
    "AD": { name: "Smartphone w/ data plan", price: 150, apply: (player, qty) => { player.has_phone = true; if (!player.inventory.includes("Smartphone")) player.inventory.push("Smartphone"); return "Smartphone with data plan acquired. Portable - you can post a number, take calls."; } },
};

// Farmer's market products
const MARKET_PRODUCTS = {
    "1": {
        name: "3D-printed trinkets (planters, keychains, card holders)",
        requires: (p) => p.has_3d_printer && p.filament_spools > 0,
        consume: (p) => { p.filament_spools -= 1; },
        earn: [40, 90]
    },
    "2": {
        name: "Homemade soap",
        requires: (p) => p.has_soap_kit && p.soap_ingredients > 0,
        consume: (p) => { p.soap_ingredients -= 1; },
        earn: [25, 60]
    },
    "3": {
        name: "Fresh cut flowers (the money-maker, if you can keep it stocked)",
        requires: (p) => p.flower_stock > 0 || p.inventory.includes("Fresh Flowers"),
        consume: (p) => { 
            if (p.inventory.includes("Fresh Flowers")) p.inventory = p.inventory.filter(i => i !== "Fresh Flowers");
            else if (p.flower_stock > 0) p.flower_stock -= 1;
        },
        earn: [50, 120]
    },
    "4": {
        name: "Garden vegetables",
        requires: (p) => p.has_planter && p.food_supply_days >= 3,
        consume: (p) => { p.food_supply_days -= 3; },
        earn: [20, 50]
    },
    "5": {
        name: "Art prints",
        requires: (p) => p.has_art_kit,
        consume: () => {},
        earn: [20, 55]
    },
    "6": {
        name: "Leather goods",
        requires: (p) => p.has_leather_kit,
        consume: () => {},
        earn: [30, 70]
    },
    "7": {
        name: "Just busk with the guitar",
        requires: (p) => p.has_guitar,
        consume: () => {},
        earn: [15, 40]
    },
};

// Morning actions
const MORNING_ACTIONS = {
    "1": { desc: "Hunt bottles", cost: 25, fn: "hunt_bottles" },
    "2": { desc: "Scavenge", cost: 30, fn: "scavenge" },
    "3": { desc: "Look for work", cost: 15, fn: "apply_for_work" },
    "4": { desc: "Sit on porch", cost: 15, fn: "neighbor_chat" },
    "5": { desc: "Rest", cost: 0, fn: "rest" },
    "6": { desc: "Go shopping (cash)", cost: 20, fn: "daily_shopping" },
    "7": { desc: "Play with cats", cost: 5, fn: "play_with_cats" },
    "8": { desc: "Read book", cost: 5, fn: "read_book" },
    "9": { desc: "Cook a meal", cost: 10, fn: "cook_meal" },
    "A": { desc: "Learn a skill", cost: 10, fn: "learn_skill" },
    "B": { desc: "Tend garden", cost: 10, fn: "tend_garden" },
    "C": { desc: "Visit library", cost: 10, fn: "library_event" },
    "D": { desc: "Wash dishes", cost: 5, fn: "wash_dishes" },
    "E": { desc: "EBT grocery shopping", cost: 5, fn: "ebt_spending_menu" },
    "F": { desc: "Freelance work (phone/computer)", cost: 10, fn: "freelance_gig" },
    "G": { desc: "Quick fix (candy/coffee/cigarette/etc)", cost: 0, fn: "quick_fix_menu" },
};

// Player class
class Player {
    constructor() {
        this.name = "New Tenant";
        this.money = STARTING_MONEY;
        this.reputation = 35;
        this.soul = 78;
        this.legitimacy = 40;
        this.criminal_influence = 0;
        this.inventory = ["2 Cats", "Old POV", "Blankets", "Clothes"];
        this.cat_food_days = 2;
        this.toilet_paper_rolls = 12;
        this.known_characters = [];
        this.day = 0;
        this.has_job = false;
        this.energy = 100;
        this.hunger = 60;
        this.cat_mood = "restless";
        this.day_actions_used = 0;
        this.max_actions_per_day = MAX_ACTIONS_PER_DAY;
        this.employer = null;
        this.week_number = 1;
        this.week_start_day = 1;
        this.days_worked_this_week = 0;
        this.days_rested_this_week = 0;
        this.days_missed_this_week = 0;
        this.extra_shifts_this_week = 0;
        this.terminated = false;
        this.let_lisa_in = false;
        this.employment_type = "none";
        this.power_paid = false;
        this.paper_trail = 0;
        this.ebt = null;
        this.assistance = null;
        this.ebt_active = false;
        this.smoker_type = "none";
        this.bodycam_owned = false;
        this.has_book = false;
        this.has_bidet = false;
        this.cooking_skill = 0;
        this.mechanics_skill = 0;
        this.plant_skill = 0;
        this.plumbing_skill = 0;
        this.has_camp_stove = false;
        this.has_tool_kit = false;
        this.has_solar_panel = false;
        this.has_planter = false;
        this.planter_seeded = false;
        this.planter_watered_today = false;
        this.gardening_days = 0;
        this.farmer_market_day = null;
        this.food_supply_days = 0;
        this.cooked_meals_available = 0;
        this.tina_debt = 0;
        this.lisa_debt = 0;
        this.sti_risk = false;
        this.tina_interactions = 0;
        this.tina_trust = 0;
        this.tina_bold_flag = false;
        this.tina_had_sex = false;
        this.diner_meal_today = false;
        this.dishes_dirty = 0;
        this.has_clean_water = true;
        this.alcohol_level = 0;
        this.drug_use = [];
        this.last_porch_choice = null;
        this.lisa_had_sex = false;
        this.lisa_stiffed_me = false;
        this.lisa_let_in_before = false;
        this.lisa_helped_steal = false;
        this.lisa_gave_intel = false;
        this.tom_relationship = 0;
        this.tom_trust = 0;
        this.tom_jobs_done = 0;
        this.tom_jobs_failed = 0;
        this.tom_paid = 0.0;
        this.water_days_without = 0;
        this.garbage_days_without = 0;
        this.water_fine_paid = false;
        this.garbage_fine_paid = false;
        this.vitality = 50;
        // Gabe arc
        this.gabe_stage = 0;
        this.gabe_trust = 0;
        this.gabe_suspects_phyllis = false;
        this.gabe_phyllis_resolved = false;
        // Frank arc
        this.frank_stage = 0;
        this.frank_trust = 0;
        this.frank_pending_jealousy = false;
        this.frank_knows_tina_player = false;
        // Rebecca arc
        this.rebecca_stage = 0;
        this.rebecca_trust = 0;
        this.rebecca_info_level = 0;
        // Tina extras
        this.tina_meth_offer_made = false;
        this.tina_dealt_meth = false;
        this.tina_registry_hint_given = false;
        // Learning / tech / side income
        this.has_computer = false;
        this.has_phone = false;
        this.phone_number_posted = false;
        this.side_hustle_income = 0.0;
        this.side_hustle_type = null;
        // Quick-fix consumables
        this.candy_bars = 0;
        this.energy_drinks = 0;
        this.coffee_packets = 0;
        // Farmer's market equipment / products
        this.market_equipment = new Set();
        this.has_guitar = false;
        this.has_3d_printer = false;
        this.filament_spools = 0;
        this.has_soap_kit = false;
        this.soap_ingredients = 0;
        this.has_art_kit = false;
        this.has_leather_kit = false;
        this.flower_stock = 0;
        // NPC removal / ending state
        this.phyllis_status = "active";
        this.gladys_status = "active";
        this.eviction_notice = false;
        this.eviction_buyout_taken = false;
        this.escape_tier = null;
    }

    show_status() {
        let status = `=== Day ${this.day} (Week ${this.week_number}) - Section 8 Pines ===\n`;
        status += `Money: $${this.money.toFixed(2)}\n`;
        status += `Reputation: ${this.reputation}/100   Soul: ${this.soul}/100\n`;
        status += `Legitimacy: ${this.legitimacy}/100   Criminal: ${this.criminal_influence}/100\n`;
        status += `Inventory: ${this.inventory.join(', ')}\n`;
        status += `Cats: ${this.cat_mood} (Food: ${this.cat_food_days} days)   TP: ${this.toilet_paper_rolls} rolls\n`;
        status += `Energy: ${this.energy}/100   Hunger: ${this.hunger}/100   Vitality: ${this.vitality}/100\n`;
        status += `Food on hand: ${this.food_supply_days} days   Cooked meals: ${this.cooked_meals_available}\n`;
        status += `Dishes dirty: ${this.dishes_dirty}\n`;
        if (this.alcohol_level > 0) {
            status += `Alcohol level: ${this.alcohol_level}/10\n`;
        }
        if (!this.has_clean_water) {
            status += `*** NO CLEAN WATER (Day ${this.water_days_without}) ***\n`;
        }
        status += `Skills: Cook ${this.cooking_skill}/10  Mech ${this.mechanics_skill}/10  Plant ${this.plant_skill}/10  Plumb ${this.plumbing_skill}/10\n`;
        if (this.ebt_active && this.ebt) {
            status += `EBT: Active (Balance: $${this.ebt.balance.toFixed(2)})\n`;
        }
        status += `Paper Trail: ${this.paper_trail}/100\n`;
        if (this.has_job) {
            status += `Job: ${this.employer}   Week ${this.week_number} (day ${this.day - this.week_start_day + 1}/7) - Worked: ${this.days_worked_this_week}  Rested: ${this.days_rested_this_week}/1 required  Missed: ${this.days_missed_this_week}\n`;
        }
        if (this.tina_debt > 0) {
            status += `YOU OWE TINA: $${this.tina_debt.toFixed(2)}\n`;
        }
        if (this.lisa_debt > 0) {
            status += `YOU OWE LISA: $${this.lisa_debt.toFixed(2)}\n`;
        }
        if (this.tom_relationship > 0) {
            const rel_labels = ["Stranger", "Acquaintance", "Tested", "Runner", "Trusted Partner"];
            status += `Tom's Trust: ${rel_labels[Math.min(this.tom_relationship, 4)]} (Jobs: ${this.tom_jobs_done} done, ${this.tom_jobs_failed} failed)\n`;
        }
        if (this.has_planter) {
            const status_str = this.planter_seeded ? "planted" : "empty";
            const watered = this.planter_watered_today ? " (watered today)" : " (NEEDS WATER)";
            status += `Planter: ${status_str}${watered}   Garden days: ${this.gardening_days}\n`;
        }
        return status;
    }
}

// Assistance Application class
class AssistanceApplication {
    constructor() {
        this.ebt_applied = false;
        this.ebt_approved = false;
        this.ebt_processing_days = 0;
        this.energy_applied = false;
        this.energy_approved = false;
        this.energy_processing_days = 0;
        this.has_id = false;
        this.has_power_bill = false;
        this.photocopies_made = false;
    }
}

// EBT class
class EBT {
    constructor() {
        this.balance = 0.0;
        this.monthly_allotment = 290.0;
        this.last_deposit_day = 0;
    }
}

// Game state
let gameState = {
    player: null,
    game_phase: GAME_PHASES.PRE_LOCKDOWN,
    lockdown_day: null,
    outputBuffer: "",
    inputCallback: null,
    inputPrompt: "",
    waitingForInput: false,
    cart: [],
    currentAction: null,
};

// Helper functions
function change_rep(name, amount) {
    if (RESIDENTS[name]) {
        RESIDENTS[name].player_rep = Math.max(-100, Math.min(100, RESIDENTS[name].player_rep + amount));
    }
}

function change_anger(name, amount) {
    if (RESIDENTS[name]) {
        RESIDENTS[name].anger = Math.max(0, Math.min(100, RESIDENTS[name].anger + amount));
    }
}

function init_paper_trail(player) {
    if (!player.hasOwnProperty('paper_trail')) {
        player.paper_trail = 0;
    }
}

function document_event(player, amount = 10, description = "") {
    init_paper_trail(player);
    player.paper_trail = Math.min(100, player.paper_trail + amount);
    print(`You document: ${description}. (Paper trail: ${player.paper_trail}/100)`);
}

function init_assistance(player) {
    if (player.assistance === null) {
        player.assistance = new AssistanceApplication();
    }
}

function init_ebt(player) {
    if (!player.hasOwnProperty('ebt') || player.ebt === null) {
        player.ebt = new EBT();
        player.ebt.balance = 290.0;
        player.ebt.last_deposit_day = player.day;
    }
}

function process_ebt(player) {
    if (!player.hasOwnProperty('ebt') || player.ebt === null) return;
    if (player.ebt.last_deposit_day === 0) {
        player.ebt.last_deposit_day = player.day;
        return;
    }
    if (player.day - player.ebt.last_deposit_day >= 30) {
        if (player.has_job) {
            if (player.employment_type === "W2") {
                player.ebt.monthly_allotment = Math.max(50, 290 - 100);
            } else if (player.employment_type === "1099") {
                player.ebt.monthly_allotment = Math.max(50, 290 - 80);
            } else {
                player.ebt.monthly_allotment = 290;
            }
        } else {
            player.ebt.monthly_allotment = 290;
        }
        player.ebt.balance += player.ebt.monthly_allotment;
        player.ebt.last_deposit_day = player.day;
        print(`EBT deposit: $${player.ebt.monthly_allotment.toFixed(2)}.`);
    }
}

// Utility functions
function print(text, delay = 0) {
    gameState.outputBuffer += text + "\n";
    updateDisplay();
    if (delay > 0) {
        // For now, we'll just update immediately
        // In a more advanced version, we could animate the text
    }
}

function slow_print(text, delay = 35) {
    // For web version, we'll just print normally
    // Could implement animated typing later
    print(text);
}

function pause(message = "\n[Press enter to continue]") {
    // In web version, we don't actually pause
    // The flow is controlled by the input system
}

function safe_input(prompt = "> ") {
    // This will be handled by the web input system
    gameState.inputPrompt = prompt;
    gameState.waitingForInput = true;
    updateDisplay();
    return new Promise((resolve) => {
        gameState.inputCallback = resolve;
    });
}

function updateDisplay() {
    const outputEl = document.getElementById('output');
    const hudEl = document.getElementById('hud');
    const statsEl = document.getElementById('stats');
    const inventoryEl = document.getElementById('inventory');
    
    if (outputEl) {
        outputEl.textContent = gameState.outputBuffer;
        outputEl.scrollTop = outputEl.scrollHeight;
    }
    
    if (gameState.player) {
        // Update HUD
        const hud = format_hud(gameState.player);
        if (hudEl) hudEl.innerHTML = `<div class="hud">${hud}</div>`;
        
        // Update stats
        const stats = format_stats(gameState.player);
        if (statsEl) statsEl.innerHTML = stats;
        
        // Update inventory
        const inventory = format_inventory(gameState.player);
        if (inventoryEl) inventoryEl.innerHTML = inventory;
    }
    
    // Update input prompt
    const inputEl = document.getElementById('user-input');
    if (inputEl) {
        inputEl.placeholder = gameState.waitingForInput ? gameState.inputPrompt : "> ";
        if (gameState.waitingForInput) {
            inputEl.focus();
        }
    }
}

function format_hud(player) {
    const hud = `[E:${player.energy} H:${player.hunger} V:${player.vitality} S:${player.soul} $:${player.money.toFixed(0)}]`;
    const tips = [];
    
    if (player.energy < 15) {
        tips.push("LOW ENERGY - most actions locked. Try 'G' (quick fix) or '5' (rest).");
    }
    if (player.hunger < 20) {
        tips.push("STARVING - eat something or you'll start losing health.");
    }
    if (player.vitality < 25) {
        tips.push("VITALITY CRITICAL - your body is breaking down. Rest matters more than money right now.");
    }
    if (!player.has_clean_water) {
        tips.push("NO CLEAN WATER - cooking and dishes are off the table.");
    }
    if (player.food_supply_days <= 0 && !player.has_job) {
        tips.push("NO FOOD STOCKED - scavenge, hunt bottles, or hit the store.");
    }
    
    let tipsHtml = "";
    if (tips.length > 0) {
        tipsHtml = tips.map(t => `<div class="tips">\u26a0 ${t}</div>`).join("");
    }
    
    return `${hud}${tipsHtml}`;
}

function format_stats(player) {
    const getStatClass = (value, max) => {
        const pct = (value / max) * 100;
        if (pct < 25) return "stat-critical";
        if (pct < 50) return "stat-warning";
        return "stat-good";
    };
    
    let html = `<div class="stat-row"><span class="stat-label">Money:</span> <span class="stat-value">$${player.money.toFixed(2)}</span></div>`;
    html += `<div class="stat-row"><span class="stat-label">Reputation:</span> <span class="stat-value">${player.reputation}/100</span></div>`;
    html += `<div class="stat-row"><span class="stat-label">Soul:</span> <span class="stat-value">${player.soul}/100</span></div>`;
    html += `<div class="stat-row"><span class="stat-label">Legitimacy:</span> <span class="stat-value">${player.legitimacy}/100</span></div>`;
    html += `<div class="stat-row"><span class="stat-label">Criminal:</span> <span class="stat-value">${player.criminal_influence}/100</span></div>`;
    html += `<div class="stat-row"><span class="stat-label">Energy:</span> <span class="stat-value class="${getStatClass(player.energy, 100)}">${player.energy}/100</span></div>`;
    html += `<div class="stat-row"><span class="stat-label">Hunger:</span> <span class="stat-value class="${getStatClass(player.hunger, 100)}">${player.hunger}/100</span></div>`;
    html += `<div class="stat-row"><span class="stat-label">Vitality:</span> <span class="stat-value class="${getStatClass(player.vitality, 100)}">${player.vitality}/100</span></div>`;
    html += `<div class="stat-row"><span class="stat-label">Paper Trail:</span> <span class="stat-value">${player.paper_trail}/100</span></div>`;
    
    if (player.has_job) {
        html += `<div class="stat-row"><span class="stat-label">Job:</span> <span class="stat-value">${player.employer}</span></div>`;
        html += `<div class="stat-row"><span class="stat-label">Week:</span> <span class="stat-value">${player.week_number} (Day ${player.day - player.week_start_day + 1}/7)</span></div>`;
    }
    
    return html;
}

function format_inventory(player) {
    let html = "";
    player.inventory.forEach(item => {
        html += `<li>${item}</li>`;
    });
    
    // Add special items
    if (player.cat_food_days > 0) {
        html += `<li>Cat Food (${player.cat_food_days} days)</li>`;
    }
    if (player.toilet_paper_rolls > 0) {
        html += `<li>Toilet Paper (${player.toilet_paper_rolls} rolls)</li>`;
    }
    if (player.food_supply_days > 0) {
        html += `<li>Food Supply (${player.food_supply_days} days)</li>`;
    }
    if (player.candy_bars > 0) {
        html += `<li>Candy Bars (${player.candy_bars})</li>`;
    }
    if (player.energy_drinks > 0) {
        html += `<li>Energy Drinks (${player.energy_drinks})</li>`;
    }
    if (player.coffee_packets > 0) {
        html += `<li>Coffee Packets (${player.coffee_packets})</li>`;
    }
    
    return html;
}

function check_phase(player) {
    if (player.day >= 20 && gameState.game_phase === GAME_PHASES.PRE_LOCKDOWN) {
        gameState.game_phase = GAME_PHASES.LOCKDOWN;
        gameState.lockdown_day = player.day;
        slow_print("\n*** LOCKDOWN DECLARED ***");
    } else if (player.day >= 50 && gameState.game_phase === GAME_PHASES.LOCKDOWN) {
        gameState.game_phase = GAME_PHASES.NEW_NORMAL;
        slow_print("\n*** LOCKDOWN LIFTED ***");
    }
}

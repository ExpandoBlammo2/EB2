# =============================================================
#  SECTION 8 PINES — A Survival Simulation
#  Save this file as: section8pines.py
#  Run with: python section8pines.py
# =============================================================

import time
import random
import sys
import traceback

STARTING_MONEY = 12.40

# =============================================================
# UTILITY
# =============================================================

def slow_print(text, delay=0.035):
    for char in text:
        print(char, end='', flush=True)
        time.sleep(delay)
    print()

def pause(message="\n[Press enter to continue]"):
    try:
        input(message)
    except EOFError:
        pass

def safe_input(prompt="> "):
    try:
        return input(prompt)
    except EOFError:
        return ""

# =============================================================
# PLAYER CLASS
# =============================================================

class Player:
    def __init__(self):
        self.name = safe_input("Enter your name (or press enter for 'New Tenant'): ").strip() or "New Tenant"
        self.money = STARTING_MONEY
        self.reputation = 35
        self.soul = 78
        self.legitimacy = 40
        self.criminal_influence = 0
        self.inventory = ["2 Cats", "Old POV", "Blankets", "Clothes"]
        self.cat_food_days = 2
        self.toilet_paper_rolls = 12
        self.known_characters = []
        self.day = 0
        self.has_job = False
        self.energy = 100
        self.hunger = 60
        self.cat_mood = "restless"
        self.day_actions_used = 0
        self.max_actions_per_day = 5
        self.employer = None
        self.week_number = 1
        self.week_start_day = 1
        self.days_worked_this_week = 0
        self.days_rested_this_week = 0
        self.days_missed_this_week = 0
        self.extra_shifts_this_week = 0
        self.terminated = False
        self.let_lisa_in = False
        self.employment_type = "none"
        self.power_paid = False
        self.paper_trail = 0
        self.ebt = None
        self.assistance = None
        self.ebt_active = False
        self.smoker_type = "none"
        self.bodycam_owned = False
        self.has_book = False
        self.has_bidet = False
        self.cooking_skill = 0
        self.mechanics_skill = 0
        self.plant_skill = 0
        self.plumbing_skill = 0
        self.has_camp_stove = False
        self.has_tool_kit = False
        self.has_solar_panel = False
        self.has_planter = False
        self.planter_seeded = False
        self.planter_watered_today = False
        self.gardening_days = 0
        self.farmer_market_day = None
        self.food_supply_days = 0
        self.cooked_meals_available = 0
        self.tina_debt = 0
        self.lisa_debt = 0
        self.sti_risk = False
        self.tina_interactions = 0
        self.tina_trust = 0
        self.tina_bold_flag = False
        self.tina_had_sex = False
        self.diner_meal_today = False
        self.dishes_dirty = 0
        self.has_clean_water = True
        self.alcohol_level = 0
        self.drug_use = []
        self.last_porch_choice = None
        self.lisa_had_sex = False
        self.lisa_stiffed_me = False
        self.lisa_let_in_before = False
        self.lisa_helped_steal = False
        self.lisa_gave_intel = False
        self.tom_relationship = 0
        self.tom_trust = 0
        self.tom_jobs_done = 0
        self.tom_jobs_failed = 0
        self.tom_paid = 0.0
        self.water_days_without = 0
        self.garbage_days_without = 0
        self.water_fine_paid = False
        self.garbage_fine_paid = False
        self.vitality = 50

    def show_status(self):
        print()
        print(f"=== Day {self.day} (Week {self.week_number}) - Section 8 Pines ===")
        print(f"Money: ${self.money:.2f}")
        print(f"Reputation: {self.reputation}/100   Soul: {self.soul}/100")
        print(f"Legitimacy: {self.legitimacy}/100   Criminal: {self.criminal_influence}/100")
        print(f"Inventory: {', '.join(self.inventory)}")
        print(f"Cats: {self.cat_mood} (Food: {self.cat_food_days} days)   TP: {self.toilet_paper_rolls} rolls")
        print(f"Energy: {self.energy}/100   Hunger: {self.hunger}/100   Vitality: {self.vitality}/100")
        print(f"Food on hand: {self.food_supply_days} days   Cooked meals: {self.cooked_meals_available}")
        print(f"Dishes dirty: {self.dishes_dirty}")
        if self.alcohol_level > 0:
            print(f"Alcohol level: {self.alcohol_level}/10")
        if not self.has_clean_water:
            print(f"*** NO CLEAN WATER (Day {self.water_days_without}) ***")
        print(f"Skills: Cook {self.cooking_skill}/10  Mech {self.mechanics_skill}/10  Plant {self.plant_skill}/10  Plumb {self.plumbing_skill}/10")
        if self.ebt_active and self.ebt:
            print(f"EBT: Active (Balance: ${self.ebt.balance:.2f})")
        print(f"Paper Trail: {self.paper_trail}/100")
        if self.has_job:
            print(f"Job: {self.employer}   Week {self.week_number} (day {self.day - self.week_start_day + 1}/7) - Worked: {self.days_worked_this_week}  Rested: {self.days_rested_this_week}/1 required  Missed: {self.days_missed_this_week}")
        if self.tina_debt > 0:
            print(f"YOU OWE TINA: ${self.tina_debt:.2f}")
        if self.lisa_debt > 0:
            print(f"YOU OWE LISA: ${self.lisa_debt:.2f}")
        if self.tom_relationship > 0:
            rel_labels = ["Stranger", "Acquaintance", "Tested", "Runner", "Trusted Partner"]
            print(f"Tom's Trust: {rel_labels[min(self.tom_relationship, 4)]} (Jobs: {self.tom_jobs_done} done, {self.tom_jobs_failed} failed)")
        if self.has_planter:
            status = "planted" if self.planter_seeded else "empty"
            watered = " (watered today)" if self.planter_watered_today else " (NEEDS WATER)"
            print(f"Planter: {status}{watered}   Garden days: {self.gardening_days}")

# =============================================================
# RESIDENTS DATABASE
# =============================================================

residents = {
    "Tina": {"desc": "Late 50s, chain smoker. Predatory smile. Transactional. Bolder than she looks - she doesn't tip-toe when she wants something.", "player_rep": 0, "anger": 0, "drunk": False},
    "Gabe": {"desc": "Thin, hollow-eyed. Heavy drinker.", "player_rep": 0, "anger": 0, "drunk": False},
    "Lisa": {"desc": "Gaunt, track marks. Information broker. Flirty, opportunistic, quick to lift something unattended - but not a brawler.", "player_rep": 0, "anger": 0, "drunk": True},
    "Frank": {"desc": "Ex-military, convicted. Dangerous.", "player_rep": 0, "anger": 0, "drunk": True},
    "Phyllis": {"desc": "75, dementia. Mostly oblivious.", "player_rep": 0, "anger": 0, "drunk": False},
    "Bill": {"desc": "50s, lube shop. Grumpy.", "player_rep": 0, "anger": 0, "drunk": True},
    "Gladys": {"desc": "500+ lbs. Diapers.", "player_rep": 0, "anger": 0, "drunk": False},
    "Rebecca": {"desc": "Late 60s. Closet drunk. Gossiper. Transactional.", "player_rep": 0, "anger": 0, "drunk": True},
    "Tom": {"desc": "65, drug runner.", "player_rep": 0, "anger": 0, "drunk": False},
}

def change_rep(name, amount):
    if name in residents:
        residents[name]["player_rep"] = max(-100, min(100, residents[name]["player_rep"] + amount))

def change_anger(name, amount):
    if name in residents:
        residents[name]["anger"] = max(0, min(100, residents[name]["anger"] + amount))

# =============================================================
# PHASE
# =============================================================

game_phase = "pre_lockdown"
lockdown_day = None

def check_phase(player):
    global game_phase, lockdown_day
    if player.day >= 20 and game_phase == "pre_lockdown":
        game_phase = "lockdown"
        lockdown_day = player.day
        slow_print("\n*** LOCKDOWN DECLARED ***")
    elif player.day >= 50 and game_phase == "lockdown":
        game_phase = "new_normal"
        slow_print("\n*** LOCKDOWN LIFTED ***")

# =============================================================
# PAPER TRAIL
# =============================================================

def init_paper_trail(player):
    if not hasattr(player, 'paper_trail'):
        player.paper_trail = 0

def document_event(player, amount=10, description=""):
    init_paper_trail(player)
    player.paper_trail = min(100, player.paper_trail + amount)
    slow_print(f"You document: {description}. (Paper trail: {player.paper_trail}/100)")

# =============================================================
# ASSISTANCE / EBT
# =============================================================

class AssistanceApplication:
    def __init__(self):
        self.ebt_applied = False
        self.ebt_approved = False
        self.ebt_processing_days = 0
        self.energy_applied = False
        self.energy_approved = False
        self.energy_processing_days = 0
        self.has_id = False
        self.has_power_bill = False
        self.photocopies_made = False

def init_assistance(player):
    if player.assistance is None:
        player.assistance = AssistanceApplication()

class EBT:
    def __init__(self):
        self.balance = 0.0
        self.monthly_allotment = 290.0
        self.last_deposit_day = 0

def init_ebt(player):
    if not hasattr(player, 'ebt') or player.ebt is None:
        player.ebt = EBT()
        player.ebt.balance = 290.0
        player.ebt.last_deposit_day = player.day

def process_ebt(player):
    if not hasattr(player, 'ebt') or player.ebt is None: return
    if player.ebt.last_deposit_day == 0:
        player.ebt.last_deposit_day = player.day
        return
    if player.day - player.ebt.last_deposit_day >= 30:
        if player.has_job:
            if player.employment_type == "W2":
                player.ebt.monthly_allotment = max(50, 290 - 100)
            elif player.employment_type == "1099":
                player.ebt.monthly_allotment = max(50, 290 - 80)
            else:
                player.ebt.monthly_allotment = 290
        else:
            player.ebt.monthly_allotment = 290
        player.ebt.balance += player.ebt.monthly_allotment
        player.ebt.last_deposit_day = player.day
        slow_print(f"EBT deposit: ${player.ebt.monthly_allotment:.2f}.")

def ebt_spending_menu(player):
    """EBT grocery shopping. Reachable both automatically and as a normal
       action from the morning menu. Deducts from ebt.balance only -
       never touches cash. Cash purchases live in daily_shopping()."""
    if not player.ebt_active or not player.ebt:
        slow_print("\nYou don't have an active EBT card yet.")
        return
    if player.ebt.balance <= 0:
        slow_print("\nEBT balance: $0.00. Nothing to spend until next deposit.")
        return
    print(f"\n--- EBT GROCERY SHOPPING (Balance: ${player.ebt.balance:.2f}) ---")
    print("1 = Grocery Outlet staples ($30) - +3 days food supply (best prices, friendlier staff)")
    print("2 = Fred Meyer full run ($50) - +5 days food supply, +2 soul (corporate, pricier)")
    print("3 = Bi-Mart canned goods ($15) - +2 days food supply (small chain, no coupons)")
    print("4 = The Bread Place (free) - +1 day food (donations welcome)")
    print("5 = Skip")
    choice = safe_input("> ").strip()
    if choice == "1" and player.ebt.balance >= 30:
        player.ebt.balance -= 30; player.food_supply_days += 3
        slow_print(f"EBT charged $30. Balance: ${player.ebt.balance:.2f}")
    elif choice == "2" and player.ebt.balance >= 50:
        player.ebt.balance -= 50; player.food_supply_days += 5; player.soul += 2
        slow_print(f"EBT charged $50. Balance: ${player.ebt.balance:.2f}")
    elif choice == "3" and player.ebt.balance >= 15:
        player.ebt.balance -= 15; player.food_supply_days += 2
        slow_print(f"EBT charged $15. Balance: ${player.ebt.balance:.2f}")
    elif choice == "4":
        player.food_supply_days += 1
        if safe_input("Donate a dollar (cash) to The Bread Place? (y/n): ").strip() == "y":
            player.money = max(0, player.money - 1)
            player.soul += 5
            slow_print("The volunteer smiles. 'Bless you, hon.'")
    elif choice in ("1", "2", "3"):
        slow_print("Not enough EBT balance for that.")

def ebt_application(player):
    init_assistance(player)
    if player.assistance.ebt_approved: return
    if player.assistance.ebt_applied:
        player.assistance.ebt_processing_days -= 1
        if player.assistance.ebt_processing_days <= 0:
            player.assistance.ebt_approved = True
            slow_print("\n*** EBT APPROVED ***")
            player.ebt_active = True
            init_ebt(player)
        return
    slow_print("\nYou go to the DHS office to apply for food stamps.")
    if safe_input("1 = Fill out form  2 = Skip\n> ").strip() == "1":
        player.assistance.ebt_applied = True
        player.assistance.ebt_processing_days = 7

def energy_assistance_application(player):
    init_assistance(player)
    if player.assistance.energy_approved: return
    if player.assistance.energy_applied:
        player.assistance.energy_processing_days -= 1
        if player.assistance.energy_processing_days <= 0:
            player.assistance.energy_approved = True
            player.power_paid = True; player.soul += 10
            slow_print("\n*** ENERGY ASSISTANCE APPROVED ***")
        return
    slow_print("\nPower bill due. Apply for Energy Assistance?")
    if player.money >= 20 and not player.assistance.has_id:
        if safe_input("1 = Get ID ($20)  2 = Skip\n> ").strip() == "1":
            player.money -= 20; player.energy -= 50
            player.assistance.has_id = True
    if player.money >= 1 and not player.assistance.has_power_bill:
        player.money -= 1; player.assistance.has_power_bill = True
    if player.money >= 1 and not player.assistance.photocopies_made:
        player.money -= 1; player.assistance.photocopies_made = True
    if player.assistance.has_id and player.assistance.has_power_bill and player.assistance.photocopies_made:
        player.assistance.energy_applied = True
        player.assistance.energy_processing_days = 5

# =============================================================
# COOKING / DISHES
# =============================================================

def cook_meal(player):
    if not player.has_camp_stove:
        slow_print("You need a camp stove to cook."); return
    if not player.has_clean_water:
        slow_print("No clean water. You can't safely cook."); return
    if player.food_supply_days <= 0:
        slow_print("No raw ingredients to cook."); return

    has_pot = "Large Pot" in player.inventory
    has_pan = "Frying Pan" in player.inventory
    has_cookware = has_pot or has_pan

    if not has_cookware:
        slow_print("You need cookware (a pot or pan) to cook."); return

    print("\nWhat do you want to cook?")
    print("1 = Dried beans (slow, filling, +35 hunger, +2 soul)")
    print("2 = Simple pasta (quick, +25 hunger)")
    print("3 = Fried whatever (use up scraps, +20 hunger)")
    print("4 = Cancel")
    choice = safe_input("> ").strip()

    if choice == "1":
        if not has_pot:
            slow_print("You need a large pot for beans."); return
        slow_print("You soak the beans overnight. In the morning you simmer them.")
        if player.cooking_skill >= 5:
            slow_print("They're tender. Onions, salt, a little lard. It tastes like home.")
        else:
            slow_print("They're a little undercooked. But they're hot. They're food.")
        player.food_supply_days = max(0, player.food_supply_days - 1)
        player.hunger = min(100, player.hunger + 35)
        player.soul += 2
        player.cooking_skill = min(10, player.cooking_skill + 1)
        player.dishes_dirty += 1
    elif choice == "2":
        slow_print("Boil water. Dump pasta. Five minutes. Done.")
        player.food_supply_days = max(0, player.food_supply_days - 1)
        player.hunger = min(100, player.hunger + 25)
        player.cooking_skill = min(10, player.cooking_skill + 1)
        player.dishes_dirty += 1
    elif choice == "3":
        if not has_pan:
            slow_print("You need a frying pan."); return
        slow_print("Whatever's in the pan. Oil. Heat. Eat.")
        player.food_supply_days = max(0, player.food_supply_days - 1)
        player.hunger = min(100, player.hunger + 20)
        player.dishes_dirty += 1
    else:
        return

def wash_dishes(player):
    if not player.has_clean_water:
        slow_print("No clean water. You can't wash dishes."); return
    if player.dishes_dirty <= 0:
        slow_print("No dishes to wash."); return
    print(f"\nDirty dishes: {player.dishes_dirty}")
    print("1 = Wash them all (uses water + soap, -5 energy, +5 soul)")
    print("2 = Quick rinse (uses less water, -2 energy)")
    print("3 = Leave them (dishes attract bugs)")
    choice = safe_input("> ").strip()
    if choice == "1":
        slow_print("Hot water. Dish soap. Elbow grease.")
        slow_print("The cats watch the water drip. You scrub until your hands hurt.")
        slow_print("There's a rhythm to it. A kind of meditation. You feel your soul lighten.")
        slow_print("(This is where you first imagined 'Escape from Section 8.' The idea crystallizes.)")
        player.dishes_dirty = 0
        player.energy -= 5
        player.soul += 5
        player.vitality = min(100, player.vitality + 2)
    elif choice == "2":
        slow_print("Cold rinse. It'll do.")
        player.dishes_dirty = max(0, player.dishes_dirty - 2)
        player.energy -= 2
    else:
        slow_print("The dishes sit. Flies gather. It smells.")
        player.soul -= 2

# =============================================================
# DRUGS / ALCOHOL
# =============================================================

def consume_alcohol(player, amount=3):
    player.alcohol_level = min(10, player.alcohol_level + amount)
    if player.alcohol_level >= 8:
        slow_print("You're wasted. The world spins.")
    elif player.alcohol_level >= 5:
        slow_print("You're drunk. Everything feels warm and blurred.")
    else:
        slow_print("You feel a buzz.")

def sober_up(player):
    if player.alcohol_level > 0:
        player.alcohol_level = max(0, player.alcohol_level - 1)
        if player.alcohol_level == 0:
            slow_print("You sober up. Headache. Cottonmouth.")

def drug_use(player, drug_name):
    player.drug_use.append((player.day, drug_name))
    if drug_name == "meth":
        slow_print("The crystal hits hard. Energy surges. You're invincible. For a while.")
        player.energy = 100
        player.soul -= 5
        player.hunger = max(0, player.hunger - 20)
        player.vitality = max(0, player.vitality - 10)
        if random.random() < 0.3:
            slow_print("(Side effect: you crash hard later. -50 energy tomorrow morning.)")
            player.energy -= 30
    elif drug_name == "heroin":
        slow_print("Warm blanket. The world disappears. You float.")
        player.soul -= 8
        player.energy = 0
        player.vitality = max(0, player.vitality - 15)
    elif drug_name == "shrooms":
        slow_print("The colors. The patterns. The cats are speaking to you.")
        player.soul += 5
        player.hunger = max(0, player.hunger - 10)
    elif drug_name == "weed":
        slow_print("You relax. Everything is funny. The cats are funny.")
        player.soul += 2
        player.hunger = min(100, player.hunger + 15)

# =============================================================
# NEIGHBOR CHAT WITH DRUG SUB-CHOICES
# =============================================================

def neighbor_chat(player):
    slow_print("\nYou sit on the porch. The air is still.")
    print("1 = Just sit and smoke tobacco")
    print("2 = Smoke weed")
    print("3 = Smoke shrooms")
    print("4 = Smoke heroin")
    print("5 = Smoke meth")
    print("6 = Talk to a neighbor")
    print("7 = Play with cat")
    print("8 = Read book")
    choice = safe_input("> ").strip()
    if choice == "1":
        slow_print("You light a cigarette. The smoke curls into the evening.")
        player.soul += 1
        player.last_porch_choice = "tobacco"
    elif choice == "2":
        slow_print("You pull out a joint. The sweet smell drifts.")
        drug_use(player, "weed")
        player.last_porch_choice = "weed"
    elif choice == "3":
        slow_print("You chew on mushroom caps. It's bitter at first.")
        drug_use(player, "shrooms")
        player.last_porch_choice = "shrooms"
    elif choice == "4":
        slow_print("You cook the brown powder. The spoon. The needle.")
        drug_use(player, "heroin")
        player.last_porch_choice = "heroin"
    elif choice == "5":
        slow_print("You heat the pipe. The glass crackles.")
        drug_use(player, "meth")
        player.last_porch_choice = "meth"
    elif choice == "6":
        neighbor = random.choice(list(residents.keys()))
        if residents[neighbor].get("drunk", False) and random.random() < 0.6:
            slow_print(f"{neighbor} is too drunk."); return
        slow_print(f"{neighbor} joins you.")
        if random.random() < 0.5:
            topic = random.choice([
                "Hiring fair next week.", "Police presence heavy.",
                "Tina's got a new guy.", "Lisa owes money.", "Earl is short-staffed.",
            ])
            slow_print(f"'{topic}'")
            player.soul += 3
        player.reputation += 2
    elif choice == "7":
        play_with_cats(player)
    elif choice == "8":
        read_book(player)
    else:
        slow_print("You just sit. The world goes by.")

# =============================================================
# LEARNING / SKILLS
# =============================================================

def learn_skill(player):
    slow_print("\nYou want to learn something. Why?")
    print("1 = My sink is leaking (PLUMBING)")
    print("2 = I want to grow tomatoes (GARDENING)")
    print("3 = I want to cook better (COOKING)")
    print("4 = My car is making a noise (MECHANICS)")
    print("5 = I'm just curious (free choice)")
    print("6 = Skip")
    need = safe_input("> ").strip()
    skill_map = {"1": "plumbing", "2": "plant", "3": "cooking", "4": "mechanics"}
    if need == "5":
        print("Which skill?  1=Plumbing  2=Gardening  3=Cooking  4=Mechanics")
        s = safe_input("> ").strip()
        if s == "1": skill = "plumbing"
        elif s == "2": skill = "plant"
        elif s == "3": skill = "cooking"
        elif s == "4": skill = "mechanics"
        else: return
    elif need in skill_map:
        skill = skill_map[need]
    else:
        return
    slow_print("\nHow do you want to learn?")
    print("1 = Watch a free YouTube tutorial (-10 energy)")
    print("2 = Read a book you own (-5 energy)")
    print("3 = Take a free class at the library (-15 energy)")
    print("4 = Take a community college class ($50, -20 energy, +3 skill)")
    print("5 = Learn from a neighbor (varies)")
    print("6 = Skip")
    choice = safe_input("> ").strip()
    if choice == "1" and player.energy >= 10:
        slow_print("You find a video. You take notes on a napkin.")
        player.energy -= 10
        gain = 1
    elif choice == "2" and player.has_book and player.energy >= 5:
        slow_print("You read the relevant chapter.")
        player.energy -= 5
        gain = 1
    elif choice == "3" and player.energy >= 15:
        slow_print("You walk to the library. The class is small.")
        player.energy -= 15
        player.reputation += 2; player.soul += 5
        gain = 1
    elif choice == "4" and player.money >= 50 and player.energy >= 20:
        slow_print("Community college. You sit in the back. You learn.")
        player.money -= 50; player.energy -= 20
        player.legitimacy += 5
        gain = 3
    elif choice == "5":
        slow_print("Tina says she 'knows a guy.' It'll cost you $20.")
        if player.money >= 20 and safe_input("Pay $20? (y/n): ").strip() == "y":
            player.money -= 20
            slow_print("The guy shows you. You learn fast.")
            gain = 2
        else:
            slow_print("You learn the hard way, on your own.")
            gain = 1
    else:
        slow_print("You don't have the resources for that.")
        return
    if skill == "plumbing":
        player.plumbing_skill = min(10, player.plumbing_skill + gain)
    elif skill == "plant":
        player.plant_skill = min(10, player.plant_skill + gain)
    elif skill == "cooking":
        player.cooking_skill = min(10, player.cooking_skill + gain)
    elif skill == "mechanics":
        player.mechanics_skill = min(10, player.mechanics_skill + gain)
    slow_print(f"Your {skill} skill increased to {getattr(player, skill + '_skill')}/10.")

# =============================================================
# SHOPPING - CART SYSTEM (cash only)
# =============================================================

def _apply_cat_food(player, qty):
    player.cat_food_days += 3 * qty
    return f"Cat food +{3*qty} days."

def _apply_cat_litter(player, qty):
    player.cat_mood = "content"
    return "Litter refreshed."

def _apply_tp(player, qty):
    player.toilet_paper_rolls += 12 * qty
    return f"TP +{12*qty} rolls."

def _apply_bidet(player, qty):
    if player.has_bidet: return "You already have a bidet."
    player.has_bidet = True
    player.inventory.append("Bidet")
    return "Bidet installed."

def _apply_book(player, qty):
    if not player.has_book:
        player.has_book = True
        player.inventory.append("Used Book")
    return "Book acquired."

def _apply_wrench_set(player, qty):
    player.mechanics_skill = min(10, player.mechanics_skill + qty)
    player.has_tool_kit = True
    if "Wrench Set" not in player.inventory: player.inventory.append("Wrench Set")
    return f"Tool kit acquired. Mechanics skill +{qty}."

def _apply_screwdriver_set(player, qty):
    player.has_tool_kit = True
    player.mechanics_skill = min(10, player.mechanics_skill + qty)
    if "Screwdriver Set" not in player.inventory: player.inventory.append("Screwdriver Set")
    return f"Screwdriver set acquired. Mechanics skill +{qty}."

def _apply_duct_tape(player, qty):
    if "Duct Tape" not in player.inventory: player.inventory.append("Duct Tape")
    return "Duct tape. Fixes everything. Almost."

def _apply_plywood(player, qty):
    for _ in range(qty): player.inventory.append("Plywood Sheet")
    return f"{qty} plywood sheet(s) for building."

def _apply_2x4(player, qty):
    for _ in range(qty): player.inventory.append("2x4 Lumber")
    return f"{qty} 2x4(s) for framing."

def _apply_solar_panel(player, qty):
    if not player.has_solar_panel:
        player.has_solar_panel = True
        player.inventory.append("Solar Panel Kit")
    return "Solar panel kit. Off-grid power."

def _apply_boots(player, qty):
    if "Good Boots" not in player.inventory:
        player.inventory.append("Good Boots")
    return "Good boots acquired."

def _apply_stove(player, qty):
    if not player.has_camp_stove:
        player.has_camp_stove = True
        player.inventory.append("Camp Stove")
    return "Camp stove acquired."

def _apply_bodycam(player, qty):
    if not player.bodycam_owned:
        player.bodycam_owned = True
        player.inventory.append("Body Camera")
    return "Body cam acquired."

def _apply_bulk_food(player, qty):
    player.food_supply_days += 7 * qty
    return f"Bulk food +{7*qty} days."

def _apply_dried_beans(player, qty):
    player.food_supply_days += 5 * qty
    player.inventory.append(f"Dried Beans x{qty}")
    return f"Dried beans x{qty} (cheap protein, lasts)."

def _apply_seeds(player, qty):
    player.inventory.append(f"Seeds x{qty}")
    return f"Seeds x{qty}."

def _apply_planter(player, qty):
    if not player.has_tool_kit:
        return "FAILED: Need tool kit first."
    if not player.has_planter:
        player.has_planter = True
        player.inventory.append("Planter Box")
    return "Planter box built."

def _apply_pot(player, qty):
    if "Large Pot" not in player.inventory: player.inventory.append("Large Pot")
    return "Large pot for cooking."

def _apply_pan(player, qty):
    if "Frying Pan" not in player.inventory: player.inventory.append("Frying Pan")
    return "Frying pan for cooking."

def _apply_water_jug(player, qty):
    player.has_clean_water = True
    player.water_days_without = 0
    player.inventory.append(f"Water Jug x{qty}")
    return f"Water jug x{qty} (clean water secured)."

def _apply_dish_soap(player, qty):
    player.inventory.append(f"Dish Soap x{qty}")
    return f"Dish soap x{qty}."

SHOPPING_CATALOG = {
    "1": {"name": "Cat food (3-day supply)", "price": 8, "apply": _apply_cat_food},
    "2": {"name": "Cat litter", "price": 5, "apply": _apply_cat_litter},
    "3": {"name": "Toilet paper (12-pack)", "price": 6, "apply": _apply_tp},
    "4": {"name": "Bidet attachment", "price": 30, "apply": _apply_bidet},
    "5": {"name": "Used book", "price": 3, "apply": _apply_book},
    "6": {"name": "Wrench set", "price": 25, "apply": _apply_wrench_set},
    "7": {"name": "Screwdriver set", "price": 15, "apply": _apply_screwdriver_set},
    "8": {"name": "Duct tape", "price": 4, "apply": _apply_duct_tape},
    "9": {"name": "Plywood sheet", "price": 12, "apply": _apply_plywood},
    "A": {"name": "2x4 lumber", "price": 6, "apply": _apply_2x4},
    "B": {"name": "Solar panel kit", "price": 120, "apply": _apply_solar_panel},
    "C": {"name": "Good boots", "price": 30, "apply": _apply_boots},
    "D": {"name": "Camp stove", "price": 25, "apply": _apply_stove},
    "E": {"name": "Body camera", "price": 60, "apply": _apply_bodycam},
    "F": {"name": "Bulk food (7-day supply)", "price": 15, "apply": _apply_bulk_food},
    "G": {"name": "Seeds (starter pack)", "price": 5, "apply": _apply_seeds},
    "H": {"name": "Planter box materials", "price": 20, "apply": _apply_planter},
    "I": {"name": "Large pot", "price": 8, "apply": _apply_pot},
    "J": {"name": "Frying pan", "price": 8, "apply": _apply_pan},
    "K": {"name": "Dried beans (5-day supply)", "price": 6, "apply": _apply_dried_beans},
    "L": {"name": "Water jug (clean)", "price": 4, "apply": _apply_water_jug},
    "M": {"name": "Dish soap", "price": 3, "apply": _apply_dish_soap},
}

def daily_shopping(player):
    """Cash purchases only. EBT groceries live in ebt_spending_menu (separate action)."""
    cart = []
    slow_print("\nYou head to the store / thrift shop. (Cash only here - EBT groceries are a separate trip.)")
    print(f"\nYou have ${player.money:.2f} cash.")
    print("\nHow to shop: type an item code, then a quantity.")
    print("Type 'cart' to see your cart. 'checkout' to pay. 'leave' to exit.\n")
    while True:
        for code, item in SHOPPING_CATALOG.items():
            print(f"  {code} = {item['name']} (${item['price']} each)")
        print()
        if cart:
            total = sum(SHOPPING_CATALOG[c]["price"] * q for c, q in cart)
            print(f"CART: {cart}  TOTAL: ${total}  CASH: ${player.money:.2f}")
        else:
            print(f"CART: empty  CASH: ${player.money:.2f}")
        print()
        cmd = safe_input("> ").strip().upper()
        if cmd == "LEAVE":
            return
        if cmd == "CART":
            if not cart:
                print("Cart is empty.")
            else:
                for c, q in cart:
                    item = SHOPPING_CATALOG[c]
                    print(f"  {item['name']} x{q} = ${item['price'] * q}")
                total = sum(SHOPPING_CATALOG[c]["price"] * q for c, q in cart)
                print(f"TOTAL: ${total}")
            continue
        if cmd == "CHECKOUT":
            if not cart:
                print("Cart is empty."); continue
            total = sum(SHOPPING_CATALOG[c]["price"] * q for c, q in cart)
            if total > player.money:
                print(f"You can't afford ${total}.")
                if safe_input("Remove items? (y/n): ").strip().lower() == "y":
                    cart = adjust_cart(cart, player.money)
                continue
            player.money -= total
            for c, q in cart:
                msg = SHOPPING_CATALOG[c]["apply"](player, q)
                print(f"  {msg}")
            slow_print(f"You spent ${total} cash. Remaining: ${player.money:.2f}")
            return
        if cmd in SHOPPING_CATALOG:
            try:
                qty = int(safe_input("Quantity: ").strip())
            except:
                qty = 1
            if qty <= 0: qty = 1
            cart.append((cmd, qty))
            item = SHOPPING_CATALOG[cmd]
            print(f"Added: {item['name']} x{qty} = ${item['price'] * qty}")
        else:
            print("Unknown command.")

def adjust_cart(cart, cash):
    while True:
        total = sum(SHOPPING_CATALOG[c]["price"] * q for c, q in cart)
        if total <= cash: return cart
        print(f"\nCart total ${total} exceeds cash ${cash}. Remove items.")
        for i, (c, q) in enumerate(cart):
            print(f"  {i+1}. {SHOPPING_CATALOG[c]['name']} x{q}")
        print("Enter item number to remove, or 'done':")
        choice = safe_input("> ").strip()
        if choice == "done": return cart
        try:
            idx = int(choice) - 1
            if 0 <= idx < len(cart):
                cart.pop(idx); print("Removed.")
        except: pass

# =============================================================
# FARMER'S MARKET (Saturdays, May-Sept)
# =============================================================

def farmer_market(player):
    if player.day % 7 != 2: return
    if player.farmer_market_day == player.day: return
    slow_print("\n*** SATURDAY - SCAPPOOSE FARMER'S MARKET ***")
    print("1 = Participate ($20 booth fee)")
    print("2 = Visit (free)")
    choice = safe_input("> ").strip()
    if choice == "1":
        if player.money < 20:
            slow_print("You don't have $20."); return
        if not has_marketable_product(player):
            slow_print("No product to sell."); return
        player.money -= 20
        player.energy -= 20
        earnings = roll_market_earnings(player)
        player.money += earnings
        player.farmer_market_day = player.day
        player.reputation += 5; player.legitimacy += 5
        slow_print(f"You earned ${earnings:.2f}.")
    else:
        slow_print("You walk the market.")
        player.soul += 5; player.reputation += 2

def has_marketable_product(player):
    if player.has_planter and player.planter_seeded and player.plant_skill >= 3:
        return True
    if "Fresh Flowers" in player.inventory or "Homemade Soap" in player.inventory:
        return True
    return False

def roll_market_earnings(player):
    base = random.uniform(20, 80)
    if player.plant_skill >= 5: base += 30
    if player.mechanics_skill >= 5: base += 20
    return base

# =============================================================
# GARDENING
# =============================================================

def tend_garden(player):
    if not player.has_planter:
        slow_print("No planter."); return
    print("1 = Plant seeds  2 = Water  3 = Harvest  4 = Skip")
    choice = safe_input("> ").strip()
    if choice == "1":
        if not any("Seeds" in s for s in player.inventory):
            slow_print("Need seeds."); return
        player.planter_seeded = True; player.gardening_days = 0
        slow_print("Seeds planted.")
    elif choice == "2":
        if not player.has_clean_water:
            slow_print("No clean water to spare."); return
        if not player.planter_seeded: slow_print("Nothing planted."); return
        player.planter_watered_today = True; player.gardening_days += 1
        slow_print("Watered.")
    elif choice == "3":
        if player.gardening_days < 7:
            slow_print(f"Not ready. {player.gardening_days}/7 days."); return
        threshold = 7 - player.plant_skill
        if random.randint(1, 10) >= threshold:
            harvest = random.choice(["Vegetables", "Flowers", "Herbs"])
            slow_print(f"You harvest {harvest}!")
            if harvest == "Vegetables":
                player.food_supply_days += 3; player.soul += 5
            elif harvest == "Flowers":
                player.inventory.append("Fresh Flowers"); player.soul += 5
            else:
                player.cooking_skill += 1
            player.gardening_days = 0
        else:
            slow_print("Plants withered.")
            player.gardening_days = 0

# =============================================================
# LIBRARY
# =============================================================

def library_event(player):
    slow_print("\nYou walk to the Scappoose Library.")
    print("1 = Local history club  2 = Writers' group  3 = Music instruction")
    print("4 = Game day  5 = Browse books  6 = Leave")
    choice = safe_input("> ").strip()
    if choice == "1":
        player.soul += 8; player.reputation += 3
    elif choice == "2":
        player.soul += 8; player.legitimacy += 2
    elif choice == "3":
        player.soul += 10
    elif choice == "4":
        player.soul += 6; player.reputation += 2
    elif choice == "5":
        player.soul += 4
    else: return
    player.energy -= 10

# =============================================================
# SOUL RESTORATION
# =============================================================

def play_with_cats(player):
    slow_print("\nYou sit on the floor. The cats come to you.")
    slow_print("They purr. They knead the blanket.")
    player.soul = min(100, player.soul + 8)
    player.energy -= 5
    player.cat_mood = "loved"

def read_book(player):
    if not player.has_book:
        slow_print("No book."); return
    slow_print("\nYou open the book.")
    player.soul = min(100, player.soul + 10)
    player.energy -= 5

# =============================================================
# CAT MORNING
# =============================================================

def cat_morning(player):
    print()
    if player.cat_food_days <= 0:
        slow_print("Empty bowl.")
        print("1 = Split food  2 = Scavenge  3 = Let hunt  4 = Close door")
        c = safe_input("> ").strip()
        if c == "1":
            player.hunger = max(0, player.hunger - 15); player.soul += 4; player.cat_mood = "loved"
        elif c == "2":
            player.energy -= 25; player.cat_food_days = 1; player.cat_mood = "fed"
        elif c == "3":
            player.cat_mood = "feral"
        else:
            player.soul -= 8; player.cat_mood = "neglected"
    else:
        slow_print(f"Cats eat. ({player.cat_food_days} days left.)")
        player.cat_food_days -= 1; player.cat_mood = "fed"

# =============================================================
# EMPLOYMENT - unified, strict 7-day week
# =============================================================

JOBS = {
    "Rusty Skillet": {
        "boss": "Earl", "kind": "diner",
        "pay_range": (35, 55), "tips_range": (5, 25),
        "vitality_cost": 8, "meal_perk": True,
    },
    "Miller's Salvage": {
        "boss": "Miller", "kind": "salvage yard",
        "pay_range": (55, 85), "tips_range": (0, 0),
        "vitality_cost": 16, "meal_perk": False,
    },
}

def start_new_week(player):
    player.week_number += 1
    player.week_start_day = player.day + 1
    player.days_worked_this_week = 0
    player.days_rested_this_week = 0
    player.days_missed_this_week = 0
    player.extra_shifts_this_week = 0

def check_week_reset(player):
    """Always fires exactly on the 7th day of the cycle - no exceptions,
       whether or not a rest day was taken."""
    if player.day - player.week_start_day >= 6:
        if player.has_job and not player.terminated:
            evaluate_work_week(player)
        start_new_week(player)

def evaluate_work_week(player):
    slow_print(f"\n=== END OF WEEK {player.week_number} - {player.employer} ===")
    slow_print(f"Days worked: {player.days_worked_this_week}   Rested: {player.days_rested_this_week}   Missed: {player.days_missed_this_week}")
    boss = JOBS[player.employer]["boss"]
    terminated = False
    reason = ""

    if player.days_rested_this_week < 1:
        slow_print(f"{boss}: 'You worked straight through. That ain't healthy.'")
        player.vitality = max(0, player.vitality - 25)
        if player.vitality <= 0:
            terminated = True
            reason = "collapsed from exhaustion"

    if player.days_missed_this_week >= 3 and not terminated:
        slow_print(f"{boss}: 'You missed {player.days_missed_this_week} days. That's a pattern.'")
        if random.random() < 0.7:
            terminated = True
            reason = f"missed {player.days_missed_this_week} days without calling in"

    if player.days_worked_this_week < 3 and not terminated:
        slow_print(f"{boss}: 'You only worked {player.days_worked_this_week} days this week. That's not enough.'")
        print("1 = Apologize and promise to do better")
        print("2 = 'Fire me, then.'")
        print("3 = Beg for another chance")
        c = safe_input("> ").strip()
        if c == "1" and random.random() < 0.6:
            slow_print(f"{boss}: 'One more week. Don't make me regret it.'")
        elif c == "3" and random.random() < 0.4:
            slow_print(f"{boss}: 'Alright. But I'm watching you.'")
        else:
            terminated = True
            reason = "insufficient days worked"

    if terminated:
        slow_print(f"\n*** YOU'VE BEEN TERMINATED FROM {player.employer.upper()} ***")
        slow_print(f"Reason: {reason}")
        player.has_job = False
        player.terminated = True
        player.employer = None
        player.legitimacy -= 20
        player.soul -= 10
    else:
        slow_print(f"{boss}: 'See you next week.'")

def handle_workday(player):
    """Called once automatically at the start of each day the player has a job.
       Single source of truth for work/rest/miss - no nested double-prompts."""
    if not player.has_job or player.terminated:
        return
    job = JOBS[player.employer]
    boss = job["boss"]
    days_into_week = player.day - player.week_start_day
    days_left_in_week = 6 - days_into_week

    slow_print(f"\n--- {player.employer} (Week {player.week_number}, day {days_into_week+1}/7) ---")

    if player.vitality < 20:
        slow_print(f"{boss}: 'You look like death. Go home. That's an order.'")
        player.vitality = min(100, player.vitality + 25)
        player.days_rested_this_week += 1
        return

    if days_left_in_week <= 0 and player.days_rested_this_week < 1:
        slow_print(f"{boss}: 'Last day of the week and you haven't taken a day off. Not negotiable.'")
        player.vitality = min(100, player.vitality + 20)
        player.days_rested_this_week += 1
        player.soul += 3
        return

    print("1 = Work a normal shift")
    print("2 = Take the day off (rest)")
    if player.vitality < 50:
        print("3 = Push through anyway (extra pay, real vitality risk)")
    choice = safe_input("> ").strip()

    if choice == "2":
        player.days_rested_this_week += 1
        player.vitality = min(100, player.vitality + 20)
        player.energy = min(100, player.energy + 20)
        player.soul += 2
        slow_print("You take the day. The cats don't mind the company.")
        return

    if choice == "3" and player.vitality < 50:
        pay = random.uniform(*job["pay_range"]) * 1.15
        slow_print(f"You push through. {boss} notices. 'Appreciate the hustle.'")
        player.money += pay
        player.legitimacy += 1
        player.energy -= 30
        player.vitality = max(0, player.vitality - 18)
        player.days_worked_this_week += 1
        player.extra_shifts_this_week += 1
        return

    pay = random.uniform(*job["pay_range"])
    tips = random.uniform(*job["tips_range"])
    slow_print(f"{boss} nods. You put in the shift. Earned ${pay:.2f}" + (f" + ${tips:.2f} tips." if tips else "."))
    player.money += pay + tips
    player.legitimacy += 3; player.soul += 2
    player.days_worked_this_week += 1
    player.vitality = max(0, player.vitality - job["vitality_cost"])
    player.energy -= 20
    if job["meal_perk"] and not player.diner_meal_today:
        slow_print("Marlene: 'Sit. Eat before you go.'")
        slow_print("A plate slides across the counter. Eggs, toast, hash browns.")
        player.hunger = min(100, player.hunger + 50)
        player.diner_meal_today = True

def apply_for_work(player):
    """Job hunting when unemployed. Two openings in the county right now."""
    if player.has_job:
        slow_print(f"You already work at {player.employer}."); return
    if game_phase == "lockdown":
        slow_print("Nobody's hiring during lockdown."); return

    slow_print("\nWho's hiring around here?")
    print("1 = The Rusty Skillet (diner - people-facing, decent tips, a hot meal on shift)")
    print("2 = Miller's Salvage & Scrap (yard labor - harder on the body, better base pay, no meal)")
    print("3 = Not today")
    choice = safe_input("> ").strip()

    if choice == "1":
        if player.reputation < 25 and player.legitimacy < 30:
            slow_print("Earl looks up, sees you, looks down."); return
        slow_print("Earl: 'You any good with people?'")
        if safe_input("1 = Honest  2 = Confident\n> ").strip() == "1":
            slow_print("Earl nods. 'Come back tomorrow. 6am.'")
            player.legitimacy += 15
            player.has_job = True
            player.employer = "Rusty Skillet"
            player.terminated = False
            start_new_week(player)
            player.week_number = 1
            print("\nPay type:  1=W2  2=1099  3=Under-the-table")
            c = safe_input("> ").strip()
            if c == "1": player.employment_type = "W2"; player.legitimacy += 10
            elif c == "2": player.employment_type = "1099"; player.legitimacy += 5
            else: player.employment_type = "under_the_table"; player.criminal_influence += 5
        else:
            slow_print("Earl: 'Don't need an actor.'")
    elif choice == "2":
        slow_print("Miller looks you over. Arms, hands, boots.")
        slow_print("'You break easy?'")
        if safe_input("1 = 'No.'  2 = 'Depends on the day.'\n> ").strip() == "1":
            slow_print("Miller grunts. 'Good enough. Six am. Steel-toe boots or don't bother.'")
            player.legitimacy += 12
            player.has_job = True
            player.employer = "Miller's Salvage"
            player.terminated = False
            start_new_week(player)
            player.week_number = 1
            player.employment_type = "1099"
        else:
            slow_print("Miller shrugs. 'Everybody breaks eventually. Come back when you're sure.'")
    else:
        slow_print("You keep walking.")

def rest(player):
    """Free rest action, only meaningful when unemployed - employment rest days
       are handled through handle_workday() now."""
    if player.has_job:
        slow_print("Your work schedule handles rest days automatically each morning now.")
        return
    player.energy = min(100, player.energy + 40)
    player.soul += 2
    player.vitality = min(100, player.vitality + 10)
    slow_print("You rest. The cats keep you company.")

# =============================================================
# MORNING ACTIONS (5 actions per day)
# =============================================================

def _job_status_check(player):
    boss = JOBS[player.employer]["boss"]
    slow_print(f"{boss}: 'See you tomorrow, same as always.'")

def morning_actions(player):
    actions = {
        "1": ("Hunt bottles", 25, hunt_bottles),
        "2": ("Scavenge", 30, scavenge),
        "3": ("Look for work" if not player.has_job else "Talk to your boss", 15,
              apply_for_work if not player.has_job else _job_status_check),
        "4": ("Sit on porch", 15, neighbor_chat),
        "5": ("Rest", 0, rest),
        "6": ("Go shopping (cash)", 20, daily_shopping),
        "7": ("Play with cats", 5, play_with_cats),
        "8": ("Read book", 5, read_book),
        "9": ("Cook a meal", 10, cook_meal),
        "A": ("Learn a skill", 10, learn_skill),
        "B": ("Tend garden", 10, tend_garden),
        "C": ("Visit library", 10, library_event),
        "D": ("Wash dishes", 5, wash_dishes),
        "E": ("EBT grocery shopping", 5, ebt_spending_menu),
    }
    while player.energy > 0 and player.day_actions_used < player.max_actions_per_day:
        print(f"\n  Energy: {player.energy}  |  Actions left: {player.max_actions_per_day - player.day_actions_used}")
        for k, (desc, cost, _) in actions.items():
            cost_str = "(restores)" if cost == 0 else f"(-{cost})"
            print(f"  {k} = {desc} {cost_str}")
        choice = safe_input("> ").strip().upper()
        if choice not in actions: continue
        desc, cost, fn = actions[choice]
        if cost > 0 and player.energy < cost:
            slow_print("Too tired."); continue
        if cost == 0 and player.energy >= 100:
            slow_print("Not tired."); continue
        player.energy -= cost
        player.day_actions_used += 1
        fn(player)

def hunt_bottles(player):
    base = random.uniform(8, 22)
    fatigue = player.day * 0.4
    earned = max(2, base - fatigue)
    slow_print(f"Bottles. Found ${earned:.2f}.")
    player.money += earned; player.soul += 1

def scavenge(player):
    roll = random.random()
    if roll < 0.5:
        food = random.choice(["Bread", "Beans", "Donuts"])
        slow_print(f"Found: {food}.")
        player.hunger = min(100, player.hunger + 20)
    elif roll < 0.8:
        slow_print("Picked clean.")
    else:
        slow_print("Owner catches you. You run.")
        player.reputation -= 5; player.energy -= 5

# =============================================================
# TINA - GRADUAL MANIPULATION ESCALATION, BUT BOLDER
# =============================================================

def tina_arc_event(player):
    if not hasattr(player, 'tina_interactions'):
        player.tina_interactions = 0
    if not hasattr(player, 'tina_trust'):
        player.tina_trust = 0

    print()
    print(residents["Tina"]["desc"])

    if player.tina_trust < 10:
        tina_stage_one_assess(player)
    elif player.tina_trust < 25:
        tina_stage_two_generous(player)
    elif player.tina_trust < 40:
        tina_stage_three_boundary(player)
    elif player.tina_trust < 55:
        if not player.tina_bold_flag and random.random() < 0.5:
            tina_overt_third_party_scene(player)
        else:
            tina_stage_four_reciprocity(player)
    elif player.tina_trust < 70:
        tina_stage_five_isolation(player)
    else:
        tina_stage_six_the_ask(player)

def tina_stage_one_assess(player):
    slow_print("Tina leans against her doorframe, smoking.")
    slow_print("She watches you. A long, slow look. Then a smile.")
    slow_print("'You're the new one. Cats, right? I heard them yowling.'")
    print("1 = 'Yeah. Just getting settled.' (polite)")
    print("2 = 'You got a problem with cats?' (defensive)")
    print("3 = 'Tina, right? I heard about you.' (curious)")
    print("4 = Nod and walk past (cold)")
    choice = safe_input("> ").strip()
    if choice == "1":
        slow_print("'Settled. Yeah.' She exhales smoke. 'I been here twelve years.'")
        slow_print("'You need anything, you let me know. I take care of my neighbors.'")
        player.soul += 1
        change_rep("Tina", 5)
        player.tina_trust += 7
    elif choice == "2":
        slow_print("She laughs. 'I like animals. So do I.' She winks. 'We'll get along.'")
        change_rep("Tina", 3)
        player.tina_trust += 5
    elif choice == "3":
        slow_print("Her eyes narrow. 'All good things, I hope.' She smiles anyway.")
        change_rep("Tina", 4)
        player.tina_trust += 8
    else:
        slow_print("She watches you go. 'Cold one,' she mutters. 'We'll see.'")
        player.tina_trust += 2
        change_anger("Tina", 5)
    slow_print("(Tina doesn't linger on the read for long. She moves quick once she's decided.)")
    player.tina_interactions += 1

def tina_stage_two_generous(player):
    options = [tina_offer_food, tina_offer_cigarette, tina_offer_loan]
    random.choice(options)(player)

def tina_offer_food(player):
    slow_print("Tina comes over with a paper plate. 'Made too much. You want?'")
    print("1 = Accept gratefully")
    print("2 = Accept but say 'I'll pay you back'")
    print("3 = Decline")
    choice = safe_input("> ").strip()
    if choice == "1":
        slow_print("She hands it over. Her fingers brush yours. 'You're too thin, baby.'")
        player.hunger = min(100, player.hunger + 30)
        player.soul += 2
        player.tina_trust += 7
        change_rep("Tina", 8)
    elif choice == "2":
        slow_print("'Pay me back? With what?' She laughs. 'Just eat. Friends help friends.'")
        player.hunger = min(100, player.hunger + 30)
        player.tina_trust += 9
        change_rep("Tina", 10)
    else:
        slow_print("'Suit yourself. Door's always open.' She takes it back.")
        change_rep("Tina", -3)
    player.tina_interactions += 1

def tina_offer_cigarette(player):
    slow_print("Tina lights two cigarettes. Hands you one.")
    print("1 = Smoke with her")
    print("2 = 'I don't smoke.'")
    print("3 = Take it but don't light it (polite)")
    choice = safe_input("> ").strip()
    if choice == "1":
        slow_print("You sit on the steps together. She tells you about the old days.")
        slow_print("'I used to be pretty, you know. Before the meth. Before the DUI.'")
        slow_print("She touches your shoulder. 'You're not bad looking. A little rough.'")
        player.soul += 3
        player.tina_trust += 8
        change_rep("Tina", 7)
    elif choice == "2":
        slow_print("'Smart. I wish I quit.' She chainsmokes anyway.")
        change_rep("Tina", 2)
    else:
        slow_print("She watches you pocket it. 'For later? You liar.' She smiles.")
        player.tina_trust += 4
        change_rep("Tina", 4)
    player.tina_interactions += 1

def tina_offer_loan(player):
    slow_print("Tina counts cash in her doorway. Doesn't hide it.")
    slow_print("'Short on funds? I can spot you twenty. No rush.'")
    print("1 = 'Yeah, that'd help. Thanks.'")
    print("2 = 'What's the catch?'")
    print("3 = 'I'm good.'")
    choice = safe_input("> ").strip()
    if choice == "1":
        player.money += 20
        player.tina_debt += 20
        player.tina_trust += 10
        change_rep("Tina", 12)
    elif choice == "2":
        slow_print("'Catch? Jesus. Just neighborly. Forget I asked.'")
        change_rep("Tina", -5)
        change_anger("Tina", 10)
        player.tina_trust += 2
    else:
        slow_print("'Alright. Pride's expensive around here.'")
        change_rep("Tina", 1)
    player.tina_interactions += 1

def tina_stage_three_boundary(player):
    options = [tina_invite_inside, tina_linger_touch, tina_personal_question]
    random.choice(options)(player)

def tina_invite_inside(player):
    slow_print("Tina's in a tank top. The door is open behind her.")
    slow_print("'Want to come in? Got a bottle. We could talk.'")
    print("1 = Go inside")
    print("2 = 'Maybe another time.'")
    print("3 = 'I'd rather not.'")
    choice = safe_input("> ").strip()
    if choice == "1":
        slow_print("Inside, it smells like cigarettes and cats. She pours.")
        slow_print("She sits close. Closer than necessary.")
        slow_print("'You're tense. Relax. I don't bite.'")
        print("1 = Stay  2 = Leave")
        c = safe_input("> ").strip()
        if c == "1":
            slow_print("She touches your thigh. 'You're alright, you know that?'")
            slow_print("You finish the drink. You leave. It felt wrong.")
            player.soul -= 5
            player.tina_trust += 12
            change_rep("Tina", 10)
            if random.random() < 0.3:
                slow_print("(Tina tells Gabe you 'came by for a drink.' She lies.)")
                change_rep("Gabe", -10)
        else:
            slow_print("You excuse yourself. 'Another time,' she says.")
            change_rep("Tina", -5)
            change_anger("Tina", 10)
    elif choice == "2":
        slow_print("'Another time. I'll hold you to that.'")
        player.tina_trust += 4
        change_rep("Tina", 4)
    else:
        slow_print("Her smile hardens. 'Your loss.'")
        change_anger("Tina", 15)
        player.tina_trust += 1
    player.tina_interactions += 1

def tina_linger_touch(player):
    slow_print("Tina hands you something - a rag, a cigarette, a five.")
    slow_print("Her hand lingers on yours.")
    slow_print("'You ever been with an older woman?' she asks, half-laughing.")
    print("1 = 'Once.' (flirt back)")
    print("2 = 'I'm good, Tina.' (deflect)")
    print("3 = Ignore the question, change subject")
    choice = safe_input("> ").strip()
    if choice == "1":
        slow_print("'Mmm. Bet you learned something.' She squeezes your wrist.")
        player.soul -= 3
        player.tina_trust += 9
        change_rep("Tina", 10)
    elif choice == "2":
        slow_print("'Sure you are.' She doesn't believe you.")
        player.tina_trust += 3
        change_rep("Tina", 2)
    else:
        slow_print("She pulls back. 'Fine. Business, then.'")
        change_anger("Tina", 5)
    player.tina_interactions += 1

def tina_personal_question(player):
    slow_print("Tina's watching you. 'You trust anyone here?'")
    print("1 = 'Not really.'")
    print("2 = 'I trust you.'")
    print("3 = 'Why?'")
    choice = safe_input("> ").strip()
    if choice == "1":
        slow_print("'Me neither. That's why we get along.' She sits closer.")
        player.soul += 2
        player.tina_trust += 8
    elif choice == "2":
        slow_print("Her face softens. 'Don't say that. I'm just a fucked-up old lady.'")
        player.tina_trust += 15
        player.soul -= 2
        change_rep("Tina", 15)
    else:
        slow_print("'Just making conversation.' She shrugs. 'Relax.'")
        player.tina_trust += 2
    player.tina_interactions += 1

def tina_overt_third_party_scene(player):
    """The confrontational, risk-taking Tina beat: she doesn't ask outright,
       she just changes the situation and lets the player react. No shaming
       language either way - the player's read/decline is respected."""
    player.tina_bold_flag = True
    slow_print("\nYou're on Tina's porch, smoking. Just the two of you, easy quiet.")
    slow_print("A truck pulls up. A man you don't know gets out, lets himself in like he's done it before.")
    slow_print("Tina says almost nothing to him - a nod, like this was already arranged.")
    slow_print("She disappears down the hall for a couple minutes.")
    slow_print("When she comes back, she's changed - out of her clothes, into a black negligee.")
    slow_print("She doesn't say what she wants. She doesn't have to. The other man is watching you, waiting to see what you do.")
    print("1 = 'I'm gonna head out.' (leave, no confrontation)")
    print("2 = 'What's this about, Tina?' (call it out directly)")
    print("3 = Stay and see where it goes")
    choice = safe_input("> ").strip()
    if choice == "1":
        slow_print("You get up, nod to both of them, and go. Nobody stops you.")
        slow_print("Tina doesn't bring it up again. If anything, she respects that you didn't make it weird.")
        player.soul += 4
        player.tina_trust += 3
        change_rep("Tina", 5)
    elif choice == "2":
        slow_print("Tina shrugs, unbothered. 'Thought you might be into it. No harm in asking without asking.'")
        slow_print("The other guy laughs and lets himself back out. It's over as fast as it started.")
        player.soul += 2
        player.tina_trust += 6
        change_rep("Tina", 8)
    else:
        slow_print("Nobody moves for a second. Then the other man says, 'So we doing this or what?'")
        print("1 = 'Just me and Tina. He goes.'")
        print("2 = 'Not into sharing a room with another guy. I'm out.'")
        print("3 = Go along with whatever happens")
        n = safe_input("> ").strip()
        if n == "1":
            slow_print("The other man clocks it, shrugs, and leaves without drama. Tina seems fine either way.")
            player.tina_trust += 15
            player.tina_had_sex = True
            change_rep("Tina", 15)
            player.soul -= 5
        elif n == "2":
            slow_print("'Didn't peg you for picky,' she says, not unkindly. 'Your call.'")
            slow_print("You leave. It's a little awkward the next time you see her, but she doesn't hold it against you.")
            player.tina_trust += 4
            change_rep("Tina", 6)
            player.soul += 3
        else:
            slow_print("You don't say no, and the night runs long. In the morning it feels like it happened to someone else.")
            player.tina_trust += 18
            player.soul -= 15
            player.sti_risk = True
            change_rep("Tina", 12)
    player.tina_interactions += 1

def tina_stage_four_reciprocity(player):
    options = [tina_ask_ride_small, tina_ask_lighter_thing, tina_ask_smoke_run]
    random.choice(options)(player)

def tina_ask_ride_small(player):
    slow_print("Tina: 'My car's in the shop. Can you drive me to the Safeway? Fifteen minutes.'")
    print("1 = 'Sure.'")
    print("2 = 'I'm busy, Tina.'")
    print("3 = 'I'll do it for gas money.'")
    choice = safe_input("> ").strip()
    if choice == "1":
        slow_print("You drive. She talks the whole way. 'You're sweet, you know that?'")
        slow_print("She 'forgets' her wallet inside. You wait fifteen minutes.")
        slow_print("When she comes out, she has a bag. She doesn't explain.")
        player.energy -= 15
        player.tina_trust += 5
        change_rep("Tina", 5)
    elif choice == "2":
        slow_print("'Busy. Sure.' She lights a cigarette, angry.")
        change_anger("Tina", 15)
        player.tina_trust -= 3
    else:
        slow_print("'Ten bucks. Here.' She hands you a ten.")
        slow_print("You drive her. She goes inside the bar instead of Safeway.")
        slow_print("She comes back tipsy. 'Thanks, baby.'")
        player.money += 10; player.energy -= 15
        player.tina_trust += 3
    player.tina_interactions += 1

def tina_ask_lighter_thing(player):
    slow_print("Tina: 'Can you grab my mail? I don't want to go downstairs.'")
    print("1 = Do it")
    print("2 = 'Get it yourself.'")
    choice = safe_input("> ").strip()
    if choice == "1":
        slow_print("You go down. There's a small package she didn't mention.")
        slow_print("She takes it. 'Thanks. You're a doll.'")
        player.energy -= 5
        player.tina_trust += 6
        change_rep("Tina", 5)
    else:
        slow_print("'Lazy.' She calls Gabe. He does it.")
        change_anger("Tina", 10)
    player.tina_interactions += 1

def tina_ask_smoke_run(player):
    slow_print("Tina: 'I'm out. Can you buy me a pack? I'll pay you back.'")
    print("1 = Buy it for her ($8)")
    print("2 = 'I'll go with you.'")
    print("3 = 'I'm not your errand boy.'")
    choice = safe_input("> ").strip()
    if choice == "1":
        if player.money >= 8:
            player.money -= 8
            player.tina_debt += 8
            player.tina_trust += 5
        else:
            slow_print("'Broke? Jesus. Fine.'")
            change_anger("Tina", 5)
    elif choice == "2":
        slow_print("You walk to the store. She flirts the whole way.")
        player.energy -= 10
        player.tina_trust += 4
    else:
        slow_print("'Cold. Remember that when you need me.'")
        change_anger("Tina", 20)
    player.tina_interactions += 1

def tina_stage_five_isolation(player):
    options = [tina_gossip_exclusion, tina_personal_secret, tina_ask_drive_farther]
    random.choice(options)(player)

def tina_gossip_exclusion(player):
    slow_print("Tina pulls you aside. 'Don't tell anyone, but Lisa's a rat.'")
    slow_print("'She told management about Phyllis's stove. Almost got her evicted.'")
    print("1 = Listen, agree with her")
    print("2 = 'I don't get involved.'")
    print("3 = 'That's not my business.'")
    choice = safe_input("> ").strip()
    if choice == "1":
        slow_print("'You're smart. I can tell you things. I can trust you.'")
        player.tina_trust += 8
        change_rep("Tina", 10)
        change_rep("Lisa", -5)
    elif choice == "2":
        slow_print("'Smart. Keep it that way.' She backs off - for now.")
        player.tina_trust += 2
    else:
        slow_print("'Fine. Be that way.'")
        change_anger("Tina", 10)
    player.tina_interactions += 1

def tina_personal_secret(player):
    slow_print("Tina's voice drops. 'You ever get beaten by a man?'")
    slow_print("She doesn't wait for an answer.")
    slow_print("'Bobby used to. That's why I drink. That's why I'm like this.'")
    slow_print("She's crying. Or pretending to. Hard to tell.")
    print("1 = Put your hand on her shoulder")
    print("2 = Listen, say nothing")
    print("3 = 'I should go.'")
    choice = safe_input("> ").strip()
    if choice == "1":
        slow_print("She grabs your hand. Holds it. 'Don't let go. Just a minute.'")
        player.soul -= 4
        player.tina_trust += 10
        change_rep("Tina", 12)
    elif choice == "2":
        slow_print("She cries. You wait. Eventually she stops.")
        slow_print("'You're a good listener. Most men run.'")
        player.tina_trust += 5
    else:
        slow_print("'Sure. Go.' She wipes her eyes. 'I'll remember you were kind.'")
        player.tina_trust -= 2
        change_anger("Tina", 15)
    player.tina_interactions += 1

def tina_ask_drive_farther(player):
    slow_print("Tina: 'I need to go to St. Helens. Half hour. Will you drive?'")
    print("1 = 'Sure.'")
    print("2 = 'What's in it for me?'")
    print("3 = 'Can't today.'")
    choice = safe_input("> ").strip()
    if choice == "1":
        slow_print("You drive. She talks the whole way. 'You're the only one I trust.'")
        slow_print("You stop at a house. She goes inside for twenty minutes.")
        slow_print("She comes back with a bag. Doesn't say what's in it.")
        player.energy -= 25
        player.tina_trust += 8
        change_rep("Tina", 8)
    elif choice == "2":
        slow_print("'What's in it for you? Jesus. Fifty bucks.'")
        if safe_input("Take the $50? (y/n): ").strip() == "y":
            player.money += 50; player.energy -= 25
            slow_print("You drive her. She goes inside. Comes back with a bag.")
            slow_print("'Don't ask.' (You don't.)")
            player.tina_trust += 5
        else:
            slow_print("'Forget it.' She calls someone else.")
            change_anger("Tina", 15)
    else:
        slow_print("'Fine. I'll find another ride.'")
        change_anger("Tina", 5)
    player.tina_interactions += 1

def tina_stage_six_the_ask(player):
    slow_print("Tina is serious. No smile. No flirt.")
    slow_print("'I need a favor. A real one. You drive, you don't ask questions.'")
    slow_print("'You pick up a package from a guy at the Plaid Pantry. You bring it back to me.'")
    slow_print("'If we get stopped, it's yours. Not mine. You understand?'")
    print("1 = 'What is it?'")
    print("2 = 'That's a setup. I'm not taking the fall for you.'")
    print("3 = 'How much?'")
    print("4 = 'No.'")
    print("5 = '...Okay.'")
    choice = safe_input("> ").strip()
    if choice == "1":
        slow_print("'Don't ask. You don't want to know. Plausible deniability.'")
        slow_print("'But I need your help. You're the only one I trust.'")
        print("1 = 'That's a setup. I'm not taking the fall for you.'")
        print("2 = 'How much?'")
        print("3 = 'No.'")
        print("4 = '...Okay.'")
        choice = safe_input("> ").strip()
    if choice == "2":
        slow_print("'Smart. You're smarter than I gave you credit for.'")
        slow_print("'This is what I get for trusting people.' She walks away.")
        change_anger("Tina", 30)
        player.reputation += 8
        player.tina_trust -= 10
    elif choice == "3":
        slow_print("'Two hundred. Cash. After.'")
        if safe_input("Take it? (y/n): ").strip() == "y":
            slow_print("You go to the Plaid Pantry. A man hands you a small paper bag.")
            slow_print("You drive it back to Tina. She opens it. Smiles.")
            slow_print("'You did good, baby. Here's your two hundred.'")
            if random.random() < 0.25:
                slow_print("Three days later, cops show up. 'We have a complaint.'")
                slow_print("Tina is crying. 'I didn't know. He just gave me a ride.'")
                slow_print("You get a possession charge. Tina walks clean.")
                player.money += 200
                player.criminal_influence += 30
                player.soul -= 25
                player.legitimacy -= 40
                document_event(player, 15, "Tina setup - drug possession charge")
            else:
                slow_print("Nothing happens. You got away with it.")
                player.money += 200
                player.criminal_influence += 25
                player.soul -= 15
        else:
            slow_print("'Then fuck off. I don't need you.'")
            change_anger("Tina", 25)
    elif choice == "4":
        slow_print("Tina nods. 'Wise. Last guy who helped me moved to Texas. Smart man.'")
        player.reputation += 5
    else:
        slow_print("You go to the Plaid Pantry. A man hands you a small paper bag.")
        slow_print("You drive it back to Tina. She opens it. Smiles.")
        slow_print("'You did good, baby. Here's your two hundred.'")
        if random.random() < 0.35:
            slow_print("Three days later, cops show up. 'We have a complaint.'")
            slow_print("Tina is crying. 'I didn't know. He just gave me a ride.'")
            slow_print("You get a possession charge. Tina walks clean.")
            player.money += 200
            player.criminal_influence += 30
            player.soul -= 25
            player.legitimacy -= 40
            document_event(player, 15, "Tina setup - drug possession charge")
        else:
            slow_print("Nothing happens. You got away with it. For now.")
            player.money += 200
            player.criminal_influence += 25
            player.soul -= 15
    player.tina_interactions += 1

# =============================================================
# CONFRONTATION ("we need to talk") - now topic-driven.
# =============================================================

def pick_confrontation_topic(player):
    options = []
    weights = []
    if player.tina_had_sex or player.lisa_had_sex or player.tina_trust > 40:
        options.append("jealousy"); weights.append(3)
    if player.last_porch_choice in ("meth", "heroin", "shrooms") or len(player.drug_use) >= 2:
        options.append("moral_disapproval"); weights.append(3)
    options.append("bully"); weights.append(2)
    return random.choices(options, weights=weights, k=1)[0]

def parole_threat(player):
    women = ["Tina", "Lisa"]
    men = ["Frank", "Gabe"]
    topic = pick_confrontation_topic(player)
    if topic == "jealousy":
        target = random.choice(women + men)
    elif topic == "moral_disapproval":
        target = random.choice(["Bill", "Rebecca", "Gabe"])
    else:
        target = random.choice(["Frank", "Gabe"])
    print()
    print(residents[target]["desc"])
    slow_print(f"{target} corners you. 'We need to talk.'")

    if topic == "jealousy":
        slow_print("'I heard things. You think I don't hear things?'")
        slow_print(f"{target} is puffed up, but there's a waver in it. This is jealousy, not real danger.")
        print("1 = Stand ground ('And? Not your business.')")
        print("2 = Flirt / deflect")
        print("3 = Apologize (de-escalate, costs you some standing)")
        print("4 = Run")
        print("5 = Call police")
        choice = safe_input("> ").strip()
        if choice == "1":
            slow_print(f"{target} blinks first. 'Yeah, well. Just so you know I know.' They back off.")
            player.reputation += 10; player.criminal_influence += 3
        elif choice == "2":
            slow_print("You turn it around on them. 'Jealous?' They splutter and leave, flustered.")
            player.reputation += 5
        elif choice == "3":
            slow_print("You apologize for something you don't owe an apology for. They take the win and go.")
            player.reputation -= 3
        elif choice == "4":
            slow_print("You walk away fast. 'Coward,' they call after you.")
            player.reputation -= 5
        else:
            slow_print("Dispatcher: 'Another Section 8 dispute.' Nothing comes of it.")
            player.reputation -= 3

    elif topic == "moral_disapproval":
        slow_print(f"{target}: 'Word gets around about what you're smoking out there. This place already's got a reputation.'")
        slow_print("'People like you bring in a seedier element. I don't want that around here.'")
        print("1 = Stand ground ('It's my porch, my business.')")
        print("2 = De-escalate ('Fair. I'll keep it low-key.')")
        print("3 = Bluff ('You have no idea what you're talking about.')")
        print("4 = Run")
        print("5 = Call police")
        choice = safe_input("> ").strip()
        if choice in ("1", "3"):
            slow_print(f"{target} suddenly finds somewhere else to be. Talk is all they had.")
            slow_print("(They wanted you to back down quietly. You didn't. They fold.)")
            player.reputation += 8
        elif choice == "2":
            slow_print(f"{target} nods, satisfied, and leaves feeling like they won something small.")
            player.reputation += 2
        elif choice == "4":
            slow_print(f"{target} feels vindicated by you running. 'Figured,' they mutter.")
            player.reputation -= 5
        else:
            slow_print("Dispatcher isn't interested in a smoking complaint. Nothing happens.")
            player.reputation -= 2

    else:
        slow_print(f"{target} is drunk, bored, and looking for someone smaller to lean on. That's you, today.")
        print("1 = Stand ground (knock them down a peg)")
        print("2 = De-escalate")
        print("3 = Bluff")
        print("4 = Run")
        print("5 = Call police")
        choice = safe_input("> ").strip()
        if choice == "1":
            slow_print(f"{target} sways, reconsiders, and backs off. 'Alright, alright. Didn't mean nothin'.'")
            player.reputation += 12; change_rep(target, 10)
        elif choice == "2":
            slow_print("'Fine. Stay out of my way,' they mutter and stumble off.")
            player.reputation += 3
        elif choice == "3":
            slow_print("They squint, unsure if you're serious, and back off. For now.")
            player.reputation += 2
        elif choice == "4":
            slow_print(f"{target} laughs. 'That's what I thought.' Word gets around that you ran from a drunk.")
            player.reputation -= 8
        else:
            slow_print("Nothing happens. The dispatcher's heard it all before.")
            player.reputation -= 3

# =============================================================
# DAILY ENCOUNTERS
# =============================================================

def daily_encounters(player):
    slow_print("\nYou step outside.")
    pool = list(residents.keys())
    random.shuffle(pool)
    count = random.randint(1, 2)
    for i in range(count):
        if i >= len(pool): break
        name = pool[i]
        if residents[name]["anger"] >= 80:
            print(f"\n{name} glares at you."); continue
        func_name = f"encounter_{name.lower()}"
        if func_name in globals():
            try:
                globals()[func_name](player)
            except Exception as e:
                slow_print(f"(Encounter with {name} skipped: {e})")
        else:
            print(f"\n[{name} is around.]")
        pause()

def encounter_tina(player):
    tina_arc_event(player)

def encounter_gabe(player):
    print(); print(residents["Gabe"]["desc"])
    slow_print("Gabe is on his porch, beer in hand.")
    print("1 = Nod and pass")
    print("2 = 'You okay, man?'")
    print("3 = 'You got a light?'")
    print("4 = 'I heard about the mill.'")
    c = safe_input("> ").strip()
    if c == "1":
        slow_print("Gabe looks through you.")
    elif c == "2":
        slow_print("'Never been okay. But thanks for asking.'")
        slow_print("He offers you a beer. 'It's warm. Don't care.'")
        print("1 = Take the beer  2 = Decline")
        n = safe_input("> ").strip()
        if n == "1":
            consume_alcohol(player, 2)
            slow_print("You drink. It's warm. He nods.")
            player.soul += 2
        else:
            slow_print("He shrugs and drinks alone.")
        player.reputation += 5
    elif c == "3":
        slow_print("He pulls out a lighter. Flicks it. 'Keep it.'")
        player.inventory.append("Lighter")
        player.soul += 2
        change_rep("Gabe", 10)
    else:
        slow_print("'Mill? I got laid off six months ago.'")
        slow_print("'Now I just drink and wait. There's nothing else here for guys like me.'")
        slow_print("'You got a job yet?'")
        print("1 = 'Working.'")
        print("2 = 'Looking.'")
        print("3 = 'None of your business.'")
        n = safe_input("> ").strip()
        if n == "1":
            slow_print("'Good for you. Better than most.'")
            change_rep("Gabe", 5)
        elif n == "2":
            slow_print("'There's a timber crew hiring up the mountain. Drug test though.'")
            player.soul += 3
        else:
            slow_print("He nods. 'Fair enough.'")
        player.soul -= 2

def encounter_frank(player):
    print(); print(residents["Frank"]["desc"])
    slow_print("Frank: 'You the new guy?'")
    print("1 = Keep walking  2 = 'Yeah. Staying out of trouble.'  3 = 'Heard you did time.'")
    c = safe_input("> ").strip()
    if c == "1": slow_print("He snorts.")
    elif c == "2": slow_print("Frank laughs. 'Trouble finds you around here. You'll see.'")
    else:
        slow_print("Frank's face goes stone.")
        change_rep("Frank", -20); change_anger("Frank", 30)

def encounter_lisa(player):
    """Lisa: flirty, opportunistic, an info broker who'll lift something
       unattended - but not a screamer, not a brawler."""
    print(); print(residents["Lisa"]["desc"])

    if player.lisa_had_sex:
        slow_print("Lisa: 'Hey baby. I got a bag. Wanna smoke and fuck?'")
        print("1 = 'Yeah.'")
        print("2 = 'Not today.'")
        print("3 = 'You owe me.'")
        c = safe_input("> ").strip()
        if c == "1":
            slow_print("You go inside. The door closes. Hours later, she's snoring.")
            drug_use(player, "weed")
            player.soul += 2
            player.energy -= 20
            player.sti_risk = True
        elif c == "2":
            slow_print("She shrugs. 'Suit yourself. I'll find someone else.'")
            change_rep("Lisa", -2)
        else:
            slow_print("'I don't owe you shit,' she says, more tired than angry, and wanders off.")
            change_anger("Lisa", 6)

    elif player.lisa_helped_steal:
        slow_print("Lisa: 'Hey, partner. Got another job if you're interested.'")
        print("1 = 'What kind of job?'")
        print("2 = 'No, I'm done with that.'")
        print("3 = 'Depends on the pay.'")
        c = safe_input("> ").strip()
        if c == "1":
            slow_print("'Gladys. Her medicine cabinet. She's got Percocet. We can flip it.'")
            print("1 = 'I'm in.'")
            print("2 = 'No, too risky.'")
            n = safe_input("> ").strip()
            if n == "1":
                lisa_steal_job(player)
            else:
                slow_print("'Your loss. I got a buyer lined up.'")
        elif c == "2":
            slow_print("'Straight and narrow? Boring. But okay.'")
        else:
            slow_print("'Hundred each. Maybe two hundred if we get the good stuff.'")
            print("1 = 'I'm in.'")
            print("2 = 'No.'")
            n = safe_input("> ").strip()
            if n == "1":
                lisa_steal_job(player)
            else:
                slow_print("'Whatever. I'll find someone else.'")

    elif player.lisa_stiffed_me and player.let_lisa_in:
        slow_print("Lisa: 'I need to use your bathroom. Got cash this time.'")
        slow_print("She holds out a crumpled twenty. 'Up front. Don't want no trouble.'")
        print("1 = Take the $20 and let her in")
        print("2 = 'Not enough. $40.'")
        print("3 = 'Forget it.'")
        c = safe_input("> ").strip()
        if c == "1":
            player.money += 20
            player.let_lisa_in = True
            player.lisa_let_in_before = True
            change_rep("Lisa", 5)
            slow_print("She goes in. Comes out. 'Thanks. We're square now.'")
        elif c == "2":
            slow_print("'Forty? Steep, but fine.'")
            print("1 = '$40 or nothing.'")
            print("2 = 'Forget it then.'")
            n = safe_input("> ").strip()
            if n == "1" and player.money >= 40:
                player.money -= 40
                player.let_lisa_in = True
                player.lisa_let_in_before = True
                change_anger("Lisa", 12)
                slow_print("She hands you forty dollars. 'There. Now we're square.'")
            else:
                slow_print("'Whatever. I'll find somewhere else.' She walks off, more annoyed than furious.")
                change_anger("Lisa", 15)
        else:
            slow_print("'Fine. I'll use the bush.'")
            change_anger("Lisa", 10)

    elif player.lisa_let_in_before:
        slow_print("Lisa: 'I left my pack of cigarettes in your place. Can I grab it?'")
        print("1 = 'Sure.'")
        print("2 = 'You don't smoke.' (call her bluff)")
        print("3 = 'Five bucks to look.'")
        c = safe_input("> ").strip()
        if c == "1":
            player.let_lisa_in = True
            slow_print("She comes out with a cigarette. 'Found it. Thanks, baby.'")
        elif c == "2":
            slow_print("She laughs, caught. 'Fine, you got me. Worth a shot.' No real anger in it.")
            change_anger("Lisa", 8)
        else:
            slow_print("'Five bucks? For a smoke?' She grins. 'You're an ass. Fine.'")
            print("1 = '$5 or nothing.'")
            print("2 = 'Fine, free. Just go.'")
            n = safe_input("> ").strip()
            if n == "1":
                slow_print("She pays. 'Happy?'")
                player.money += 5
                player.let_lisa_in = True
                player.lisa_let_in_before = True
                change_rep("Lisa", -3)
            else:
                player.let_lisa_in = True
                player.lisa_let_in_before = True
                change_rep("Lisa", 3)

    else:
        slow_print("Lisa: 'I forgot my purse. Can I use your bathroom?'")
        print("1 = Yes (free)")
        print("2 = 'What's in it for me?'")
        print("3 = No")
        c = safe_input("> ").strip()
        if c == "1":
            slow_print("You let her in.")
            player.let_lisa_in = True
            player.lisa_let_in_before = True
            change_rep("Lisa", 15)
        elif c == "2":
            slow_print("Lisa narrows her eyes, more amused than annoyed. 'You want something? Fine.'")
            print("1 = 'Information. Who has stuff worth knowing about?'")
            print("2 = '$20.' (she stiffs you)")
            print("3 = 'How about some company?' (with edge)")
            n = safe_input("> ").strip()
            if n == "1":
                lisa_give_intel(player)
            elif n == "2":
                slow_print("'Twenty? I got five. Take it or leave it.'")
                print("1 = Take the $5 (she stiffs you $15)")
                print("2 = 'Make it $10.'")
                print("3 = 'Forget it.'")
                n3 = safe_input("> ").strip()
                if n3 == "1":
                    slow_print("She hands you a five. 'We're square.'")
                    player.money += 5
                    player.let_lisa_in = True
                    player.lisa_let_in_before = True
                    player.lisa_debt += 15
                    player.lisa_stiffed_me = True
                elif n3 == "2":
                    slow_print("'Ten? Fine. Here.'")
                    player.money += 10
                    player.let_lisa_in = True
                    player.lisa_let_in_before = True
                    player.lisa_debt += 10
                    player.lisa_stiffed_me = True
                else:
                    slow_print("'Suit yourself.'")
                    change_anger("Lisa", 8)
            else:
                slow_print("Lisa's smile spreads. Slow, a little wicked, but playful more than predatory.")
                slow_print("'Company? Honey, I'm not the one who needs it. But sure.'")
                print("1 = 'Get inside before someone sees.'")
                print("2 = 'I changed my mind.'")
                print("3 = Pull away, keep it light")
                n2 = safe_input("> ").strip()
                if n2 == "1":
                    player.let_lisa_in = True
                    player.lisa_let_in_before = True
                    player.lisa_had_sex = True
                    change_rep("Lisa", 10)
                    player.criminal_influence += 5
                    slow_print("She goes in. You follow. The door closes.")
                elif n2 == "3":
                    slow_print("You step back, easy about it. She shrugs, not offended. 'Your loss.'")
                    change_anger("Lisa", 5)
                else:
                    slow_print("She shrugs. 'Whatever. Bathroom's that way or not.'")
                    player.let_lisa_in = True
                    player.lisa_let_in_before = True
        else:
            slow_print("Lisa shrugs. 'Fine. I'll find a bush.'")
            change_anger("Lisa", 8)

def lisa_give_intel(player):
    """Lisa naming names now opens an actual conversation about what to
       do with that information, instead of funneling straight into a
       heist. The player can sit on the intel, decline, or pursue it."""
    player.lisa_gave_intel = True
    slow_print("Lisa leans in. 'Frank's unit. Phyllis's. Gladys's. They've all got something worth taking.'")
    slow_print("'I'm not saying do anything with that. Just... good to know things.'")
    print("1 = 'Why are you telling me this?'")
    print("2 = 'What would you do with it?'")
    print("3 = 'I don't want to know this.'")
    print("4 = 'You know a buyer for any of it?'")
    choice = safe_input("> ").strip()
    if choice == "1":
        slow_print("'Because knowing things is currency. I collect it. Now you owe me a little.'")
        player.let_lisa_in = True
        player.lisa_let_in_before = True
        change_rep("Lisa", 6)
    elif choice == "2":
        slow_print("'Phyllis, probably. She won't even remember someone was in there. But that's me. Not you.'")
        slow_print("'You want in on something, say so. I don't push.'")
        print("1 = 'I might. Tell me more.'")
        print("2 = 'Not my thing.'")
        n = safe_input("> ").strip()
        if n == "1":
            print("1 = 'What kind of job?'")
            print("2 = 'Forget it.'")
            n2 = safe_input("> ").strip()
            if n2 == "1":
                lisa_steal_job(player)
            else:
                slow_print("'Fair enough. Offer stands.'")
        else:
            slow_print("'Didn't figure you would. No judgment.'")
            player.reputation += 3
    elif choice == "3":
        slow_print("'Okay. Forget I said it.' She actually seems to mean it - no push, no guilt trip.")
        player.reputation += 2
    else:
        slow_print("'I know a guy in St. Helens. Doesn't ask questions. But that's for later, if you want in.'")
        player.let_lisa_in = True
        player.lisa_let_in_before = True
        player.reputation += 4
        player.criminal_influence += 3

def lisa_steal_job(player):
    slow_print("\n*** LISA'S JOB ***")
    slow_print("Lisa: 'Phyllis's unit. She leaves her door unlocked when she's confused.'")
    slow_print("'Her medicine cabinet. Percocet, oxy, the good stuff.'")
    slow_print("'I go in. You keep watch. Five minutes. We split the cash.'")
    print("1 = 'I'm in.'")
    print("2 = 'No, too risky.'")
    c = safe_input("> ").strip()
    if c != "1":
        slow_print("'Your loss.'")
        return

    risk = 30 - player.criminal_influence
    roll = random.randint(1, 100)
    slow_print("\nYou keep watch. Lisa goes in.")
    slow_print("Your heart pounds. Footsteps in the hall. A door slams somewhere.")
    slow_print("Two minutes. Three. Four.")

    if roll > risk:
        slow_print("Lisa comes out. Grinning. 'Got it.'")
        slow_print("You walk away together. At the end of the block, she opens the bag.")
        slow_print("'Pills. Mostly Percocet. Good haul.'")
        slow_print("'I got a buyer. Hundred each.'")
        player.money += 100
        player.criminal_influence += 15
        player.soul -= 15
        player.lisa_helped_steal = True
        change_rep("Lisa", 20)
        slow_print("(You're now Lisa's partner in crime. More jobs will come.)")
    else:
        if random.random() < 0.5:
            slow_print("A cop car rounds the corner. Slow. Looking.")
            slow_print("You freeze. Lisa freezes.")
            slow_print("The cop drives past. Slowly. Too slowly.")
            slow_print("You both bolt. Lisa loses the bag. You get away.")
            player.criminal_influence += 5
            player.soul -= 10
            player.vitality = max(0, player.vitality - 10)
        else:
            slow_print("Phyllis comes out. Sees Lisa at her door.")
            slow_print("'LISA! What are you doing?'")
            slow_print("Lisa runs. You run. Phyllis screams.")
            slow_print("Management is called. Cops come.")
            player.reputation -= 20
            player.legitimacy -= 15
            player.criminal_influence += 10
            player.soul -= 20
            document_event(player, 20, "Suspected in Phyllis's burglary")
            change_anger("Phyllis", 80)

def encounter_phyllis(player):
    print(); print(residents["Phyllis"]["desc"])
    slow_print("Phyllis: 'That dog will kill any dog.'")
    print("1 = 'I'll keep my cats away.'  2 = 'What happened to your family?'  3 = Nod")
    c = safe_input("> ").strip()
    if c == "1": change_rep("Phyllis", 5)
    elif c == "2":
        slow_print("'I don't remember.'")
        player.soul += 3

def encounter_bill(player):
    print(); print(residents["Bill"]["desc"])
    slow_print("Bill: 'Don't park in spot 12.'")
    print("1 = 'Why not?'  2 = 'Noted.'  3 = Nod")
    c = safe_input("> ").strip()
    if c == "1":
        slow_print("'That's where Gladys parks her walker.'")
        player.reputation += 3

def encounter_gladys(player):
    print(); print(residents["Gladys"]["desc"])
    slow_print("The smell. Her door ajar.")
    print("1 = Walk past  2 = Knock  3 = Report")
    c = safe_input("> ").strip()
    if c == "2": player.soul += 5
    elif c == "3":
        player.soul += 3
        document_event(player, 5, "Reported Gladys's conditions")

def encounter_rebecca(player):
    print(); print(residents["Rebecca"]["desc"])
    slow_print("Rebecca sips from a giant travel mug.")
    print("1 = 'What's in the mug?' (small talk)")
    print("2 = 'You know everything. What do you know about Tina?' (buy info)")
    print("3 = 'How long have you lived here?' (rapport)")
    print("4 = Nod and walk")
    c = safe_input("> ").strip()
    if c == "1":
        slow_print("'Coffee. Strong coffee.' You both know.")
        change_rep("Rebecca", 5)
    elif c == "2":
        slow_print("'Tina? Five bucks. Twenty if you want the real story.'")
        print("1 = Pay $5 (surface gossip)")
        print("2 = Pay $20 (deep info)")
        print("3 = 'Forget it.'")
        n = safe_input("> ").strip()
        if n == "1" and player.money >= 5:
            player.money -= 5
            slow_print("'Tina's been running for Tom for years. She hates him but can't quit.'")
            change_rep("Rebecca", 5)
        elif n == "2" and player.money >= 20:
            player.money -= 20
            slow_print("'Tina was a junkie in Portland. She lost custody. She blames the system.'")
            slow_print("'She's got a soft spot for animals. If you ever need a favor, ask about the cats.'")
            slow_print("'And she moves fast once she wants something - she won't wait around for you to catch on.'")
            slow_print("'In her day, she was a real looker. Now she's old and bold about it. Dangerous combination.'")
            player.soul += 5
            change_rep("Rebecca", 15)
        else:
            slow_print("Rebecca shrugs. 'Your loss.'")
    elif c == "3":
        slow_print("'Twelve years. It was always bad.'")
        player.reputation += 3
    else:
        slow_print("She watches you walk by.")

# =============================================================
# TOM - SMOOTH TRUST-BASED ESCALATION
# =============================================================

def encounter_tom(player):
    print(); print(residents["Tom"]["desc"])
    slow_print("Tom's under the hood of a Bonneville. He looks up.")

    if player.tom_relationship == 0:
        slow_print("'Hey. You the new guy?'")
        print("1 = 'Yeah. Just moved in.'")
        print("2 = 'Who wants to know?'")
        print("3 = Nod and keep walking")
        c = safe_input("> ").strip()
        if c == "1":
            slow_print("Tom wipes his hands. 'I'm Tom. Run a little side business.'")
            slow_print("'Everybody needs to make ends meet, right?'")
            slow_print("'You know how to check oil?'")
            print("1 = 'A little.'")
            print("2 = 'No.'")
            print("3 = 'Why?'")
            n = safe_input("> ").strip()
            if n == "1":
                slow_print("'Good. Manual labor types are rare around here.'")
                slow_print("He leans against the car. Studies you.")
                slow_print("'You ever need work, I got work. Nothing heavy. Not yet, anyway.'")
                print("1 = 'What kind of deliveries?'")
                print("2 = 'I'm not looking for trouble.'")
                print("3 = 'How much?'")
                print("4 = 'I'll think about it.'")
                k = safe_input("> ").strip()
                if k == "1":
                    slow_print("'Packages. That's all you need to know for now.'")
                    slow_print("'You don't open them. You don't ask. You drop them, you get paid.'")
                    print("1 = 'Maybe. What's the pay?'")
                    print("2 = 'Sounds like a setup. I'm out.'")
                    print("3 = 'You sure you're not running a sting?'")
                    k2 = safe_input("> ").strip()
                    if k2 == "1":
                        slow_print("'Fifty a drop. Sometimes a hundred. Depends on the run.'")
                        slow_print("'Trust builds slow with me. But it builds. Come back tomorrow - small favor, see how it goes.'")
                        player.tom_relationship = 1
                        player.tom_trust += 15
                        change_rep("Tom", 15)
                    elif k2 == "2":
                        slow_print("'Last guy who said that moved to Portland. Fast.'")
                        change_rep("Tom", -5)
                    else:
                        slow_print("'You a cop?' He studies you. 'Better not be.'")
                        change_rep("Tom", -3)
                elif k == "2":
                    slow_print("'Trouble finds people whether they look for it or not. Fair enough.'")
                    change_rep("Tom", 3)
                elif k == "3":
                    slow_print("'Depends. Twenty for a small drop. Two hundred for a long run, once you've earned it.'")
                    print("1 = 'I'll think about it.'")
                    print("2 = 'I'm in.'")
                    print("3 = 'Too good to be true. What's the catch?'")
                    k3 = safe_input("> ").strip()
                    if k3 == "1":
                        slow_print("'Take your time. Come back when you're ready - I'll have something small.'")
                        player.tom_relationship = 1
                        player.tom_trust += 8
                        change_rep("Tom", 8)
                    elif k3 == "2":
                        slow_print("Tom nods. 'Smart. You'll do fine. Still gotta start you small, though.'")
                        player.tom_relationship = 1
                        player.tom_trust += 20
                        change_rep("Tom", 20)
                    else:
                        slow_print("'The catch is: you don't talk. Ever. Come back tomorrow, we'll start easy.'")
                        player.tom_relationship = 1
                        player.tom_trust += 10
                        change_rep("Tom", 5)
                else:
                    slow_print("'That's fine. Most people do. Come back when you've thought it over.'")
                    player.tom_relationship = 1
                    player.tom_trust += 5
                    change_rep("Tom", 5)
            elif n == "2":
                slow_print("'Honest. I like that. You ever want to learn, I'm out here most days.'")
                player.tom_relationship = 1
                player.tom_trust += 8
                change_rep("Tom", 8)
            else:
                slow_print("Tom pauses. 'Because I need to know what kinda guy moved in next door.'")
                slow_print("'Narc. Client. Rival. Or someone who could work.'")
                slow_print("'Which are you?'")
                print("1 = 'None of the above.'")
                print("2 = 'Just a guy trying to sleep.'")
                print("3 = 'I could work.'")
                k4 = safe_input("> ").strip()
                if k4 == "1":
                    slow_print("'Sure. Everybody's nobody. Until they're somebody.'")
                    change_rep("Tom", 2)
                elif k4 == "2":
                    slow_print("'Sleep's expensive around here. Trust me.'")
                    change_rep("Tom", 4)
                else:
                    slow_print("Tom's eyes narrow. 'You serious? What's your skill?'")
                    print("1 = 'I can drive.'")
                    print("2 = 'I can count.'")
                    print("3 = 'I can keep my mouth shut.'")
                    k5 = safe_input("> ").strip()
                    if k5 == "1":
                        slow_print("'Good. I need drivers. Come back tomorrow - small thing first.'")
                        player.tom_relationship = 1
                        player.tom_trust += 15
                        change_rep("Tom", 15)
                    elif k5 == "2":
                        slow_print("'Bookkeeping? I can use that. Come back tomorrow.'")
                        player.tom_relationship = 1
                        player.tom_trust += 12
                        change_rep("Tom", 12)
                    else:
                        slow_print("'That's the most important one.' He almost smiles. 'Tomorrow. Small thing first.'")
                        player.tom_relationship = 1
                        player.tom_trust += 20
                        change_rep("Tom", 20)
        elif c == "2":
            slow_print("'A careful one. I respect that.'")
        else:
            slow_print("Tom watches you walk. Files you away.")

    elif player.tom_relationship == 1:
        slow_print(f"'Hey. You're back.' (Trust building: {player.tom_trust}/40 toward your first real run.)")
        slow_print("'Simple stuff first. I need you to take this bag to the laundromat on Columbia Blvd.'")
        slow_print("'Drop it in the blue washer. Get out. Don't look inside.'")
        print("1 = 'Sure. How much?'")
        print("2 = 'What's in the bag?'")
        print("3 = 'No. I'm not ready.'")
        c = safe_input("> ").strip()
        if c == "1":
            slow_print("'Twenty bucks. Plus a good word. You pass, more work comes - and it builds from there.'")
            if safe_input("Take the job? (y/n): ").strip() == "y":
                tom_test_job(player)
        elif c == "2":
            slow_print("'I told you. You don't ask. You don't look. That's the test.'")
            print("1 = 'Okay. I'll do it.'")
            print("2 = 'No, I'm out.'")
            n = safe_input("> ").strip()
            if n == "1":
                tom_test_job(player)
        else:
            slow_print("'Smart. Don't rush into this. Come back when you're ready.'")

    elif player.tom_relationship == 2:
        slow_print(f"'Good to see you.' (Trust: {player.tom_trust}. You're past the test now - real runs.)")
        print("1 = 'What kind of job?'")
        print("2 = 'Not today.'")
        c = safe_input("> ").strip()
        if c == "1":
            tom_simple_run(player)

    elif player.tom_relationship == 3:
        slow_print(f"'You've done good by me.' (Trust: {player.tom_trust}. He's talking partnership now, not just runs.)")
        print("1 = 'I'm listening.'")
        print("2 = 'Not today.'")
        c = safe_input("> ").strip()
        if c == "1":
            tom_trusted_run(player)

    else:
        slow_print("'You're not just running for me anymore. You're part of this now.'")
        print("1 = 'I'm listening.'")
        print("2 = 'Not today.'")
        c = safe_input("> ").strip()
        if c == "1":
            tom_trusted_run(player)

def tom_test_job(player):
    slow_print("\nTom hands you a gym bag. It's not heavy.")
    slow_print("'Columbia Blvd Laundromat. Blue washer. Get out. Don't look.'")
    slow_print("'If anyone asks, you don't know me.'")
    if safe_input("Do the job? (y/n): ").strip() != "y":
        slow_print("'Maybe next time.'")
        return

    risk = 20 - player.criminal_influence
    roll = random.randint(1, 100)

    slow_print("You drive to Columbia Blvd. The laundromat is empty.")
    slow_print("You put the bag in the blue washer. You don't start it.")
    slow_print("You walk out. A guy in a truck nods at you.")
    slow_print("You drive back.")

    if roll > risk:
        slow_print("Tom's waiting. 'How'd it go?'")
        slow_print("'Clean. No problems.'")
        slow_print("'Good. Here's your twenty. You passed. I'm starting to trust you.'")
        slow_print("'Come back tomorrow. Real work this time.'")
        player.money += 20
        player.criminal_influence += 5
        player.tom_relationship = 2
        player.tom_trust += 15
        player.tom_jobs_done += 1
        player.tom_paid += 20
    else:
        slow_print("Tom's face is stone. 'A cop car followed you.'")
        slow_print("'You led them here. That's bad.'")
        print("1 = 'I didn't see anyone.'")
        print("2 = 'I'm sorry. It won't happen again.'")
        c = safe_input("> ").strip()
        if c == "1":
            slow_print("'You didn't see them. That's the problem.'")
            slow_print("'Get out of here. And don't come back for a while.'")
            change_anger("Tom", 30)
            player.tom_relationship = 0
            player.tom_trust = max(0, player.tom_trust - 20)
            player.tom_jobs_failed += 1
        else:
            slow_print("'Words are cheap. Prove it. Come back next week.'")
            player.tom_relationship = 0
            player.tom_trust = max(0, player.tom_trust - 10)
            player.tom_jobs_failed += 1

def tom_simple_run(player):
    pay = random.randint(50, 100)
    locations = ["St. Helens", "Rainier", "Warren", "Deer Island"]
    location = random.choice(locations)
    slow_print(f"'Delivery to {location}. ${pay}. Don't open it. Don't ask.'")
    if safe_input("Take the job? (y/n): ").strip() != "y":
        slow_print("'Maybe next time.'")
        return

    risk = 25 - player.criminal_influence
    roll = random.randint(1, 100)

    slow_print(f"You drive to {location}. Find the house. Knock.")
    slow_print("A guy answers. You hand him the package. He hands you cash.")
    slow_print("You drive back.")

    if roll > risk:
        slow_print("Tom nods. 'Clean. Good work.'")
        player.money += pay
        player.criminal_influence += 10
        player.soul -= 5
        player.tom_jobs_done += 1
        player.tom_trust += 10
        player.tom_paid += pay
        if player.tom_jobs_done >= 3 and player.tom_trust >= 60:
            slow_print("'You've done three clean runs. That's not nothing around here.'")
            slow_print("'I got something bigger coming. You ready for that step?'")
            player.tom_relationship = 3
    else:
        if random.random() < 0.5:
            slow_print("Cops pull you over on the way back. 'License and registration.'")
            slow_print("They search the car. Find nothing. Let you go.")
            slow_print("Tom's pissed. 'You got stopped. That's heat.'")
            change_anger("Tom", 20)
            player.legitimacy -= 5
            player.tom_trust = max(0, player.tom_trust - 10)
            player.tom_jobs_failed += 1
        else:
            slow_print("The buyer shorted you. You come back with $30 less.")
            print("1 = Tell Tom the truth")
            print("2 = Pocket the difference")
            c = safe_input("> ").strip()
            if c == "1":
                slow_print("Tom: 'Honest. I like that. Here's the rest from my pocket.'")
                player.money += 30
                player.tom_paid += pay
                player.tom_trust += 8
                change_rep("Tom", 10)
            else:
                slow_print("Tom finds out anyway. 'You're done.'")
                change_anger("Tom", 40)
                player.tom_relationship = 0
                player.tom_trust = 0
                player.tom_jobs_failed += 1

def tom_trusted_run(player):
    pay = random.randint(150, 300)
    slow_print(f"'Big run. Portland. ${pay}. You drive, I navigate.'")
    if safe_input("Take it? (y/n): ").strip() != "y":
        slow_print("'Maybe next time.'")
        return

    risk = 30 - player.criminal_influence
    roll = random.randint(1, 100)

    slow_print("You drive to Portland. Tom rides shotgun. He doesn't talk much.")
    slow_print("You park. He goes inside. Comes back with a bag.")
    slow_print("You drive back.")

    if roll > risk:
        slow_print("Tom: 'Smooth. You're a natural.'")
        slow_print("'I'm thinking about making you a real partner. Not yet. But soon - you're most of the way there.'")
        player.money += pay
        player.criminal_influence += 20
        player.soul -= 10
        player.tom_jobs_done += 1
        player.tom_trust += 15
        player.tom_paid += pay
        if player.tom_jobs_done >= 6 and player.tom_trust >= 100:
            player.tom_relationship = 4
            slow_print("'You're not just a runner anymore. You're in this with me now.'")
    else:
        slow_print("Cops swarm the parking lot. 'FREEZE!'")
        slow_print("Tom's out of the car. Running. You freeze.")
        print("1 = Run")
        print("2 = Stay and play dumb")
        c = safe_input("> ").strip()
        if c == "1":
            if random.random() < 0.5:
                slow_print("You run. You get away. Tom doesn't.")
                slow_print("You're on your own now. The network's burned.")
                player.criminal_influence += 30
                player.soul -= 20
                player.legitimacy -= 20
                player.tom_relationship = 0
                player.tom_trust = 0
                player.tom_jobs_failed += 1
                document_event(player, 20, "Drug investigation - fled scene")
            else:
                slow_print("They catch you. Handcuffs. The whole thing.")
                player.soul -= 30
                player.legitimacy -= 40
                player.criminal_influence += 40
                document_event(player, 30, "Arrested - drug trafficking")
        else:
            slow_print("'I don't know him! I was just giving him a ride!'")
            slow_print("They find the bag in the trunk. You're going downtown.")
            player.soul -= 25
            player.legitimacy -= 30
            player.criminal_influence += 30
            player.tom_relationship = 0
            player.tom_trust = 0
            player.tom_jobs_failed += 1
            document_event(player, 25, "Arrested - drug possession with intent")

# =============================================================
# EVENING
# =============================================================

def evening_event(player):
    print(); slow_print("- Night -")
    events = [party_disruption, sick_cat, quiet_night]
    if player.let_lisa_in: events.append(lisa_betrayal)
    random.choice(events)(player)

def party_disruption(player):
    slow_print("A fight upstairs. Cops roll up.")
    print("1 = Stay inside  2 = Peek  3 = Go upstairs")
    c = safe_input("> ").strip()
    if c == "1": return
    elif c == "2":
        if player.bodycam_owned:
            document_event(player, 10, "Body cam: Tina's PD connection")
    else:
        player.soul -= 12
        document_event(player, 10, "Violence in unit above")

def sick_cat(player):
    slow_print("One of your cats is listless.")
    if player.money >= 35 and safe_input("Vet $35? (y/n): ").strip() == "y":
        player.money -= 35; player.soul += 10
    else:
        player.soul -= 6

def quiet_night(player):
    slow_print("Nothing happens. You sit with the cats.")
    player.soul += 4
    player.energy = min(100, player.energy + 15)

def lisa_betrayal(player):
    """Toned down: Lisa lifts things when unattended, but she isn't a
       screamer or a fighter."""
    slow_print("You come home. Door ajar.")
    loss = random.randint(20, 60)
    player.money = max(0, player.money - loss)
    slow_print(f"${loss:.2f} gone. Lisa's footprints in the dust.")
    print("1 = Confront Lisa right now")
    print("2 = File a report")
    print("3 = Let it go")
    print("4 = Take it back by force")
    c = safe_input("> ").strip()
    if c == "1":
        slow_print("You knock. Lisa opens the door a crack, sees your face, doesn't bother lying well.")
        slow_print("'Okay, yeah. I took some. You weren't around and I needed it.'")
        slow_print("She's not screaming, not scared either - just matter-of-fact about it, like this is normal.")
        print("1 = 'You owe me.'")
        print("2 = 'That's messed up, Lisa.'")
        print("3 = Push past her and look for it yourself")
        print("4 = Leave")
        n = safe_input("> ").strip()
        if n == "1":
            slow_print("'Yeah, probably. I'm good for it eventually.' She shrugs, unbothered but not defiant.")
            player.lisa_debt += loss
            player.soul -= 3
            change_rep("Lisa", -10)
        elif n == "2":
            slow_print("'I know. I'm not gonna pretend it's not.' She actually looks a little ashamed.")
            slow_print("'I'll pay it back when I can.'")
            player.lisa_debt += loss
            change_rep("Lisa", -15)
        elif n == "3":
            slow_print("You step past her. She doesn't fight you on it - just watches, arms crossed.")
            slow_print("You find about half of it, stuffed under a couch cushion.")
            player.money += loss // 2
            player.soul -= 5
            change_rep("Lisa", -20)
            change_anger("Lisa", 20)
        else:
            slow_print("You leave. The money's gone. So is some of your patience.")
            player.soul -= 3
    elif c == "2":
        slow_print("You call the non-emergency line.")
        slow_print("'We'll send someone by.' They never do.")
        player.soul += 2
        document_event(player, 10, "Police welfare check requested")
    elif c == "3":
        slow_print("You sit on the floor. The cats come to you.")
        slow_print("Money comes and goes. You stay.")
        player.soul += 5
        player.legitimacy += 2
    elif c == "4" and player.criminal_influence >= 20:
        slow_print("You go back to Lisa's. She opens the door, already resigned to it.")
        slow_print("'Fine, take it back, Jesus.' She hands over what's left rather than make a scene.")
        player.money += loss // 2
        player.soul -= 8
        change_anger("Lisa", 25)
    else:
        slow_print("You do nothing. The money's gone.")

# =============================================================
# MANAGEMENT / WATER / GARBAGE
# =============================================================

def water_shutoff_event(player):
    slow_print("\n*** WATER SHUTOFF NOTICE ***")
    if player.water_fine_paid:
        slow_print("The owner paid the fine. Water's back on.")
        player.has_clean_water = True
        player.water_days_without = 0
        return
    print("1 = Fill buckets  2 = Wait it out  3 = Organize  4 = Pay the bill ($500)")
    c = safe_input("> ").strip()
    if c == "1":
        if player.has_tool_kit:
            slow_print("You get the buckets. Fill them in the bathtub before the shutoff.")
            player.energy -= 30; player.soul += 5
            player.inventory.append("5-Gallon Buckets (3)")
            player.has_clean_water = True
            player.water_days_without = 0
        else:
            slow_print("You try, but you don't have buckets. You lose water.")
            player.has_clean_water = False
            player.water_days_without = 1
    elif c == "2":
        slow_print("You wait. The Section 8 housing authority will pay the bill and fine the owner.")
        slow_print("After 3 days, water is restored. The owner gets fined.")
        player.has_clean_water = False
        player.water_days_without = 1
    elif c == "3":
        slow_print("You organize. Other tenants join. Management is forced to act.")
        player.reputation -= 10; player.soul += 2
    elif c == "4" and player.money >= 500:
        slow_print("You pay the bill. Water's back on. The owner is grateful.")
        player.money -= 500; player.soul += 15; player.reputation += 20
        player.has_clean_water = True
        player.water_fine_paid = True
        player.water_days_without = 0

def garbage_event(player):
    if player.garbage_days_without > 0 and not player.garbage_fine_paid:
        if player.garbage_days_without >= 60:
            slow_print("\n*** GARBAGE NOTICE ***")
            slow_print("The dumpster hasn't been emptied in 2 months.")
            slow_print("The Section 8 housing authority is fining the owner.")
            slow_print("Service will be restored today.")
            player.garbage_fine_paid = True
            player.garbage_days_without = 0
            return
        player.garbage_days_without += 1
        if random.random() < 0.1:
            slow_print("\nThe dumpster is overflowing. Flies everywhere. It smells.")
            print("1 = Deal with it  2 = Ignore")
            c = safe_input("> ").strip()
            if c == "1":
                player.energy -= 15
                player.soul += 3
            else:
                player.soul -= 2

def management_event(player):
    event_type = random.choice(["squatter_accusation", "locked_office", "dismissive_agent", "selective_enforcement"])
    if event_type == "squatter_accusation":
        slow_print("\nA squatter in 52776 accuses you of being a pedophile.")
        print("1 = Ignore  2 = File report  3 = Confront")
        c = safe_input("> ").strip()
        if c == "1":
            player.soul -= 10; player.reputation -= 5
        elif c == "2":
            player.soul += 5; player.reputation += 5
            document_event(player, 20, "Defamation per se by squatter")
        else:
            player.soul += 2
            change_anger("Tina", 10)
    elif event_type == "locked_office":
        slow_print("\nManagement office locked during business hours.")
        print("1 = Call  2 = Leave note  3 = Document")
        c = safe_input("> ").strip()
        if c == "1": player.soul -= 3
        elif c == "2": player.soul += 1
        else:
            document_event(player, 10, "Office locked during hours")
            player.soul += 3
    elif event_type == "dismissive_agent":
        slow_print("\nManager Sherry is contemptuous.")
        print("1 = Stay calm  2 = Call her out  3 = Walk away")
        c = safe_input("> ").strip()
        if c == "1": player.soul += 3
        elif c == "2":
            player.reputation -= 5
            change_anger("Tina", 15)
        else: player.soul += 1
    elif event_type == "selective_enforcement":
        slow_print("\n'Unauthorized pets' notice - only to you.")
        print("1 = Comply  2 = Document  3 = Ignore")
        c = safe_input("> ").strip()
        if c == "1": player.soul -= 5
        elif c == "2":
            document_event(player, 12, "Selective enforcement")
            player.soul += 5
        else: player.reputation -= 2

def shuttle_neighbor(player):
    if "Old POV" not in player.inventory: return
    if random.random() > 0.2: return
    slow_print("\nA neighbor needs a ride. '$15.'")
    print("1 = Take  2 = Decline")
    if safe_input("> ").strip() == "1" and player.energy >= 20:
        player.energy -= 20
        player.money += 15
        slow_print("You drive. They tip $2.")

# =============================================================
# INTEGRATION
# =============================================================

def integrate_systems(player):
    init_paper_trail(player)
    init_assistance(player)
    process_ebt(player)
    if player.day == 3 and not player.assistance.ebt_applied:
        ebt_application(player)
    if player.assistance.ebt_applied and not player.assistance.ebt_approved:
        ebt_application(player)
    if player.day == 18 and not player.assistance.energy_approved:
        energy_assistance_application(player)
    elif player.assistance.energy_applied and not player.assistance.energy_approved:
        energy_assistance_application(player)
    player.planter_watered_today = False
    player.diner_meal_today = False
    garbage_event(player)
    if player.food_supply_days > 0 and player.has_camp_stove and player.has_clean_water and random.random() < 0.3 and player.cooked_meals_available < 3:
        player.cooked_meals_available += 1
        player.food_supply_days = max(0, player.food_supply_days - 1)

# =============================================================
# DAY LOOP
# =============================================================

def advance_day(player):
    player.day += 1
    player.energy = 100
    player.day_actions_used = 0
    player.hunger = max(0, player.hunger - 20)
    sober_up(player)
    if not player.has_clean_water:
        player.water_days_without += 1
        if player.water_days_without >= 3 and not player.water_fine_paid:
            slow_print("\n*** Section 8 has paid the water bill. Owner has been fined. ***")
            player.has_clean_water = True
            player.water_fine_paid = True
            player.water_days_without = 0
    check_phase(player)
    print()
    slow_print(f"=========== Day {player.day} (Week {player.week_number}) ===========")
    cat_morning(player)
    integrate_systems(player)
    handle_workday(player)
    morning_actions(player)
    farmer_market(player)
    daily_encounters(player)
    roll = random.random()
    if roll < 0.10 and player.day > 10: management_event(player)
    elif roll < 0.20: parole_threat(player)
    elif roll < 0.30 and player.let_lisa_in: lisa_betrayal(player)
    else: evening_event(player)
    if player.day == 15: water_shutoff_event(player)
    shuttle_neighbor(player)
    check_week_reset(player)
    player.show_status()
    if player.money >= 5000 and player.legitimacy >= 60:
        slow_print("\nYou've saved enough. The land is within reach.")
        return "escape"
    if player.soul <= 0:
        slow_print("\nYou don't recognize yourself anymore.")
        return "broken"
    if player.hunger <= 0:
        slow_print("\nYour body is shutting down.")
        if player.has_job and not player.diner_meal_today and player.employer and JOBS.get(player.employer, {}).get("meal_perk"):
            slow_print("You drag yourself to work. Marlene takes one look at you.")
            slow_print("'Sit. Eat.' She slides you a plate.")
            player.hunger = min(100, player.hunger + 50)
            player.diner_meal_today = True
        elif player.has_camp_stove and player.food_supply_days > 0 and player.has_clean_water:
            slow_print("You force yourself to cook something. Your hands shake.")
            cook_meal(player)
            if player.hunger <= 0:
                slow_print("It wasn't enough. You needed more.")
                return "broken"
        else:
            return "broken"
    pause()
    return "continue"

# =============================================================
# DAY ZERO
# =============================================================

def day_zero(player):
    print()
    slow_print("=" * 50)
    slow_print("   ARRIVAL - DAY ZERO")
    slow_print("=" * 50)
    print()
    slow_print("You pull into Section 8 Pines. The engine cuts. The silence is heavy.")
    slow_print("Cinderblock walls. Laundry lines. A dog barks somewhere distant.")
    slow_print("Two cats in the back seat, watching you with patient eyes.")
    print()
    print("1 = 'At least it's a roof and a door which locks.'")
    print("2 = Drive in cheerfully. Unload everything. Make it home.")
    print("3 = Cautiously inspect the unit first.")
    choice = safe_input("> ").strip()
    print()
    if choice == "1":
        slow_print("You sit in the POV for ten minutes before you move.")
        slow_print("'A roof and a door,' you whisper. 'That's something.'")
        slow_print("The cats meow. You carry them in.")
        slow_print("The unit smells like bleach and someone else's cigarette smoke.")
        slow_print("You set down the blankets. Lay down. Don't eat. Don't unpack.")
        slow_print("You stare at the ceiling. The ceiling stares back.")
        slow_print("\nEnd of Day Zero. Tomorrow, the grind begins.")
        player.soul -= 5
    elif choice == "2":
        slow_print("You park in front of your unit. Smile at the absurdity of it.")
        slow_print("Unlock the door. Usher the cats inside. Begin hauling boxes.")
        slow_print("This is it. This is home. You make it home through sheer will.")
        slow_print("By evening, the blankets are laid out. The cats are fed. You collapse.")
        slow_print("You're smiling. Tomorrow will be hard, but tonight, you made it.")
        player.soul += 5
        player.reputation += 3
    else:
        slow_print("You leave the cats in the POV. Walk to the unit. Unlock it slowly.")
        slow_print("Door open. Listen. The pipes tick. Something drips.")
        slow_print("You step inside. Empty. Four walls. A window. A lock that works.")
        slow_print("You circle the rooms. Check the closets. Check under the sink.")
        slow_print("Clear. You return for the cats. Carry them in. Give them food.")
        slow_print("You unload the POV. Lock the door. Unfurl the blanket.")
        slow_print("You lay down. The cats curl at your feet. The door is locked.")
        slow_print("Tomorrow, the world.")
        player.soul += 3
        player.legitimacy += 2
    print()
    slow_print("You sleep on the floor. Your back hurts. The cats are restless.")
    slow_print("This is your new reality.")
    pause()

# =============================================================
# MAIN
# =============================================================

def main():
    print("=" * 50)
    print("   SECTION 8 PINES - A Survival Simulation")
    print("=" * 50)
    print()
    try:
        player = Player()
        day_zero(player)
        result = "continue"
        while result == "continue":
            result = advance_day(player)
        print()
        print("=" * 50)
        if result == "escape":
            slow_print("YOU ESCAPED. The land is yours. You won.")
        else:
            slow_print("THE GRIND WON. But you lasted longer than most.")
        print("=" * 50)
        print(f"Final Day: {player.day}")
        print(f"Final Money: ${player.money:.2f}")
        print(f"Final Soul: {player.soul}/100")
        print(f"Final Legitimacy: {player.legitimacy}/100")
        print(f"Final Criminal Influence: {player.criminal_influence}/100")
        print(f"Final Paper Trail: {player.paper_trail}/100")
    except Exception as e:
        print()
        print("=" * 50)
        print("AN ERROR OCCURRED:")
        print(str(e))
        print()
        traceback.print_exc()
        print("=" * 50)
    pause("\n[Press enter to exit]")

if __name__ == "__main__":
    main()

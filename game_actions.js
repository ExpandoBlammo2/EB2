// =============================================================
// ESCAPE FROM SECTION 8 - PLAYER ACTIONS
// =============================================================

// =============================================================
// SHOPPING SYSTEM
// =============================================================

function daily_shopping(player) {
    slow_print("\nYou head to the store / thrift shop. (Cash only here - EBT groceries are a separate trip.)");
    print(`\nYou have $${player.money.toFixed(2)} cash.`);
    print("\nHow to shop: type an item code, then a quantity.");
    print("Type 'cart' to see your cart. 'checkout' to pay. 'leave' to exit.\n");
    
    function show_cart() {
        print("\nAvailable items:");
        for (const [code, item] of Object.entries(SHOPPING_CATALOG)) {
            print(`  ${code} = ${item.name} ($${item.price} each)`);
        }
        print();
        
        if (gameState.cart.length > 0) {
            const total = gameState.cart.reduce((sum, [c, q]) => sum + (SHOPPING_CATALOG[c].price * q), 0);
            print(`CART: [${gameState.cart.map(([c, q]) => `${c}x${q}`).join(', ')}]  TOTAL: $${total.toFixed(2)}  CASH: $${player.money.toFixed(2)}`);
        } else {
            print(`CART: empty  CASH: $${player.money.toFixed(2)}`);
        }
        print();
        
        safe_input("> ").then(cmd => {
            cmd = cmd.toUpperCase();
            
            if (cmd === "LEAVE") {
                gameState.cart = [];
                return;
            }
            
            if (cmd === "CART") {
                if (gameState.cart.length === 0) {
                    print("Cart is empty.");
                } else {
                    for (const [c, q] of gameState.cart) {
                        const item = SHOPPING_CATALOG[c];
                        print(`  ${item.name} x${q} = $${(item.price * q).toFixed(2)}`);
                    }
                    const total = gameState.cart.reduce((sum, [c, q]) => sum + (SHOPPING_CATALOG[c].price * q), 0);
                    print(`TOTAL: $${total.toFixed(2)}`);
                }
                show_cart();
                return;
            }
            
            if (cmd === "CHECKOUT") {
                if (gameState.cart.length === 0) {
                    print("Cart is empty.");
                    show_cart();
                    return;
                }
                
                const total = gameState.cart.reduce((sum, [c, q]) => sum + (SHOPPING_CATALOG[c].price * q), 0);
                if (total > player.money) {
                    print(`You can't afford $${total.toFixed(2)}.`);
                    safe_input("Remove items? (y/n): ").then(ans => {
                        if (ans.toLowerCase() === "y") {
                            adjust_cart(player);
                        } else {
                            show_cart();
                        }
                    });
                    return;
                }
                
                player.money -= total;
                for (const [c, q] of gameState.cart) {
                    const msg = SHOPPING_CATALOG[c].apply(player, q);
                    print(`  ${msg}`);
                }
                slow_print(`You spent $${total.toFixed(2)} cash. Remaining: $${player.money.toFixed(2)}`);
                gameState.cart = [];
                return;
            }
            
            if (SHOPPING_CATALOG[cmd]) {
                let qty = 1;
                safe_input("Quantity: ").then(q => {
                    try {
                        qty = parseInt(q);
                    } catch (e) {
                        qty = 1;
                    }
                    if (qty <= 0) qty = 1;
                    gameState.cart.push([cmd, qty]);
                    const item = SHOPPING_CATALOG[cmd];
                    print(`Added: ${item.name} x${qty} = $${(item.price * qty).toFixed(2)}`);
                    show_cart();
                });
                return;
            }
            
            print("Unknown command.");
            show_cart();
        });
    }
    
    show_cart();
}

function adjust_cart(player) {
    function show_remove_options() {
        const total = gameState.cart.reduce((sum, [c, q]) => sum + (SHOPPING_CATALOG[c].price * q), 0);
        if (total <= player.money) {
            return;
        }
        
        print(`\nCart total $${total.toFixed(2)} exceeds cash $${player.money.toFixed(2)}. Remove items.`);
        gameState.cart.forEach(([c, q], i) => {
            print(`  ${i+1}. ${SHOPPING_CATALOG[c].name} x${q}`);
        });
        print("Enter item number to remove, or 'done':");
        
        safe_input("> ").then(choice => {
            if (choice === "done") return;
            try {
                const idx = parseInt(choice) - 1;
                if (idx >= 0 && idx < gameState.cart.length) {
                    gameState.cart.splice(idx, 1);
                    print("Removed.");
                }
            } catch (e) {}
            show_remove_options();
        });
    }
    
    show_remove_options();
}

// =============================================================
// EBT SYSTEM
// =============================================================

function ebt_spending_menu(player) {
    if (!player.ebt_active || !player.ebt) {
        slow_print("\nYou don't have an active EBT card yet.");
        return;
    }
    if (player.ebt.balance <= 0) {
        slow_print("\nEBT balance: $0.00. Nothing to spend until next deposit.");
        return;
    }
    
    print(`\n--- EBT GROCERY SHOPPING (Balance: $${player.ebt.balance.toFixed(2)}) ---`);
    print("1 = Grocery Outlet staples ($30) - +3 days food supply (best prices, friendlier staff)");
    print("2 = Fred Meyer full run ($50) - +5 days food supply, +2 soul (corporate, pricier)");
    print("3 = Bi-Mart canned goods ($15) - +2 days food supply (small chain, no coupons)");
    print("4 = The Bread Place (free) - +1 day food (donations welcome)");
    print("5 = Skip");
    
    safe_input("> ").then(choice => {
        if (choice === "1" && player.ebt.balance >= 30) {
            player.ebt.balance -= 30;
            player.food_supply_days += 3;
            slow_print(`EBT charged $30. Balance: $${player.ebt.balance.toFixed(2)}`);
        } else if (choice === "2" && player.ebt.balance >= 50) {
            player.ebt.balance -= 50;
            player.food_supply_days += 5;
            player.soul += 2;
            slow_print(`EBT charged $50. Balance: $${player.ebt.balance.toFixed(2)}`);
        } else if (choice === "3" && player.ebt.balance >= 15) {
            player.ebt.balance -= 15;
            player.food_supply_days += 2;
            slow_print(`EBT charged $15. Balance: $${player.ebt.balance.toFixed(2)}`);
        } else if (choice === "4") {
            player.food_supply_days += 1;
            safe_input("Donate a dollar (cash) to The Bread Place? (y/n): ").then(ans => {
                if (ans.toLowerCase() === "y") {
                    player.money = Math.max(0, player.money - 1);
                    player.soul += 5;
                    slow_print("The volunteer smiles. 'Bless you, hon.'");
                }
            });
        } else if (["1", "2", "3"].includes(choice)) {
            slow_print("Not enough EBT balance for that.");
        }
    });
}

function ebt_application(player) {
    init_assistance(player);
    if (player.assistance.ebt_approved) return;
    
    if (player.assistance.ebt_applied) {
        player.assistance.ebt_processing_days -= 1;
        if (player.assistance.ebt_processing_days <= 0) {
            player.assistance.ebt_approved = true;
            slow_print("\n*** EBT APPROVED ***");
            player.ebt_active = true;
            init_ebt(player);
        }
        return;
    }
    
    slow_print("\nYou go to the DHS office to apply for food stamps.");
    safe_input("1 = Fill out form  2 = Skip\n> ").then(ans => {
        if (ans === "1") {
            player.assistance.ebt_applied = true;
            player.assistance.ebt_processing_days = 7;
        }
    });
}

function energy_assistance_application(player) {
    init_assistance(player);
    if (player.assistance.energy_approved) return;
    
    if (player.assistance.energy_applied) {
        player.assistance.energy_processing_days -= 1;
        if (player.assistance.energy_processing_days <= 0) {
            player.assistance.energy_approved = true;
            player.power_paid = true;
            player.soul += 10;
            slow_print("\n*** ENERGY ASSISTANCE APPROVED ***");
        }
        return;
    }
    
    slow_print("\nPower bill due. Apply for Energy Assistance?");
    
    if (player.money >= 20 && !player.assistance.has_id) {
        safe_input("1 = Get ID ($20)  2 = Skip\n> ").then(ans => {
            if (ans === "1") {
                player.money -= 20;
                player.energy -= 50;
                player.assistance.has_id = true;
            }
            check_energy_docs();
        });
    } else {
        check_energy_docs();
    }
    
    function check_energy_docs() {
        if (player.money >= 1 && !player.assistance.has_power_bill) {
            player.money -= 1;
            player.assistance.has_power_bill = true;
        }
        if (player.money >= 1 && !player.assistance.photocopies_made) {
            player.money -= 1;
            player.assistance.photocopies_made = true;
        }
        if (player.assistance.has_id && player.assistance.has_power_bill && player.assistance.photocopies_made) {
            player.assistance.energy_applied = true;
            player.assistance.energy_processing_days = 5;
        }
    }
}

// =============================================================
// COOKING SYSTEM
// =============================================================

function cook_meal(player) {
    if (!player.has_camp_stove) {
        slow_print("You need a camp stove to cook.");
        return;
    }
    if (!player.has_clean_water) {
        slow_print("No clean water. You can't safely cook.");
        return;
    }
    if (player.food_supply_days <= 0) {
        slow_print("No raw ingredients to cook.");
        return;
    }

    const has_pot = player.inventory.includes("Large Pot");
    const has_pan = player.inventory.includes("Frying Pan");
    const has_cookware = has_pot || has_pan;

    if (!has_cookware) {
        slow_print("You need cookware (a pot or pan) to cook.");
        return;
    }

    print("\nWhat do you want to cook?");
    print("1 = Dried beans (slow, filling, +35 hunger, +2 soul)");
    print("2 = Simple pasta (quick, +25 hunger)");
    print("3 = Fried whatever (use up scraps, +20 hunger)");
    print("4 = Cancel");
    
    safe_input("> ").then(choice => {
        if (choice === "1") {
            if (!has_pot) {
                slow_print("You need a large pot for beans.");
                return;
            }
            slow_print("You soak the beans overnight. In the morning you simmer them.");
            if (player.cooking_skill >= 5) {
                slow_print("They're tender. Onions, salt, a little lard. It tastes like home.");
            } else {
                slow_print("They're a little undercooked. But they're hot. They're food.");
            }
            player.food_supply_days = Math.max(0, player.food_supply_days - 1);
            player.hunger = Math.min(100, player.hunger + 35);
            player.soul += 2;
            player.cooking_skill = Math.min(10, player.cooking_skill + 1);
            player.dishes_dirty += 1;
        } else if (choice === "2") {
            slow_print("Boil water. Dump pasta. Five minutes. Done.");
            player.food_supply_days = Math.max(0, player.food_supply_days - 1);
            player.hunger = Math.min(100, player.hunger + 25);
            player.cooking_skill = Math.min(10, player.cooking_skill + 1);
            player.dishes_dirty += 1;
        } else if (choice === "3") {
            if (!has_pan) {
                slow_print("You need a frying pan.");
                return;
            }
            slow_print("Whatever's in the pan. Oil. Heat. Eat.");
            player.food_supply_days = Math.max(0, player.food_supply_days - 1);
            player.hunger = Math.min(100, player.hunger + 20);
            player.dishes_dirty += 1;
        }
    });
}

function wash_dishes(player) {
    if (!player.has_clean_water) {
        slow_print("No clean water. You can't wash dishes.");
        return;
    }
    if (player.dishes_dirty <= 0) {
        slow_print("No dishes to wash.");
        return;
    }
    
    print(`\nDirty dishes: ${player.dishes_dirty}`);
    print("1 = Wash them all (uses water + soap, -5 energy, +5 soul)");
    print("2 = Quick rinse (uses less water, -2 energy)");
    print("3 = Leave them (dishes attract bugs)");
    
    safe_input("> ").then(choice => {
        if (choice === "1") {
            slow_print("Hot water. Dish soap. Elbow grease.");
            slow_print("The cats watch the water drip. You scrub until your hands hurt.");
            slow_print("There's a rhythm to it. A kind of meditation. You feel your soul lighten.");
            slow_print("(This is where you first imagined 'Escape from Section 8.' The idea crystallizes.)");
            player.dishes_dirty = 0;
            player.energy -= 5;
            player.soul += 5;
            player.vitality = Math.min(100, player.vitality + 2);
        } else if (choice === "2") {
            slow_print("Cold rinse. It'll do.");
            player.dishes_dirty = Math.max(0, player.dishes_dirty - 2);
            player.energy -= 2;
        } else {
            slow_print("The dishes sit. Flies gather. It smells.");
            player.soul -= 2;
        }
    });
}

// =============================================================
// QUICK FIX SYSTEM
// =============================================================

function quick_fix_menu(player) {
    print("\n--- QUICK FIX ---");
    print(`  Candy bars: ${player.candy_bars}   Energy drinks: ${player.energy_drinks}   Coffee: ${player.coffee_packets}`);
    print("1 = Eat a candy bar (+15 energy)" + (player.candy_bars > 0 ? "" : "  [none owned - buy at the store]"));
    print("2 = Energy drink (+30 energy, -3 vitality)" + (player.energy_drinks > 0 ? "" : "  [none owned]"));
    print("3 = Brew coffee (+10 energy)" + (player.coffee_packets > 0 ? "" : "  [none owned]"));
    print("4 = Smoke a cigarette (+5 energy, +1 soul)");
    print("5 = Smoke meth if you've got any on you (big energy, real cost)");
    print("6 = Just grit your teeth and push through (+5 energy, -2 soul)");
    print("7 = Never mind");
    
    safe_input("> ").then(choice => {
        if (choice === "1" && player.candy_bars > 0) {
            player.candy_bars -= 1;
            player.energy = Math.min(100, player.energy + 15);
            slow_print("Sugar rush. Not much, but it's something.");
        } else if (choice === "2" && player.energy_drinks > 0) {
            player.energy_drinks -= 1;
            player.energy = Math.min(100, player.energy + 30);
            player.vitality = Math.max(0, player.vitality - 3);
            slow_print("Chemical energy. Your hands buzz a little.");
        } else if (choice === "3" && player.coffee_packets > 0) {
            player.coffee_packets -= 1;
            player.energy = Math.min(100, player.energy + 10);
            slow_print("Bitter and black. It helps.");
        } else if (choice === "4") {
            player.energy = Math.min(100, player.energy + 5);
            player.soul += 1;
            slow_print("You light a cigarette. Small mercy.");
        } else if (choice === "5") {
            drug_use(player, "meth");
        } else if (choice === "6") {
            player.energy = Math.min(100, player.energy + 5);
            player.soul -= 2;
            slow_print("You grit your teeth and keep moving.");
        } else {
            slow_print("You decide against it.");
        }
    });
}

function drug_use(player, drug_name) {
    player.drug_use.push([player.day, drug_name]);
    if (drug_name === "meth") {
        slow_print("The crystal hits hard. Energy surges. You're invincible. For a while.");
        player.energy = 100;
        player.soul -= 5;
        player.hunger = Math.max(0, player.hunger - 20);
        player.vitality = Math.max(0, player.vitality - 10);
        if (Math.random() < 0.3) {
            slow_print("(Side effect: you crash hard later. -50 energy tomorrow morning.)");
            player.energy -= 30;
        }
    } else if (drug_name === "heroin") {
        slow_print("Warm blanket. The world disappears. You float.");
        player.soul -= 8;
        player.energy = 0;
        player.vitality = Math.max(0, player.vitality - 15);
    } else if (drug_name === "shrooms") {
        slow_print("The colors. The patterns. The cats are speaking to you.");
        player.soul += 5;
        player.hunger = Math.max(0, player.hunger - 10);
    } else if (drug_name === "weed") {
        slow_print("You relax. Everything is funny. The cats are funny.");
        player.soul += 2;
        player.hunger = Math.min(100, player.hunger + 15);
    }
}

function consume_alcohol(player, amount = 3) {
    player.alcohol_level = Math.min(10, player.alcohol_level + amount);
    if (player.alcohol_level >= 8) {
        slow_print("You're wasted. The world spins.");
    } else if (player.alcohol_level >= 5) {
        slow_print("You're drunk. Everything feels warm and blurred.");
    } else {
        slow_print("You feel a buzz.");
    }
}

function sober_up(player) {
    if (player.alcohol_level > 0) {
        player.alcohol_level = Math.max(0, player.alcohol_level - 1);
        if (player.alcohol_level === 0) {
            slow_print("You sober up. Headache. Cottonmouth.");
        }
    }
}

// =============================================================
// OTHER ACTIONS
// =============================================================

function hunt_bottles(player) {
    const base = Math.random() * (22 - 8) + 8;
    const fatigue = player.day * 0.4;
    const earned = Math.max(2, base - fatigue);
    slow_print(`Bottles. Found $${earned.toFixed(2)}.`);
    player.money += earned;
    player.soul += 1;
}

function scavenge(player) {
    const roll = Math.random();
    if (roll < 0.5) {
        const food = ["Bread", "Beans", "Donuts"][Math.floor(Math.random() * 3)];
        slow_print(`Found: ${food}.`);
        player.hunger = Math.min(100, player.hunger + 20);
    } else if (roll < 0.8) {
        slow_print("Picked clean.");
    } else {
        slow_print("Owner catches you. You run.");
        player.reputation -= 5;
        player.energy -= 5;
    }
}

function rest(player) {
    if (player.has_job) {
        slow_print("Your work schedule handles rest days automatically each morning now.");
        return;
    }
    player.energy = Math.min(100, player.energy + 40);
    player.soul += 2;
    player.vitality = Math.min(100, player.vitality + 10);
    slow_print("You rest. The cats keep you company.");
}

function play_with_cats(player) {
    slow_print("\nYou sit on the floor. The cats come to you.");
    slow_print("They purr. They knead the blanket.");
    player.soul = Math.min(100, player.soul + 8);
    player.energy -= 5;
    player.cat_mood = "loved";
}

function read_book(player) {
    if (!player.has_book) {
        slow_print("No book.");
        return;
    }
    slow_print("\nYou open the book.");
    player.soul = Math.min(100, player.soul + 10);
    player.energy -= 5;
}

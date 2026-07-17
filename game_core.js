// =============================================================
// ESCAPE FROM SECTION 8 - CORE GAME LOGIC
// =============================================================

// Initialize game
function startGame() {
    document.getElementById('title-screen').classList.add('hidden');
    document.getElementById('game-container').classList.remove('hidden');
    
    gameState.player = new Player();
    gameState.outputBuffer = "";
    gameState.cart = [];
    
    // Start day zero
    day_zero(gameState.player);
    
    updateDisplay();
}

// Handle user input
function handleKeyDown(event) {
    if (event.key === 'Enter' && gameState.waitingForInput) {
        submitInput();
    }
}

function submitInput() {
    const inputEl = document.getElementById('user-input');
    const value = inputEl.value.trim();
    inputEl.value = '';
    
    if (gameState.waitingForInput && gameState.inputCallback) {
        gameState.waitingForInput = false;
        const callback = gameState.inputCallback;
        gameState.inputCallback = null;
        callback(value);
    }
    
    updateDisplay();
}

// =============================================================
// CORE GAME SYSTEMS
// =============================================================

function advance_day(player) {
    player.day += 1;
    player.energy = 100;
    player.day_actions_used = 0;
    player.hunger = Math.max(0, player.hunger - 20);
    sober_up(player);
    
    if (!player.has_clean_water) {
        player.water_days_without += 1;
        if (player.water_days_without >= 3 && !player.water_fine_paid) {
            slow_print("\n*** Section 8 has paid the water bill. Owner has been fined. ***");
            player.has_clean_water = true;
            player.water_fine_paid = true;
            player.water_days_without = 0;
        }
    }
    
    check_phase(player);
    
    print();
    slow_print(`=========== Day ${player.day} (Week ${player.week_number}) ===========`);
    
    cat_morning(player);
    integrate_systems(player);
    handle_workday(player);
    
    // Start morning actions
    morning_actions(player);
}

function integrate_systems(player) {
    init_paper_trail(player);
    init_assistance(player);
    process_ebt(player);
    
    if (player.day === 3 && !player.assistance.ebt_applied) {
        ebt_application(player);
    }
    if (player.assistance.ebt_applied && !player.assistance.ebt_approved) {
        ebt_application(player);
    }
    if (player.day === 18 && !player.assistance.energy_approved) {
        energy_assistance_application(player);
    } else if (player.assistance.energy_applied && !player.assistance.energy_approved) {
        energy_assistance_application(player);
    }
    
    player.planter_watered_today = false;
    player.diner_meal_today = false;
    garbage_event(player);
    
    if (player.food_supply_days > 0 && player.has_camp_stove && player.has_clean_water && Math.random() < 0.3 && player.cooked_meals_available < 3) {
        player.cooked_meals_available += 1;
        player.food_supply_days = Math.max(0, player.food_supply_days - 1);
    }
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

// =============================================================
// PLAYER ACTIONS
// =============================================================

function morning_actions(player) {
    const actions = { ...MORNING_ACTIONS };
    
    // Update action descriptions based on player state
    if (player.has_job) {
        actions["3"].desc = "Talk to your boss";
        actions["3"].fn = "_job_status_check";
    }
    
    function processAction() {
        if (player.energy <= 0 || player.day_actions_used >= player.max_actions_per_day) {
            end_morning_actions();
            return;
        }
        
        updateDisplay();
        
        print(`  Actions left: ${player.max_actions_per_day - player.day_actions_used}`);
        
        for (const [key, action] of Object.entries(actions)) {
            const cost_str = action.cost === 0 ? "(restores)" : `(-${action.cost})`;
            print(`  ${key} = ${action.desc} ${cost_str}`);
        }
        
        print("\n> ", false);
        
        safe_input("> ").then(choice => {
            choice = choice.toUpperCase();
            
            if (!actions[choice]) {
                print("Invalid choice. Try again.");
                processAction();
                return;
            }
            
            const action = actions[choice];
            
            if (action.cost > 0 && player.energy < action.cost) {
                slow_print("Too tired. Try Rest (5) or a Quick Fix (G) first.");
                processAction();
                return;
            }
            
            if (action.cost === 0 && player.energy >= 100 && action.fn === "rest") {
                slow_print("Not tired.");
                processAction();
                return;
            }
            
            player.energy -= action.cost;
            player.day_actions_used += 1;
            
            // Call the action function
            const fnName = action.fn;
            if (typeof window[fnName] === 'function') {
                window[fnName](player);
            }
            
            processAction();
        });
    }
    
    function end_morning_actions() {
        // Continue with the day
        farmer_market(player);
        daily_encounters(player);
        check_npc_removals(player);
        
        const roll = Math.random();
        if (roll < 0.10 && player.day > 10) {
            management_event(player);
        } else if (roll < 0.20) {
            parole_threat(player);
        } else if (roll < 0.30 && player.let_lisa_in) {
            lisa_betrayal(player);
        } else {
            evening_event(player);
        }
        
        if (player.day === 15) {
            water_shutoff_event(player);
        }
        
        shuttle_neighbor(player);
        
        eviction_event(player).then(eviction_result => {
            if (eviction_result) {
                player.show_status();
                end_game(eviction_result);
                return;
            }
            
            check_week_reset(player);
            player.show_status();
            
            if (check_death(player)) {
                end_game("died");
                return;
            }
            
            const escape_tier = check_escape(player);
            if (escape_tier) {
                player.escape_tier = escape_tier.name;
                slow_print(`\nYou've saved enough, and it's documented enough, to make a move: ${escape_tier.name}.`);
                end_game("escape");
                return;
            }
            
            if (player.soul <= 0) {
                slow_print("\nYou don't recognize yourself anymore.");
                end_game("broken");
                return;
            }
            
            if (player.hunger <= 0) {
                slow_print("\nYour body is shutting down.");
                if (player.has_job && !player.diner_meal_today && player.employer && JOBS[player.employer] && JOBS[player.employer].meal_perk) {
                    slow_print("You drag yourself to work. Marlene takes one look at you.");
                    slow_print("'Sit. Eat.' She slides you a plate.");
                    player.hunger = Math.min(100, player.hunger + 50);
                    player.diner_meal_today = true;
                } else if (player.has_camp_stove && player.food_supply_days > 0 && player.has_clean_water) {
                    slow_print("You force yourself to cook something. Your hands shake.");
                    cook_meal(player);
                    if (player.hunger <= 0) {
                        slow_print("It wasn't enough. You needed more.");
                        end_game("broken");
                        return;
                    }
                } else {
                    end_game("broken");
                    return;
                }
            }
            
            // Continue to next day
            print("\n[Press enter to continue to next day]");
            safe_input("").then(() => {
                advance_day(player);
            });
        });
    }
    
    processAction();
}

function _job_status_check(player) {
    const boss = JOBS[player.employer].boss;
    slow_print(`${boss}: 'See you tomorrow, same as always.'`);
}

function check_week_reset(player) {
    if (player.day - player.week_start_day >= 6) {
        if (player.has_job && !player.terminated) {
            evaluate_work_week(player);
        }
        start_new_week(player);
    }
}

function start_new_week(player) {
    if (player.phone_number_posted && player.side_hustle_income > 0) {
        slow_print(`\nOdd jobs from the posted number: +$${player.side_hustle_income.toFixed(2)} this week.`);
        player.money += player.side_hustle_income;
    }
    player.week_number += 1;
    player.week_start_day = player.day + 1;
    player.days_worked_this_week = 0;
    player.days_rested_this_week = 0;
    player.days_missed_this_week = 0;
    player.extra_shifts_this_week = 0;
}

function handle_workday(player) {
    if (!player.has_job || player.terminated) {
        return;
    }
    
    const job = JOBS[player.employer];
    const boss = job.boss;
    const days_into_week = player.day - player.week_start_day;
    const days_left_in_week = 6 - days_into_week;

    slow_print(`\n--- ${player.employer} (Week ${player.week_number}, day ${days_into_week+1}/7) ---`);

    if (player.vitality < 20) {
        slow_print(`${boss}: 'You look like death. Go home. That's an order.'`);
        player.vitality = Math.min(100, player.vitality + 25);
        player.days_rested_this_week += 1;
        return;
    }

    if (days_left_in_week <= 0 && player.days_rested_this_week < 1) {
        slow_print(`${boss}: 'Last day of the week and you haven't taken a day off. Not negotiable.'`);
        player.vitality = Math.min(100, player.vitality + 20);
        player.days_rested_this_week += 1;
        player.soul += 3;
        return;
    }

    print("1 = Work a normal shift");
    print("2 = Take the day off (rest)");
    if (player.vitality < 50) {
        print("3 = Push through anyway (extra pay, real vitality risk)");
    }
    
    safe_input("> ").then(choice => {
        if (choice === "2") {
            player.days_rested_this_week += 1;
            player.vitality = Math.min(100, player.vitality + 20);
            player.energy = Math.min(100, player.energy + 20);
            player.soul += 2;
            slow_print("You take the day. The cats don't mind the company.");
            return;
        }

        if (choice === "3" && player.vitality < 50) {
            const pay = Math.random() * (job.pay_range[1] - job.pay_range[0]) + job.pay_range[0];
            slow_print(`${boss} notices. 'Appreciate the hustle.'`);
            player.money += pay * 1.15;
            player.legitimacy += 1;
            player.energy -= 30;
            player.vitality = Math.max(0, player.vitality - 18);
            player.days_worked_this_week += 1;
            player.extra_shifts_this_week += 1;
            return;
        }

        const pay = Math.random() * (job.pay_range[1] - job.pay_range[0]) + job.pay_range[0];
        const tips = Math.random() * (job.tips_range[1] - job.tips_range[0]) + job.tips_range[0];
        slow_print(`${boss} nods. You put in the shift. Earned $${pay.toFixed(2)}${tips > 0 ? ` + $${tips.toFixed(2)} tips.` : '.'}`);
        player.money += pay + tips;
        player.legitimacy += 3;
        player.soul += 2;
        player.days_worked_this_week += 1;
        player.vitality = Math.max(0, player.vitality - job.vitality_cost);
        player.energy -= 20;
        
        if (job.meal_perk && !player.diner_meal_today) {
            slow_print("Marlene: 'Sit. Eat before you go.'");
            slow_print("A plate slides across the counter. Eggs, toast, hash browns.");
            player.hunger = Math.min(100, player.hunger + 50);
            player.diner_meal_today = true;
        }
    });
}

function evaluate_work_week(player) {
    slow_print(`\n=== END OF WEEK ${player.week_number} - ${player.employer} ===`);
    slow_print(`Days worked: ${player.days_worked_this_week}   Rested: ${player.days_rested_this_week}   Missed: ${player.days_missed_this_week}`);
    const boss = JOBS[player.employer].boss;
    let terminated = false;
    let reason = "";

    if (player.days_rested_this_week < 1) {
        slow_print(`${boss}: 'You worked straight through. That ain't healthy.'`);
        player.vitality = Math.max(0, player.vitality - 25);
        if (player.vitality <= 0) {
            terminated = true;
            reason = "collapsed from exhaustion";
        }
    }

    if (player.days_missed_this_week >= 3 && !terminated) {
        slow_print(`${boss}: 'You missed ${player.days_missed_this_week} days. That's a pattern.'`);
        if (Math.random() < 0.7) {
            terminated = true;
            reason = `missed ${player.days_missed_this_week} days without calling in`;
        }
    }

    if (player.days_worked_this_week < 3 && !terminated) {
        slow_print(`${boss}: 'You only worked ${player.days_worked_this_week} days this week. That's not enough.'`);
        print("1 = Apologize and promise to do better");
        print("2 = 'Fire me, then.'");
        print("3 = Beg for another chance");
        safe_input("> ").then(c => {
            if (c === "1" && Math.random() < 0.6) {
                slow_print(`${boss}: 'One more week. Don't make me regret it.'`);
            } else if (c === "3" && Math.random() < 0.4) {
                slow_print(`${boss}: 'Alright. But I'm watching you.'`);
            } else {
                terminated = true;
                reason = "insufficient days worked";
                finish_evaluation();
            }
            if (!terminated) finish_evaluation();
        });
        return;
    }
    
    function finish_evaluation() {
        if (terminated) {
            slow_print(`\n*** YOU'VE BEEN TERMINATED FROM ${player.employer.toUpperCase()} ***`);
            slow_print(`Reason: ${reason}`);
            player.has_job = false;
            player.terminated = true;
            player.employer = null;
            player.legitimacy -= 20;
            player.soul -= 10;
        } else {
            slow_print(`${boss}: 'See you next week.'`);
        }
    }
    
    if (!terminated) {
        finish_evaluation();
    }
}

// =============================================================
// UTILITY FUNCTIONS
// =============================================================

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function print(text, newline = true) {
    gameState.outputBuffer += text + (newline ? "\n" : "");
    updateDisplay();
}

function slow_print(text, delay = 35) {
    // For web version, we'll just print normally
    // Could implement animated typing later
    print(text);
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

// Initialize game when page loads
window.onload = function() {
    document.getElementById('user-input').addEventListener('keydown', handleKeyDown);
};

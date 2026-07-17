// =============================================================
// ESCAPE FROM SECTION 8 - ADDITIONAL SYSTEMS
// =============================================================

// =============================================================
// FARMER'S MARKET
// =============================================================

function farmer_market(player) {
    if (player.day % 7 !== 2) return;
    if (player.farmer_market_day === player.day) return;
    
    slow_print("\n*** SATURDAY - SCAPPOOSE FARMER'S MARKET ***");
    print("1 = Set up a booth and sell something");
    print("2 = Just visit (browse, buy at market prices)");
    print("3 = Skip it this week");
    
    safe_input("> ").then(choice => {
        if (choice === "1") {
            const required = new Set(["table", "canopy", "chair", "signage"]);
            const missing = new Set([...required].filter(x => !player.market_equipment.has(x)));
            if (missing.size > 0) {
                slow_print(`You don't have a full booth setup. Missing: ${[...missing].join(', ')}.`);
                slow_print("(Table, canopy, chair, and signage are all at the store.)");
                return;
            }
            if (player.money < 20) {
                slow_print("Booth fee is $20 and you don't have it.");
                return;
            }
            
            const available = Object.keys(MARKET_PRODUCTS).filter(k => MARKET_PRODUCTS[k].requires(player));
            if (available.length === 0) {
                slow_print("You've got a booth, but nothing to sell. Stock some materials or grow something first.");
                return;
            }
            
            print("\nWhat are you selling today?");
            available.forEach(k => {
                print(`  ${k} = ${MARKET_PRODUCTS[k].name}`);
            });
            
            safe_input("> ").then(pchoice => {
                if (!available.includes(pchoice)) {
                    slow_print("You pack it back up and go home.");
                    return;
                }
                
                const product = MARKET_PRODUCTS[pchoice];
                player.money -= 20;
                player.energy -= 20;
                product.consume(player);
                const earnings = Math.random() * (product.earn[1] - product.earn[0]) + product.earn[0];
                
                if (player.has_guitar && pchoice !== "7") {
                    slow_print("You play a little guitar between customers. It draws people in.");
                    earnings *= 1.15;
                }
                
                player.money += earnings;
                player.farmer_market_day = player.day;
                player.reputation += 5;
                player.legitimacy += 5;
                slow_print(`Selling ${product.name.toLowerCase()} today. You made $${earnings.toFixed(2)}.`);
            });
        } else if (choice === "2") {
            slow_print("You browse the market. Prices run a bit above the thrift store, but it's fresh and local.");
            print("1 = Fresh food ($12, +3 days food, +2 soul)");
            print("2 = A small handmade gift for yourself ($10, +5 soul)");
            print("3 = Just look (free, +3 soul)");
            
            safe_input("> ").then(c2 => {
                if (c2 === "1" && player.money >= 12) {
                    player.money -= 12;
                    player.food_supply_days += 3;
                    player.soul += 2;
                } else if (c2 === "2" && player.money >= 10) {
                    player.money -= 10;
                    player.soul += 5;
                } else {
                    player.soul += 3;
                }
            });
        } else {
            slow_print("You skip the market this week.");
        }
    });
}

// =============================================================
// GARDENING
// =============================================================

function tend_garden(player) {
    if (!player.has_planter) {
        slow_print("No planter.");
        return;
    }
    
    print("1 = Plant seeds  2 = Water  3 = Harvest  4 = Skip");
    safe_input("> ").then(choice => {
        if (choice === "1") {
            if (!player.inventory.some(s => s.includes("Seeds"))) {
                slow_print("Need seeds.");
                return;
            }
            player.planter_seeded = true;
            player.gardening_days = 0;
            slow_print("Seeds planted.");
        } else if (choice === "2") {
            if (!player.has_clean_water) {
                slow_print("No clean water to spare.");
                return;
            }
            if (!player.planter_seeded) {
                slow_print("Nothing planted.");
                return;
            }
            player.planter_watered_today = true;
            player.gardening_days += 1;
            slow_print("Watered.");
        } else if (choice === "3") {
            if (player.gardening_days < 7) {
                slow_print(`Not ready. ${player.gardening_days}/7 days.`);
                return;
            }
            const threshold = 7 - player.plant_skill;
            if (Math.floor(Math.random() * 10) + 1 >= threshold) {
                const harvest = ["Vegetables", "Flowers", "Herbs"][Math.floor(Math.random() * 3)];
                slow_print(`You harvest ${harvest}!`);
                if (harvest === "Vegetables") {
                    player.food_supply_days += 3;
                    player.soul += 5;
                } else if (harvest === "Flowers") {
                    player.inventory.push("Fresh Flowers");
                    player.soul += 5;
                } else {
                    player.cooking_skill += 1;
                }
                player.gardening_days = 0;
            } else {
                slow_print("Plants withered.");
                player.gardening_days = 0;
            }
        }
    });
}

// =============================================================
// LIBRARY
// =============================================================

function library_event(player) {
    slow_print("\nYou walk to the Scappoose Library.");
    print("1 = Local history club  2 = Writers' group  3 = Music instruction");
    print("4 = Game day  5 = Browse books  6 = Leave");
    
    safe_input("> ").then(choice => {
        if (choice === "1") {
            player.soul += 8;
            player.reputation += 3;
        } else if (choice === "2") {
            player.soul += 8;
            player.legitimacy += 2;
        } else if (choice === "3") {
            player.soul += 10;
        } else if (choice === "4") {
            player.soul += 6;
            player.reputation += 2;
        } else if (choice === "5") {
            player.soul += 4;
        } else {
            return;
        }
        player.energy -= 10;
    });
}

// =============================================================
// LEARNING / SKILLS
// =============================================================

function learn_skill(player) {
    slow_print("\nYou want to learn something. Why?");
    print("1 = My sink is leaking (PLUMBING)");
    print("2 = I want to grow tomatoes (GARDENING)");
    print("3 = I want to cook better (COOKING)");
    print("4 = My car is making a noise (MECHANICS)");
    print("5 = I'm just curious (free choice)");
    print("6 = Skip");
    
    safe_input("> ").then(need => {
        let skill = null;
        
        if (need === "5") {
            print("Which skill?  1=Plumbing  2=Gardening  3=Cooking  4=Mechanics");
            safe_input("> ").then(s => {
                if (s === "1") skill = "plumbing";
                else if (s === "2") skill = "plant";
                else if (s === "3") skill = "cooking";
                else if (s === "4") skill = "mechanics";
                else return;
                choose_learning_method(player, skill);
            });
        } else if (need === "1") skill = "plumbing";
        else if (need === "2") skill = "plant";
        else if (need === "3") skill = "cooking";
        else if (need === "4") skill = "mechanics";
        else return;
        
        if (skill) {
            choose_learning_method(player, skill);
        }
    });
}

function choose_learning_method(player, skill) {
    slow_print("\nHow do you want to learn?");
    print("1 = Watch a free YouTube tutorial on the library computer (-10 energy)");
    print("2 = Read a book you own (-5 energy)");
    print("3 = Take a free class at the library (-15 energy)");
    print("4 = Take a community college class ($50, -20 energy, +3 skill)");
    print("5 = Learn from a neighbor (varies)");
    print("6 = Buy a proper textbook at the store ($15, +2 skill)");
    print("7 = Use your own computer or phone, if you own one (-5 energy, +2 skill, unlocks freelance work)");
    print("8 = Skip");
    
    safe_input("> ").then(choice => {
        let gain = 0;
        
        if (choice === "1" && player.energy >= 10) {
            slow_print("You sign up for the library computer. Twenty free minutes. You take notes on a napkin.");
            player.energy -= 10;
            gain = 1;
        } else if (choice === "2" && player.has_book && player.energy >= 5) {
            slow_print("You read the relevant chapter.");
            player.energy -= 5;
            gain = 1;
        } else if (choice === "3" && player.energy >= 15) {
            slow_print("You walk to the library. The class is small.");
            player.energy -= 15;
            player.reputation += 2;
            player.soul += 5;
            gain = 1;
        } else if (choice === "4" && player.money >= 50 && player.energy >= 20) {
            slow_print("Community college. You sit in the back. You learn.");
            player.money -= 50;
            player.energy -= 20;
            player.legitimacy += 5;
            gain = 3;
        } else if (choice === "5") {
            slow_print("Tina says she 'knows a guy.' It'll cost you $20.");
            safe_input("Pay $20? (y/n): ").then(ans => {
                if (ans.toLowerCase() === "y" && player.money >= 20) {
                    player.money -= 20;
                    slow_print("The guy shows you. You learn fast.");
                    gain = 2;
                    apply_skill_gain(player, skill, gain);
                } else {
                    slow_print("You learn the hard way, on your own.");
                    gain = 1;
                    apply_skill_gain(player, skill, gain);
                }
            });
            return;
        } else if (choice === "6" && player.money >= 15) {
            slow_print("A real textbook. Underlined by whoever had it before you.");
            player.money -= 15;
            gain = 2;
        } else if (choice === "7") {
            if (!player.has_computer && !player.has_phone) {
                slow_print("You don't own a computer or phone. Buy one at the store first.");
                return;
            }
            const device = player.has_phone && !player.has_computer ? "phone" : "computer";
            slow_print(`You dig in on your own ${device}. No time limit, no library hours to work around.`);
            player.energy -= 5;
            gain = 2;
        } else {
            slow_print("You don't have the resources for that.");
            return;
        }
        
        apply_skill_gain(player, skill, gain);
    });
}

function apply_skill_gain(player, skill, gain) {
    if (skill === "plumbing") {
        player.plumbing_skill = Math.min(10, player.plumbing_skill + gain);
    } else if (skill === "plant") {
        player.plant_skill = Math.min(10, player.plant_skill + gain);
    } else if (skill === "cooking") {
        player.cooking_skill = Math.min(10, player.cooking_skill + gain);
    } else if (skill === "mechanics") {
        player.mechanics_skill = Math.min(10, player.mechanics_skill + gain);
    }
    slow_print(`Your ${skill} skill increased to ${player[skill + '_skill']}/10.`);
}

// =============================================================
// FREELANCE WORK
// =============================================================

function freelance_gig(player) {
    if (!player.has_computer && !player.has_phone) {
        slow_print("You'd need a computer or phone for this kind of work.");
        return;
    }
    
    print("\nWhat kind of freelance work?");
    const opts = [];
    
    if (player.tom_relationship >= 2 && player.has_computer) {
        opts.push("1");
        print("1 = Build Tom a simple spreadsheet to track his runs, encrypted so nobody else can open it (one-time $150)");
    }
    if (player.employer === "Rusty Skillet" && (player.has_computer || player.has_phone)) {
        opts.push("2");
        print("2 = Redesign the diner's menu for a flat fee ($80, +legitimacy)");
    }
    const skilled = player.mechanics_skill >= 3 || player.cooking_skill >= 3 || player.plumbing_skill >= 3 || player.plant_skill >= 3;
    if (skilled && player.has_phone) {
        opts.push("3");
        print("3 = Post your number for odd-job work (small recurring weekly income)");
    }
    if (player.has_computer) {
        opts.push("4");
        print("4 = Pull together an evening of downloaded movies and old TV off the free archives (soul boost, no pay)");
    }
    print("5 = Nothing right now");
    
    safe_input("> ").then(choice => {
        if (choice === "1" && opts.includes("1")) {
            slow_print("You sit down with Tom and build him a simple spreadsheet - runs, dates, who owes what.");
            slow_print("You show him how to lock it down so nobody else can open the file.");
            player.money += 150;
            player.criminal_influence += 10;
            player.tom_trust += 10;
            change_rep("Tom", 15);
            slow_print("Tom: 'This is exactly what I needed. You're worth more than a runner.'");
        } else if (choice === "2" && opts.includes("2")) {
            slow_print("You lay out a cleaner menu, bigger print on the specials. Earl likes it.");
            player.money += 80;
            player.legitimacy += 5;
        } else if (choice === "3" && opts.includes("3")) {
            player.phone_number_posted = true;
            player.side_hustle_income = Math.random() * (50 - 20) + 20;
            player.side_hustle_type = "odd jobs";
            slow_print("You post your number around town. Odd jobs start trickling in - small stuff, but steady.");
        } else if (choice === "4" && opts.includes("4")) {
            slow_print("You spend the evening working through a stack of free public-domain movies and old TV reruns.");
            slow_print("It's not much, but for a couple hours you're just a person watching something, not surviving.");
            player.soul = Math.min(100, player.soul + 6);
            player.energy -= 10;
        } else {
            slow_print("Nothing comes together today.");
        }
    });
}

// =============================================================
// APPLY FOR WORK
// =============================================================

function apply_for_work(player) {
    if (player.has_job) {
        slow_print(`You already work at ${player.employer}.`);
        return;
    }
    if (gameState.game_phase === GAME_PHASES.LOCKDOWN) {
        slow_print("Nobody's hiring during lockdown.");
        return;
    }

    slow_print("\nWho's hiring around here?");
    print("1 = The Rusty Skillet (diner - people-facing, decent tips, a hot meal on shift)");
    print("2 = Miller's Salvage & Scrap (yard labor - harder on the body, better base pay, no meal)");
    print("3 = Not today");
    
    safe_input("> ").then(choice => {
        if (choice === "1") {
            if (player.reputation < 25 && player.legitimacy < 30) {
                slow_print("Earl looks up, sees you, looks down.");
                return;
            }
            slow_print("Earl: 'You any good with people?'");
            safe_input("1 = Honest  2 = Confident\n> ").then(ans => {
                if (ans === "1") {
                    slow_print("Earl nods. 'Come back tomorrow. 6am.'");
                    player.legitimacy += 15;
                    player.has_job = true;
                    player.employer = "Rusty Skillet";
                    player.terminated = false;
                    start_new_week(player);
                    player.week_number = 1;
                    print("\nPay type:  1=W2  2=1099  3=Under-the-table");
                    safe_input("> ").then(c => {
                        if (c === "1") {
                            player.employment_type = "W2";
                            player.legitimacy += 10;
                        } else if (c === "2") {
                            player.employment_type = "1099";
                            player.legitimacy += 5;
                        } else {
                            player.employment_type = "under_the_table";
                            player.criminal_influence += 5;
                        }
                    });
                } else {
                    slow_print("Earl: 'Don't need an actor.'");
                }
            });
        } else if (choice === "2") {
            slow_print("Miller looks you over. Arms, hands, boots.");
            slow_print("'You break easy?'");
            safe_input("1 = 'No.'  2 = 'Depends on the day.'\n> ").then(ans => {
                if (ans === "1") {
                    slow_print("Miller grunts. 'Good enough. Six am. Steel-toe boots or don't bother.'");
                    player.legitimacy += 12;
                    player.has_job = true;
                    player.employer = "Miller's Salvage";
                    player.terminated = false;
                    start_new_week(player);
                    player.week_number = 1;
                    player.employment_type = "1099";
                } else {
                    slow_print("Miller shrugs. 'Everybody breaks eventually. Come back when you're sure.'");
                }
            });
        } else {
            slow_print("You keep walking.");
        }
    });
}

// =============================================================
// MANAGEMENT EVENTS
// =============================================================

function water_shutoff_event(player) {
    slow_print("\n*** WATER SHUTOFF NOTICE ***");
    if (player.water_fine_paid) {
        slow_print("The owner paid the fine. Water's back on.");
        player.has_clean_water = true;
        player.water_days_without = 0;
        return;
    }
    print("1 = Fill buckets  2 = Wait it out  3 = Organize  4 = Pay the bill ($500)");
    
    safe_input("> ").then(c => {
        if (c === "1") {
            if (player.has_tool_kit) {
                slow_print("You get the buckets. Fill them in the bathtub before the shutoff.");
                player.energy -= 30;
                player.soul += 5;
                player.inventory.push("5-Gallon Buckets (3)");
                player.has_clean_water = true;
                player.water_days_without = 0;
            } else {
                slow_print("You try, but you don't have buckets. You lose water.");
                player.has_clean_water = false;
                player.water_days_without = 1;
            }
        } else if (c === "2") {
            slow_print("You wait. The Section 8 housing authority will pay the bill and fine the owner.");
            slow_print("After 3 days, water is restored. The owner gets fined.");
            player.has_clean_water = false;
            player.water_days_without = 1;
        } else if (c === "3") {
            slow_print("You organize. Other tenants join. Management is forced to act.");
            player.reputation -= 10;
            player.soul += 2;
        } else if (c === "4" && player.money >= 500) {
            slow_print("You pay the bill. Water's back on. The owner is grateful.");
            player.money -= 500;
            player.soul += 15;
            player.reputation += 20;
            player.has_clean_water = true;
            player.water_fine_paid = true;
            player.water_days_without = 0;
        }
    });
}

function garbage_event(player) {
    if (player.garbage_days_without > 0 && !player.garbage_fine_paid) {
        if (player.garbage_days_without >= 60) {
            slow_print("\n*** GARBAGE NOTICE ***");
            slow_print("The dumpster hasn't been emptied in 2 months.");
            slow_print("The Section 8 housing authority is fining the owner.");
            slow_print("Service will be restored today.");
            player.garbage_fine_paid = true;
            player.garbage_days_without = 0;
            return;
        }
        player.garbage_days_without += 1;
        if (Math.random() < 0.1) {
            slow_print("\nThe dumpster is overflowing. Flies everywhere. It smells.");
            print("1 = Deal with it  2 = Ignore");
            safe_input("> ").then(c => {
                if (c === "1") {
                    player.energy -= 15;
                    player.soul += 3;
                } else {
                    player.soul -= 2;
                }
            });
        }
    }
}

function management_event(player) {
    const event_type = ["squatter_accusation", "locked_office", "dismissive_agent", "selective_enforcement"][Math.floor(Math.random() * 4)];
    
    if (event_type === "squatter_accusation") {
        slow_print("\nA squatter in 52776 accuses you of being a pedophile.");
        print("1 = Ignore  2 = File report  3 = Confront");
        safe_input("> ").then(c => {
            if (c === "1") {
                player.soul -= 10;
                player.reputation -= 5;
            } else if (c === "2") {
                player.soul += 5;
                player.reputation += 5;
                document_event(player, 20, "Defamation per se by squatter");
            } else {
                player.soul += 2;
                change_anger("Tina", 10);
            }
        });
    } else if (event_type === "locked_office") {
        slow_print("\nManagement office locked during business hours.");
        print("1 = Call  2 = Leave note  3 = Document");
        safe_input("> ").then(c => {
            if (c === "1") player.soul -= 3;
            else if (c === "2") player.soul += 1;
            else {
                document_event(player, 10, "Office locked during hours");
                player.soul += 3;
            }
        });
    } else if (event_type === "dismissive_agent") {
        slow_print("\nManager Sherry is contemptuous.");
        print("1 = Stay calm  2 = Call her out  3 = Walk away");
        safe_input("> ").then(c => {
            if (c === "1") player.soul += 3;
            else if (c === "2") {
                player.reputation -= 5;
                change_anger("Tina", 15);
            } else {
                player.soul += 1;
            }
        });
    } else if (event_type === "selective_enforcement") {
        slow_print("\n'Unauthorized pets' notice - only to you.");
        print("1 = Comply  2 = Document  3 = Ignore");
        safe_input("> ").then(c => {
            if (c === "1") player.soul -= 5;
            else if (c === "2") {
                document_event(player, 12, "Selective enforcement");
                player.soul += 5;
            } else {
                player.reputation -= 2;
            }
        });
    }
}

function shuttle_neighbor(player) {
    if (!player.inventory.includes("Old POV")) return;
    if (Math.random() > 0.2) return;
    slow_print("\nA neighbor needs a ride. '$15.'");
    print("1 = Take  2 = Decline");
    
    safe_input("> ").then(ans => {
        if (ans === "1" && player.energy >= 20) {
            player.energy -= 20;
            player.money += 15;
            slow_print("You drive. They tip $2.");
        }
    });
}

// =============================================================
// PAROLE THREAT
// =============================================================

function parole_threat(player) {
    const women = ["Tina", "Lisa"];
    const men = ["Frank", "Gabe"];
    const topic = pick_confrontation_topic(player);
    let target;
    
    if (topic === "jealousy") {
        target = [...women, ...men][Math.floor(Math.random() * 4)];
    } else if (topic === "moral_disapproval") {
        target = ["Bill", "Rebecca", "Gabe"][Math.floor(Math.random() * 3)];
    } else {
        target = ["Frank", "Gabe"][Math.floor(Math.random() * 2)];
    }
    
    print();
    print(RESIDENTS[target].desc);
    slow_print(`${target} corners you. 'We need to talk.'`);

    if (topic === "jealousy") {
        slow_print("'I heard things. You think I don't hear things?'");
        slow_print(`${target} is puffed up, but there's a waver in it. This is jealousy, not real danger.`);
        print("1 = Stand ground ('And? Not your business.')");
        print("2 = Flirt / deflect");
        print("3 = Apologize (de-escalate, costs you some standing)");
        print("4 = Run");
        print("5 = Call police");
        safe_input("> ").then(choice => {
            if (choice === "1") {
                slow_print(`${target} blinks first. 'Yeah, well. Just so you know I know.' They back off.`);
                player.reputation += 10;
                player.criminal_influence += 3;
            } else if (choice === "2") {
                slow_print("You turn it around on them. 'Jealous?' They splutter and leave, flustered.");
                player.reputation += 5;
                apply_intimacy_bonus(player, "flirt");
            } else if (choice === "3") {
                slow_print("You apologize for something you don't owe an apology for. They take the win and go.");
                player.reputation -= 3;
            } else if (choice === "4") {
                slow_print("You walk away fast. 'Coward,' they call after you.");
                player.reputation -= 5;
            } else {
                slow_print("Dispatcher: 'Another Section 8 dispute.' Nothing comes of it.");
                player.reputation -= 3;
            }
        });
    } else if (topic === "moral_disapproval") {
        slow_print(`${target}: 'Word gets around about what you're smoking out there. This place already's got a reputation.'`);
        slow_print("'People like you bring in a seedier element. I don't want that around here.'");
        print("1 = Stand ground ('It's my porch, my business.')");
        print("2 = De-escalate ('Fair. I'll keep it low-key.')");
        print("3 = Bluff ('You have no idea what you're talking about.')");
        print("4 = Run");
        print("5 = Call police");
        safe_input("> ").then(choice => {
            if (choice === "1" || choice === "3") {
                slow_print(`${target} suddenly finds somewhere else to be. Talk is all they had.`);
                slow_print("(They wanted you to back down quietly. You didn't. They fold.)");
                player.reputation += 8;
            } else if (choice === "2") {
                slow_print(`${target} nods, satisfied, and leaves feeling like they won something small.`);
                player.reputation += 2;
            } else if (choice === "4") {
                slow_print(`${target} feels vindicated by you running. 'Figured,' they mutter.`);
                player.reputation -= 5;
            } else {
                slow_print("Dispatcher isn't interested in a smoking complaint. Nothing happens.");
                player.reputation -= 2;
            }
        });
    } else {
        slow_print(`${target} is drunk, bored, and looking for someone smaller to lean on. That's you, today.`);
        print("1 = Stand ground (knock them down a peg)");
        print("2 = De-escalate");
        print("3 = Bluff");
        print("4 = Run");
        print("5 = Call police");
        safe_input("> ").then(choice => {
            if (choice === "1") {
                slow_print(`${target} sways, reconsiders, and backs off. 'Alright, alright. Didn't mean nothin'.'`);
                player.reputation += 12;
                change_rep(target, 10);
            } else if (choice === "2") {
                slow_print("'Fine. Stay out of my way,' they mutter and stumble off.");
                player.reputation += 3;
            } else if (choice === "3") {
                slow_print("They squint, unsure if you're serious, and back off. For now.");
                player.reputation += 2;
            } else if (choice === "4") {
                slow_print(`${target} laughs. 'That's what I thought.' Word gets around that you ran from a drunk.`);
                player.reputation -= 8;
            } else {
                slow_print("Nothing happens. The dispatcher's heard it all before.");
                player.reputation -= 3;
            }
        });
    }
}

function pick_confrontation_topic(player) {
    const options = [];
    const weights = [];
    
    if (player.tina_had_sex || player.lisa_had_sex || player.tina_trust > 40) {
        options.push("jealousy");
        weights.push(3);
    }
    if (player.last_porch_choice in ["meth", "heroin", "shrooms"] || player.drug_use.length >= 2) {
        options.push("moral_disapproval");
        weights.push(3);
    }
    options.push("bully");
    weights.push(2);
    
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < options.length; i++) {
        if (random < weights[i]) {
            return options[i];
        }
        random -= weights[i];
    }
    
    return options[0] || "bully";
}

// =============================================================
// ENDINGS
// =============================================================

function check_escape(player) {
    for (const tier of PROPERTY_TIERS) {
        if (player.money >= tier.money && player.legitimacy >= tier.legit) {
            return tier;
        }
    }
    return null;
}

function check_death(player) {
    let risk = 0.001;
    if (player.vitality <= 10) {
        risk += 0.01;
    }
    if (player.drug_use.length >= 15) {
        risk += 0.01;
    }
    const recent_hard = player.drug_use.slice(-3).filter(d => d[1] === "meth" || d[1] === "heroin");
    if (recent_hard.length > 0 && Math.random() < 0.3) {
        risk += 0.02;
    }
    if (Math.random() < risk) {
        const cause = [
            "organ failure, the slow kind, the kind that comes from years of wear and not enough care",
            "an overdose, alone, before anyone realized something was wrong",
            "complications nobody saw coming until it was already too late",
        ][Math.floor(Math.random() * 3)];
        slow_print(`\nYou don't wake up. Cause of death, eventually, on paper: ${cause}.`);
        return true;
    }
    return false;
}

function check_npc_removals(player) {
    if (player.phyllis_status === "active" && player.day > 25 && Math.random() < 0.03) {
        slow_print("\nAn ambulance sits outside Phyllis's unit most of the afternoon.");
        slow_print("Someone says EMS found her in bad shape - hadn't bathed in weeks, same clothes for days.");
        slow_print("She doesn't come back. A property manager shows up not long after, mostly to evict whoever'd been staying with her.");
        player.phyllis_status = "removed";
        if (player.gabe_suspects_phyllis) {
            slow_print("Gabe goes quiet for a few days after that.");
            player.soul -= 3;
        }
    }
    if (player.gladys_status === "active" && player.day > 30 && Math.random() < 0.02) {
        slow_print("\nGladys is hospitalized. Word is the state's taking over her care - her place had gotten that bad.");
        player.gladys_status = "removed";
    }
}

function eviction_event(player) {
    if (player.eviction_notice) {
        return Promise.resolve(null);
    }
    if (player.day < 25 || Math.random() > 0.01) {
        return Promise.resolve(null);
    }
    player.eviction_notice = true;
    slow_print("\n*** EVICTION / BUYOUT NOTICE ***");
    slow_print("New ownership wants the unit empty. They're offering $5,000 cash to leave quietly - no eviction on record.");
    print("1 = Take the $5,000 and go");
    print("2 = Fight it (uses your paper trail)");
    print("3 = Ignore it and see what happens");
    
    return safe_input("> ").then(c => {
        if (c === "1") {
            player.money += 5000;
            player.eviction_buyout_taken = true;
            return "evicted_buyout";
        } else if (c === "2") {
            if (player.paper_trail >= 60) {
                slow_print("Your documentation holds up. You negotiate more time, and a better number.");
                player.money += 2000;
                player.legitimacy += 10;
                return null;
            } else {
                slow_print("Without enough on paper, the fight doesn't hold. Eviction proceeds.");
                return "evicted_forced";
            }
        } else {
            slow_print("You do nothing. Thirty days later, the sheriff posts a notice.");
            return "evicted_forced";
        }
    });
}

function end_game(result) {
    print();
    print("=" .repeat(50));
    
    if (result === "escape") {
        slow_print(`YOU ESCAPED. You put together ${gameState.player.escape_tier}. It's yours.`);
    } else if (result === "evicted_buyout") {
        slow_print("You took the $5,000 and walked away quiet. No eviction on record.");
        slow_print("It's not the ending you pictured, but it's a clean one.");
    } else if (result === "evicted_forced") {
        slow_print("EVICTED. The sheriff posted the notice. You're out, with a mark on your record.");
    } else if (result === "died") {
        slow_print("Section 8 Pines outlasted you. Someone else moves into the unit within the month.");
    } else {
        slow_print("THE GRIND WON. But you lasted longer than most.");
    }
    
    print("=" .repeat(50));
    print(`Final Day: ${gameState.player.day}`);
    print(`Final Money: $${gameState.player.money.toFixed(2)}`);
    print(`Final Soul: ${gameState.player.soul}/100`);
    print(`Final Legitimacy: ${gameState.player.legitimacy}/100`);
    print(`Final Criminal Influence: ${gameState.player.criminal_influence}/100`);
    print(`Final Paper Trail: ${gameState.player.paper_trail}/100`);
    
    // Disable input
    document.getElementById('user-input').disabled = true;
    document.getElementById('submit-button').disabled = true;
}

// =============================================================
// DAY ZERO
// =============================================================

function day_zero(player) {
    print();
    slow_print("=" .repeat(50));
    slow_print("   ARRIVAL - DAY ZERO");
    slow_print("=" .repeat(50));
    print();
    slow_print("You pull into Section 8 Pines. The engine cuts. The silence is heavy.");
    slow_print("Cinderblock walls. Laundry lines. A dog barks somewhere distant.");
    slow_print("Two cats in the back seat, watching you with patient eyes.");
    print();
    print("1 = 'At least it's a roof and a door which locks.'");
    print("2 = Drive in cheerfully. Unload everything. Make it home.");
    print("3 = Cautiously inspect the unit first.");
    
    safe_input("> ").then(choice => {
        print();
        if (choice === "1") {
            slow_print("You sit in the POV for ten minutes before you move.");
            slow_print("'A roof and a door,' you whisper. 'That's something.'");
            slow_print("The cats meow. You carry them in.");
            slow_print("The unit smells like bleach and someone else's cigarette smoke.");
            slow_print("You set down the blankets. Lay down. Don't eat. Don't unpack.");
            slow_print("You stare at the ceiling. The ceiling stares back.");
            slow_print("\nEnd of Day Zero. Tomorrow, the grind begins.");
            player.soul -= 5;
        } else if (choice === "2") {
            slow_print("You park in front of your unit. Smile at the absurdity of it.");
            slow_print("Unlock the door. Usher the cats inside. Begin hauling boxes.");
            slow_print("This is it. This is home. You make it home through sheer will.");
            slow_print("By evening, the blankets are laid out. The cats are fed. You collapse.");
            slow_print("You're smiling. Tomorrow will be hard, but tonight, you made it.");
            player.soul += 5;
            player.reputation += 3;
        } else {
            slow_print("You leave the cats in the POV. Walk to the unit. Unlock it slowly.");
            slow_print("Door open. Listen. The pipes tick. Something drips.");
            slow_print("You step inside. Empty. Four walls. A window. A lock that works.");
            slow_print("You circle the rooms. Check the closets. Check under the sink.");
            slow_print("Clear. You return for the cats. Carry them in. Give them food.");
            slow_print("You unload the POV. Lock the door. Unfurl the blanket.");
            slow_print("You lay down. The cats curl at your feet. The door is locked.");
            slow_print("Tomorrow, the world.");
            player.soul += 3;
            player.legitimacy += 2;
        }
        print();
        slow_print("You sleep on the floor. Your back hurts. The cats are restless.");
        slow_print("This is your new reality.");
        
        // Start day 1
        print("\n[Press enter to begin Day 1]");
        safe_input("").then(() => {
            advance_day(gameState.player);
        });
    });
}

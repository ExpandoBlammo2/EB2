// =============================================================
// ESCAPE FROM SECTION 8 - ENCOUNTERS AND EVENTS
// =============================================================

// =============================================================
// DAILY ENCOUNTERS
// =============================================================

function daily_encounters(player) {
    slow_print("\nYou step outside.");
    const pool = Object.keys(RESIDENTS);
    shuffleArray(pool);
    const count = Math.min(2, pool.length);
    
    function processEncounter(index) {
        if (index >= count) return;
        
        const name = pool[index];
        if (RESIDENTS[name].anger >= 80) {
            print(`\n${name} glares at you.`);
            processEncounter(index + 1);
            return;
        }
        
        const funcName = `encounter_${name.toLowerCase()}`;
        if (typeof window[funcName] === 'function') {
            try {
                window[funcName](player);
            } catch (e) {
                slow_print(`(Encounter with ${name} skipped: ${e})`);
            }
        } else {
            print(`\n[${name} is around.]`);
        }
        
        print("\n[Press enter to continue]");
        safe_input("").then(() => {
            processEncounter(index + 1);
        });
    }
    
    processEncounter(0);
}

// =============================================================
// CHARACTER ENCOUNTERS
// =============================================================

function encounter_tina(player) {
    print();
    print(RESIDENTS["Tina"].desc);
    slow_print("Tina leans against her doorframe, smoking.");
    slow_print("She watches you. A long, slow look. Then a smile.");
    slow_print("'You're the new one. Cats, right? I heard them yowling.'");
    print("1 = 'Yeah. Just getting settled.' (polite)");
    print("2 = 'You got a problem with cats?' (defensive)");
    print("3 = 'Tina, right? I heard about you.' (curious)");
    print("4 = Nod and walk past (cold)");
    
    safe_input("> ").then(choice => {
        if (choice === "1") {
            slow_print("'Settled. Yeah.' She exhales smoke. 'I been here twelve years.'");
            slow_print("'You need anything, you let me know. I take care of my neighbors.'");
            player.soul += 1;
            change_rep("Tina", 5);
            player.tina_trust += 7;
        } else if (choice === "2") {
            slow_print("She laughs. 'I like animals. So do I.' She winks. 'We'll get along.'");
            change_rep("Tina", 3);
            player.tina_trust += 5;
        } else if (choice === "3") {
            slow_print("Her eyes narrow. 'All good things, I hope.' She smiles anyway.");
            change_rep("Tina", 4);
            player.tina_trust += 8;
        } else {
            slow_print("She watches you go. 'Cold one,' she mutters. 'We'll see.'");
            player.tina_trust += 2;
            change_anger("Tina", 5);
        }
        slow_print("(Tina doesn't linger on the read for long. She moves quick once she's decided.)");
        player.tina_interactions += 1;
    });
}

function encounter_gabe(player) {
    print();
    print(RESIDENTS["Gabe"].desc);
    slow_print("Gabe is on his porch, beer in hand.");
    print("1 = Nod and pass");
    print("2 = 'You okay, man?'");
    print("3 = 'You got a light?'");
    print("4 = 'I heard about the mill.'");
    
    safe_input("> ").then(c => {
        if (c === "1") {
            slow_print("Gabe looks through you.");
        } else if (c === "2") {
            slow_print("'Never been okay. But thanks for asking.'");
            slow_print("He offers you a beer. 'It's warm. Don't care.'");
            print("1 = Take the beer  2 = Decline");
            safe_input("> ").then(n => {
                if (n === "1") {
                    consume_alcohol(player, 2);
                    slow_print("You drink. It's warm. He nods.");
                    player.soul += 2;
                } else {
                    slow_print("He shrugs and drinks alone.");
                }
                player.reputation += 5;
                player.gabe_trust += 6;
            });
        } else if (c === "3") {
            slow_print("He pulls out a lighter. Flicks it. 'Keep it.'");
            player.inventory.push("Lighter");
            player.soul += 2;
            change_rep("Gabe", 10);
            player.gabe_trust += 5;
        } else {
            slow_print("'Mill? I got laid off six months ago.'");
            slow_print("'Now I just drink and wait. There's nothing else here for guys like me.'");
            slow_print("'You got a job yet?'");
            print("1 = 'Working.'");
            print("2 = 'Looking.'");
            print("3 = 'None of your business.'");
            safe_input("> ").then(n => {
                if (n === "1") {
                    slow_print("'Good for you. Better than most.'");
                    change_rep("Gabe", 5);
                    player.gabe_trust += 6;
                } else if (n === "2") {
                    slow_print("'There's a timber crew hiring up the mountain. Drug test though.'");
                    player.soul += 3;
                    player.gabe_trust += 4;
                } else {
                    slow_print("He nods. 'Fair enough.'");
                }
                player.soul -= 2;
            });
        }
    });
}

function encounter_frank(player) {
    print();
    print(RESIDENTS["Frank"].desc);
    slow_print("Frank: 'You the new guy?'");
    print("1 = Keep walking");
    print("2 = 'Yeah. Staying out of trouble.'");
    print("3 = 'Heard you did time.'");
    
    safe_input("> ").then(c => {
        if (c === "1") {
            slow_print("He snorts.");
        } else if (c === "2") {
            slow_print("Frank looks you over. 'Everybody says that. Some of 'em mean it.'");
            player.frank_trust += 5;
        } else {
            slow_print("Frank's face goes stone.");
            change_rep("Frank", -20);
            change_anger("Frank", 30);
            player.frank_trust -= 10;
        }
        player.frank_stage = 1;
    });
}

function encounter_phyllis(player) {
    print();
    print(RESIDENTS["Phyllis"].desc);
    slow_print("Phyllis: 'That dog will kill any dog.'");
    print("1 = 'I'll keep my cats away.'  2 = 'What happened to your family?'  3 = Nod");
    
    safe_input("> ").then(c => {
        if (c === "1") {
            change_rep("Phyllis", 5);
        } else if (c === "2") {
            slow_print("'I don't remember.'");
            player.soul += 3;
        }
    });
}

function encounter_bill(player) {
    print();
    print(RESIDENTS["Bill"].desc);
    slow_print("Bill: 'Don't park in spot 12.'");
    print("1 = 'Why not?'  2 = 'Noted.'  3 = Nod");
    
    safe_input("> ").then(c => {
        if (c === "1") {
            slow_print("'That's where Gladys parks her walker.'");
            player.reputation += 3;
        }
    });
}

function encounter_gladys(player) {
    print();
    print(RESIDENTS["Gladys"].desc);
    slow_print("The smell. Her door ajar.");
    print("1 = Walk past  2 = Knock  3 = Report");
    
    safe_input("> ").then(c => {
        if (c === "2") {
            player.soul += 5;
        } else if (c === "3") {
            player.soul += 3;
            document_event(player, 5, "Reported Gladys's conditions");
        }
    });
}

function encounter_rebecca(player) {
    print();
    print(RESIDENTS["Rebecca"].desc);
    slow_print("Rebecca sips from a giant travel mug.");
    print("1 = 'What's in the mug?' (small talk)");
    print("2 = 'You know everything. What do you know about Tina?' (buy info)");
    print("3 = 'How long have you lived here?' (rapport)");
    print("4 = Nod and walk");
    
    safe_input("> ").then(c => {
        if (c === "1") {
            slow_print("'Coffee. Strong coffee.' You both know.");
            change_rep("Rebecca", 5);
            player.rebecca_trust += 3;
        } else if (c === "2") {
            slow_print("'Tina? Five bucks. Twenty if you want the real story.'");
            print("1 = Pay $5 (surface gossip)");
            print("2 = Pay $20 (deep info)");
            print("3 = 'Forget it.'");
            safe_input("> ").then(n => {
                if (n === "1" && player.money >= 5) {
                    player.money -= 5;
                    slow_print("'Tina's been running for Tom for years. She hates him but can't quit.'");
                    change_rep("Rebecca", 5);
                    player.rebecca_trust += 4;
                } else if (n === "2" && player.money >= 20) {
                    player.money -= 20;
                    slow_print("'Tina was a junkie in Portland. She lost custody. She blames the system.'");
                    slow_print("'She's got a soft spot for animals. If you ever need a favor, ask about the cats.'");
                    slow_print("'And she moves fast once she wants something - she won't wait around for you to catch on.'");
                    slow_print("'In her day, she was a real looker. Now she's old and bold about it. Dangerous combination.'");
                    player.soul += 5;
                    change_rep("Rebecca", 15);
                    player.rebecca_trust += 10;
                    player.rebecca_info_level = 1;
                } else {
                    slow_print("Rebecca shrugs. 'Your loss.'");
                }
            });
        } else if (c === "3") {
            slow_print("'Twelve years. It was always bad.'");
            player.reputation += 3;
            player.rebecca_trust += 2;
        } else {
            slow_print("She watches you walk by.");
        }
    });
}

function encounter_lisa(player) {
    print();
    print(RESIDENTS["Lisa"].desc);
    
    if (player.lisa_had_sex) {
        slow_print("Lisa: 'Hey baby. I got a bag. Wanna smoke and fuck?'");
        print("1 = 'Yeah.'");
        print("2 = 'Not today.'");
        print("3 = 'You owe me.'");
        safe_input("> ").then(c => {
            if (c === "1") {
                slow_print("You go inside. The door closes. Hours later, she's snoring.");
                drug_use(player, "weed");
                player.energy -= 20;
                apply_intimacy_bonus(player, "sex");
            } else if (c === "2") {
                slow_print("She shrugs. 'Suit yourself. I'll find someone else.'");
                change_rep("Lisa", -2);
            } else {
                slow_print("'I don't owe you shit,' she says, more tired than angry, and wanders off.");
                change_anger("Lisa", 6);
            }
        });
    } else if (player.lisa_helped_steal) {
        slow_print("Lisa: 'Hey, partner. Got another job if you're interested.'");
        print("1 = 'What kind of job?'");
        print("2 = 'No, I'm done with that.'");
        print("3 = 'Depends on the pay.'");
        safe_input("> ").then(c => {
            if (c === "1") {
                slow_print("'Gladys. Her medicine cabinet. She's got Percocet. We can flip it.'");
                print("1 = 'I'm in.'");
                print("2 = 'No, too risky.'");
                safe_input("> ").then(n => {
                    if (n === "1") {
                        lisa_steal_job(player);
                    } else {
                        slow_print("'Your loss. I got a buyer lined up.'");
                    }
                });
            } else if (c === "2") {
                slow_print("'Straight and narrow? Boring. But okay.'");
            } else {
                slow_print("'Hundred each. Maybe two hundred if we get the good stuff.'");
                print("1 = 'I'm in.'");
                print("2 = 'No.'");
                safe_input("> ").then(n => {
                    if (n === "1") {
                        lisa_steal_job(player);
                    } else {
                        slow_print("'Whatever. I'll find someone else.'");
                    }
                });
            }
        });
    } else if (player.lisa_stiffed_me && player.let_lisa_in) {
        slow_print("Lisa: 'I need to use your bathroom. Got cash this time.'");
        slow_print("She holds out a crumpled twenty. 'Up front. Don't want no trouble.'");
        print("1 = Take the $20 and let her in");
        print("2 = 'Not enough. $40.'");
        print("3 = 'Forget it.'");
        safe_input("> ").then(c => {
            if (c === "1") {
                player.money += 20;
                player.let_lisa_in = true;
                player.lisa_let_in_before = true;
                change_rep("Lisa", 5);
                slow_print("She goes in. Comes out. 'Thanks. We're square now.'");
            } else if (c === "2") {
                slow_print("'Forty? Steep, but fine.'");
                print("1 = '$40 or nothing.'");
                print("2 = 'Forget it then.'");
                safe_input("> ").then(n => {
                    if (n === "1" && player.money >= 40) {
                        player.money -= 40;
                        player.let_lisa_in = true;
                        player.lisa_let_in_before = true;
                        change_anger("Lisa", 12);
                        slow_print("She hands you forty dollars. 'There. Now we're square.'");
                    } else {
                        slow_print("'Whatever. I'll find somewhere else.' She walks off, more annoyed than furious.");
                        change_anger("Lisa", 15);
                    }
                });
            } else {
                slow_print("'Fine. I'll use the bush.'");
                change_anger("Lisa", 10);
            }
        });
    } else if (player.lisa_let_in_before) {
        slow_print("Lisa: 'I left my pack of cigarettes in your place. Can I grab it?'");
        print("1 = 'Sure.'");
        print("2 = 'You don't smoke.' (call her bluff)");
        print("3 = 'Five bucks to look.'");
        safe_input("> ").then(c => {
            if (c === "1") {
                player.let_lisa_in = true;
                slow_print("She comes out with a cigarette. 'Found it. Thanks, baby.'");
            } else if (c === "2") {
                slow_print("She laughs, caught. 'Fine, you got me. Worth a shot.' No real anger in it.");
                change_anger("Lisa", 8);
            } else {
                slow_print("'Five bucks? For a smoke?' She grins. 'You're an ass. Fine.'");
                print("1 = '$5 or nothing.'");
                print("2 = 'Fine, free. Just go.'");
                safe_input("> ").then(n => {
                    if (n === "1") {
                        slow_print("She pays. 'Happy?'");
                        player.money += 5;
                        player.let_lisa_in = true;
                        player.lisa_let_in_before = true;
                        change_rep("Lisa", -3);
                    } else {
                        player.let_lisa_in = true;
                        player.lisa_let_in_before = true;
                        change_rep("Lisa", 3);
                    }
                });
            }
        });
    } else {
        slow_print("Lisa: 'I forgot my purse. Can I use your bathroom?'");
        print("1 = Yes (free)");
        print("2 = 'What's in it for me?'");
        print("3 = No");
        safe_input("> ").then(c => {
            if (c === "1") {
                slow_print("You let her in.");
                player.let_lisa_in = true;
                player.lisa_let_in_before = true;
                change_rep("Lisa", 15);
            } else if (c === "2") {
                slow_print("Lisa narrows her eyes, more amused than annoyed. 'You want something? Fine.'");
                print("1 = 'Information. Who has stuff worth knowing about?'");
                print("2 = '$20.' (she stiffs you)");
                print("3 = 'How about some company?' (with edge)");
                safe_input("> ").then(n => {
                    if (n === "1") {
                        lisa_give_intel(player);
                    } else if (n === "2") {
                        slow_print("'Twenty? I got five. Take it or leave it.'");
                        print("1 = Take the $5 (she stiffs you $15)");
                        print("2 = 'Make it $10.'");
                        print("3 = 'Forget it.'");
                        safe_input("> ").then(n3 => {
                            if (n3 === "1") {
                                slow_print("She hands you a five. 'We're square.'");
                                player.money += 5;
                                player.let_lisa_in = true;
                                player.lisa_let_in_before = true;
                                player.lisa_debt += 15;
                                player.lisa_stiffed_me = true;
                            } else if (n3 === "2") {
                                slow_print("'Ten? Fine. Here.'");
                                player.money += 10;
                                player.let_lisa_in = true;
                                player.lisa_let_in_before = true;
                                player.lisa_debt += 10;
                                player.lisa_stiffed_me = true;
                            } else {
                                slow_print("'Suit yourself.'");
                                change_anger("Lisa", 8);
                            }
                        });
                    } else {
                        slow_print("Lisa's smile spreads. Slow, a little wicked, but playful more than predatory.");
                        slow_print("'Company? Honey, I'm not the one who needs it. But sure.'");
                        print("1 = 'Get inside before someone sees.'");
                        print("2 = 'I changed my mind.'");
                        print("3 = Pull away, keep it light");
                        safe_input("> ").then(n2 => {
                            if (n2 === "1") {
                                player.let_lisa_in = true;
                                player.lisa_let_in_before = true;
                                player.lisa_had_sex = true;
                                change_rep("Lisa", 10);
                                player.criminal_influence += 5;
                                slow_print("She goes in. You follow. The door closes.");
                                apply_intimacy_bonus(player, "sex");
                            } else if (n2 === "3") {
                                slow_print("You step back, easy about it. She shrugs, not offended. 'Your loss.'");
                                change_anger("Lisa", 5);
                            } else {
                                slow_print("She shrugs. 'Whatever. Bathroom's that way or not.'");
                                player.let_lisa_in = true;
                                player.lisa_let_in_before = true;
                            }
                        });
                    }
                });
            } else {
                slow_print("'Fine. I'll find a bush.'");
                change_anger("Lisa", 8);
            }
        });
    }
}

function encounter_tom(player) {
    print();
    print(RESIDENTS["Tom"].desc);
    slow_print("Tom's under the hood of a Bonneville. He looks up.");
    slow_print("'Hey. You the new guy?'");
    
    print("1 = 'Yeah. Just moved in.'");
    print("2 = 'Who wants to know?'");
    print("3 = Nod and keep walking");
    
    safe_input("> ").then(c => {
        if (c === "1") {
            slow_print("Tom wipes his hands. 'I'm Tom. Run a little side business.'");
            slow_print("'Everybody needs to make ends meet, right?'");
            slow_print("'You know how to check oil?'");
            print("1 = 'A little.'");
            print("2 = 'No.'");
            safe_input("> ").then(n => {
                if (n === "1") {
                    slow_print("'Good. Manual labor types are rare around here.'");
                    slow_print("He leans against the car. Studies you.");
                    slow_print("'You ever need work, I got work. Nothing heavy. Not yet, anyway.'");
                    print("1 = 'What kind of deliveries?'");
                    print("2 = 'I'm not looking for trouble.'");
                    print("3 = 'How much?'");
                    print("4 = 'I'll think about it.'");
                    safe_input("> ").then(k => {
                        if (k === "1") {
                            slow_print("'Packages. That's all you need to know for now.'");
                            slow_print("'You don't open them. You don't ask. You drop them, you get paid.'");
                            print("1 = 'Maybe. What's the pay?'");
                            print("2 = 'Sounds like a setup. I'm out.'");
                            print("3 = 'You sure you're not running a sting?'");
                            safe_input("> ").then(k2 => {
                                if (k2 === "1") {
                                    slow_print("'Fifty a drop. Sometimes a hundred. Depends on the run.'");
                                    slow_print("'Trust builds slow with me. But it builds. Come back tomorrow - small favor, see how it goes.'");
                                    player.tom_relationship = 1;
                                    player.tom_trust += 15;
                                    change_rep("Tom", 15);
                                } else if (k2 === "2") {
                                    slow_print("'Last guy who said that moved to Portland. Fast.'");
                                    change_rep("Tom", -5);
                                } else {
                                    slow_print("'You a cop?' He studies you. 'Better not be.'");
                                    change_rep("Tom", -3);
                                }
                            });
                        } else if (k === "2") {
                            slow_print("'Trouble finds people whether they look for it or not. Fair enough.'");
                            change_rep("Tom", 3);
                        } else if (k === "3") {
                            slow_print("'Depends. Twenty for a small drop. Two hundred for a long run, once you've earned it.'");
                            print("1 = 'I'll think about it.'");
                            print("2 = 'I'm in.'");
                            print("3 = 'Too good to be true. What's the catch?'");
                            safe_input("> ").then(k3 => {
                                if (k3 === "1") {
                                    slow_print("'Take your time. Come back when you're ready - I'll have something small.'");
                                    player.tom_relationship = 1;
                                    player.tom_trust += 8;
                                    change_rep("Tom", 8);
                                } else if (k3 === "2") {
                                    slow_print("'Smart. You'll do fine. Still gotta start you small, though.'");
                                    player.tom_relationship = 1;
                                    player.tom_trust += 20;
                                    change_rep("Tom", 20);
                                } else {
                                    slow_print("'The catch is: you don't talk. Ever. Come back tomorrow, we'll start easy.'");
                                    player.tom_relationship = 1;
                                    player.tom_trust += 10;
                                    change_rep("Tom", 5);
                                }
                            });
                        } else {
                            slow_print("'That's fine. Most people do. Come back when you've thought it over.'");
                            player.tom_relationship = 1;
                            player.tom_trust += 5;
                            change_rep("Tom", 5);
                        }
                    });
                } else {
                    slow_print("'Honest. I like that. You ever want to learn, I'm out here most days.'");
                    player.tom_relationship = 1;
                    player.tom_trust += 8;
                    change_rep("Tom", 8);
                }
            });
        } else if (c === "2") {
            slow_print("'A careful one. I respect that.'");
        } else {
            slow_print("Tom watches you walk. Files you away.");
        }
    });
}

// =============================================================
// LISA FUNCTIONS
// =============================================================

function lisa_give_intel(player) {
    player.lisa_gave_intel = true;
    slow_print("Lisa leans in. 'Frank's unit. Phyllis's. Gladys's. They've all got something worth taking.'");
    slow_print("'I'm not saying do anything with that. Just... good to know things.'");
    print("1 = 'Why are you telling me this?'");
    print("2 = 'What would you do with it?'");
    print("3 = 'I don't want to know this.'");
    print("4 = 'You know a buyer for any of it?'");
    
    safe_input("> ").then(choice => {
        if (choice === "1") {
            slow_print("'Because knowing things is currency. I collect it. Now you owe me a little.'");
            player.let_lisa_in = true;
            player.lisa_let_in_before = true;
            change_rep("Lisa", 6);
        } else if (choice === "2") {
            slow_print("'Phyllis, probably. She won't even remember someone was in there. But that's me. Not you.'");
            slow_print("'You want in on something, say so. I don't push.'");
            print("1 = 'I might. Tell me more.'");
            print("2 = 'Not my thing.'");
            safe_input("> ").then(n => {
                if (n === "1") {
                    print("1 = 'What kind of job?'");
                    print("2 = 'Forget it.'");
                    safe_input("> ").then(n2 => {
                        if (n2 === "1") {
                            lisa_steal_job(player);
                        } else {
                            slow_print("'Fair enough. Offer stands.'");
                        }
                    });
                } else {
                    slow_print("'Didn't figure you would. No judgment.'");
                    player.reputation += 3;
                }
            });
        } else if (choice === "3") {
            slow_print("'Okay. Forget I said it.' She actually seems to mean it - no push, no guilt trip.");
            player.reputation += 2;
        } else {
            slow_print("'I know a guy in St. Helens. Doesn't ask questions. But that's for later, if you want in.'");
            player.let_lisa_in = true;
            player.lisa_let_in_before = true;
            player.reputation += 4;
            player.criminal_influence += 3;
        }
    });
}

function lisa_steal_job(player) {
    slow_print("\n*** LISA'S JOB ***");
    slow_print("Lisa: 'Phyllis's unit. She leaves her door unlocked when she's confused.'");
    slow_print("'Her medicine cabinet. Percocet, oxy, the good stuff.'");
    slow_print("'I go in. You keep watch. Five minutes. We split the cash.'");
    print("1 = 'I'm in.'");
    print("2 = 'No, too risky.'");
    
    safe_input("> ").then(c => {
        if (c !== "1") {
            slow_print("'Your loss.'");
            return;
        }

        const risk = 30 - player.criminal_influence;
        const roll = Math.floor(Math.random() * 100) + 1;
        slow_print("\nYou keep watch. Lisa goes in.");
        slow_print("Your heart pounds. Footsteps in the hall. A door slams somewhere.");
        slow_print("Two minutes. Three. Four.");

        if (roll > risk) {
            slow_print("Lisa comes out. Grinning. 'Got it.'");
            slow_print("You walk away together. At the end of the block, she opens the bag.");
            slow_print("'Pills. Mostly Percocet. Good haul.'");
            slow_print("'I got a buyer. Hundred each.'");
            player.money += 100;
            player.criminal_influence += 15;
            player.soul -= 15;
            player.lisa_helped_steal = true;
            change_rep("Lisa", 20);
            slow_print("(You're now Lisa's partner in crime. More jobs will come.)");
        } else {
            if (Math.random() < 0.5) {
                slow_print("A cop car rounds the corner. Slow. Looking.");
                slow_print("You freeze. Lisa freezes.");
                slow_print("The cop drives past. Slowly. Too slowly.");
                slow_print("You both bolt. Lisa loses the bag. You get away.");
                player.criminal_influence += 5;
                player.soul -= 10;
                player.vitality = Math.max(0, player.vitality - 10);
            } else {
                slow_print("Phyllis comes out. Sees Lisa at her door.");
                slow_print("'LISA! What are you doing?'");
                slow_print("Lisa runs. You run. Phyllis screams.");
                slow_print("Management is called. Cops come.");
                player.reputation -= 20;
                player.legitimacy -= 15;
                player.criminal_influence += 10;
                player.soul -= 20;
                document_event(player, 20, "Suspected in Phyllis's burglary");
                change_anger("Phyllis", 80);
            }
        }
    });
}

function apply_intimacy_bonus(player, kind = "flirt") {
    if (kind === "flirt") {
        player.soul = Math.min(100, player.soul + 3);
        player.energy = Math.min(100, player.energy + 5);
        player.vitality = Math.min(100, player.vitality + 2);
    } else if (kind === "sex") {
        player.soul = Math.min(100, player.soul + 10);
        player.energy = Math.min(100, player.energy + 15);
        player.vitality = Math.min(100, player.vitality + 8);
        if (Math.random() < 0.12) {
            player.sti_risk = true;
        }
        if (Math.random() < 0.2 && !player.frank_knows_tina_player) {
            player.frank_pending_jealousy = true;
        }
    }
}

// =============================================================
// EVENING EVENTS
// =============================================================

function evening_event(player) {
    print();
    slow_print("- Night -");
    const events = [party_disruption, sick_cat, quiet_night];
    if (player.let_lisa_in) events.push(lisa_betrayal);
    const event = events[Math.floor(Math.random() * events.length)];
    event(player);
}

function party_disruption(player) {
    slow_print("A fight upstairs. Cops roll up.");
    print("1 = Stay inside  2 = Peek  3 = Go upstairs");
    
    safe_input("> ").then(c => {
        if (c === "1") return;
        else if (c === "2") {
            if (player.bodycam_owned) {
                document_event(player, 10, "Body cam: Tina's PD connection");
            }
        } else {
            player.soul -= 12;
            document_event(player, 10, "Violence in unit above");
        }
    });
}

function sick_cat(player) {
    slow_print("One of your cats is listless.");
    if (player.money >= 35) {
        safe_input("Vet $35? (y/n): ").then(ans => {
            if (ans.toLowerCase() === "y") {
                player.money -= 35;
                player.soul += 10;
            } else {
                player.soul -= 6;
            }
        });
    } else {
        player.soul -= 6;
    }
}

function quiet_night(player) {
    slow_print("Nothing happens. You sit with the cats.");
    player.soul += 4;
    player.energy = Math.min(100, player.energy + 15);
}

function lisa_betrayal(player) {
    slow_print("You come home. Door ajar.");
    const loss = Math.floor(Math.random() * (60 - 20 + 1)) + 20;
    player.money = Math.max(0, player.money - loss);
    slow_print(`$${loss.toFixed(2)} gone. Lisa's footprints in the dust.`);
    print("1 = Confront Lisa right now");
    print("2 = File a report");
    print("3 = Let it go");
    print("4 = Take it back by force");
    
    safe_input("> ").then(c => {
        if (c === "1") {
            slow_print("You knock. Lisa opens the door a crack, sees your face, doesn't bother lying well.");
            slow_print("'Okay, yeah. I took some. You weren't around and I needed it.'");
            slow_print("She's not screaming, not scared either - just matter-of-fact about it, like this is normal.");
            print("1 = 'You owe me.'");
            print("2 = 'That's messed up, Lisa.'");
            print("3 = Push past her and look for it yourself");
            print("4 = Leave");
            safe_input("> ").then(n => {
                if (n === "1") {
                    slow_print("'Yeah, probably. I'm good for it eventually.' She shrugs, unbothered but not defiant.");
                    player.lisa_debt += loss;
                    player.soul -= 3;
                    change_rep("Lisa", -10);
                } else if (n === "2") {
                    slow_print("'I know. I'm not gonna pretend it's not.' She actually looks a little ashamed.");
                    slow_print("'I'll pay it back when I can.'");
                    player.lisa_debt += loss;
                    change_rep("Lisa", -15);
                } else if (n === "3") {
                    slow_print("You step past her. She doesn't fight you on it - just watches, arms crossed.");
                    slow_print("You find about half of it, stuffed under a couch cushion.");
                    player.money += Math.floor(loss / 2);
                    player.soul -= 5;
                    change_rep("Lisa", -20);
                    change_anger("Lisa", 20);
                } else {
                    slow_print("You leave. The money's gone. So is some of your patience.");
                    player.soul -= 3;
                }
            });
        } else if (c === "2") {
            slow_print("You call the non-emergency line.");
            slow_print("'We'll send someone by.' They never do.");
            player.soul += 2;
            document_event(player, 10, "Police welfare check requested");
        } else if (c === "3") {
            slow_print("You sit on the floor. The cats come to you.");
            slow_print("Money comes and goes. You stay.");
            player.soul += 5;
            player.legitimacy += 2;
        } else if (c === "4" && player.criminal_influence >= 20) {
            slow_print("You go back to Lisa's. She opens the door, already resigned to it.");
            slow_print("'Fine, take it back, Jesus.' She hands over what's left rather than make a scene.");
            player.money += Math.floor(loss / 2);
            player.soul -= 8;
            change_anger("Lisa", 25);
        } else {
            slow_print("You do nothing. The money's gone.");
        }
    });
}

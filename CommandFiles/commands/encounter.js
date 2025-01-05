import { UNIRedux } from "../modules/unisym.js";

export const meta = {
  name: "encounter",
  description: "Pets Encounter",
  otherNames: ["enc"],
  version: "1.0.2",
  usage: "{prefix}{name}",
  category: "Spinoff Games",
  author: "Liane Cagara",
  permissions: [0],
  noPrefix: "both",
  waitingTime: 1,
  // botAdmin: true,
  requirement: "2.5.0",
  icon: "🔱",
};
const meow = {
  wildName: "Meow",
  wildIcon: "🦖",
  wildType: "dinosaur",
  HP: 400,
  ATK: 25,
  DF: 15,
  fakeHP: 800,
  fakeATK: 50,
  fakeDEF: 30,
  flavor: {
    check:
      "A Meow is a type of dinosaur that roams the plains. Careful, it might pounce!",
    encounter: ["Meow has appeared with a mighty roar!"],
    neutral: [
      "Meow seems uninterested in your presence.",
      "The dinosaur is eyeing you cautiously.",
      "Meow is basking in the sun, ignoring your approach.",
      "The ground trembles slightly as Meow shifts its weight.",
    ],
    lowHP: [
      "Meow's movements are slowing down.",
      "It looks like Meow is getting tired.",
      "The dinosaur seems to be struggling.",
    ],
    run: ["Meow has decided to retreat back into the wilderness."],
    satisfied: [
      "Meow has acknowledged your strength and returns to its habitat peacefully.",
    ],
  },
  dialogues: {
    neutral: [
      "Rrraaawwrrr!",
      "Meow.. meow..",
      "I am the ruler of this land!",
      "Roaaar!",
      "What are you looking at, puny animals?",
      "I smell fear in the air...",
      "Don't make sudden moves around me!",
    ],
    satisfied: ["Purrfect!", "You're not so bad after all."],
    lowHP: [
      "I'm not done yet!",
      "You'll regret this...",
      "This won't be the last you see of me!",
    ],
  },
  acts: {
    Check: {},
    Pet: {
      flavor: `You told {name} to pet Meow gently.`,
      pet: ["[leader]"],
      mercyPts: 10,
      petLine: ["There, there, you're a good dino."],
      response: ["Meow seems to enjoy the petting.", "Purrrr..."],
    },
    Feed: {
      flavor: `You offered some food to Meow.`,
      pet: ["[slot:1]"],
      petLine: ["Here, have some food!"],
      mercyPts: 20,
      response: ["Meow devours the food happily.", "Yum!"],
    },
    Play: {
      flavor: `You played fetch with Meow.`,
      pet: ["[slot:2]"],
      petLine: ["Go get the stick!"],
      mercyPts: 15,
      response: ["Meow chases after the stick excitedly.", "Wheee!"],
    },
    Cuddle: {
      flavor: `You gave Meow a warm cuddle.`,
      pet: ["cat"],
      petLine: ["Let's cuddle!"],
      mercyPts: 25,
      response: ["Meow purrs contentedly.", "This is nice..."],
    },
  },
  attacks: {
    pounce: "Ferocious Pounce α",
    roar: "Mighty Roar α",
    swipe: "Claw Swipe α",
    tailwhip: "Tail Whip α",
    stomp: "Ground Stomp α",
    leap: "Ferocious Pounce β",
    bellow: "Mighty Roar β",
    slash: "Claw Swipe β",
    swish: "Tail Whip β",
    crush: "Ground Stomp β",
  },
  goldFled: 200,
  goldSpared: 400,
};
const encounters = {
  greatSeptimus: {
    wildName: "Harmonious Choir: The Great Septimus",
    wildIcon: "🎶",
    wildType: "Divine Entity",
    HP: 6000,
    ATK: 45,
    DF: 5,
    fakeHP: 25000,
    fakeATK: 230,
    fakeDEF: 180,
    winDias: 3,
    flavor: {
      check: "A symphony of ethereal notes fills the air as The Great Septimus makes its presence known. The harmony beckons you to face your destiny.",
      encounter: ["The Harmonious Choir's song swells as The Great Septimus steps forth from the void, its divine presence overwhelming the battlefield."],
      neutral: [
        "The Great Septimus stands motionless, its eyes glowing with the power of an ancient melody. The song reverberates through your very soul.",
        "A wave of divine sound echoes as The Great Septimus raises its hands, signaling the beginning of the trial.",
        "The celestial symphony swirls around you, and The Great Septimus is its unyielding conductor.",
        "You can feel the rhythm of the universe itself. The Great Septimus commands the flow of time with every note played.",
        "Every step The Great Septimus takes is perfectly in tune with the song of the cosmos.",
        "The Great Septimus' presence radiates an overwhelming force, the music of the heavens swirling in the air.",
        "The melody of fate is unavoidable—do you have the strength to endure?"
      ],
      lowHP: [
        "The celestial song falters as the Great Septimus' power begins to wane, but its will remains unbroken.",
        "The harmony of the Great Septimus is weakening, but the final note has not yet been sung.",
        "The music fades into silence as The Great Septimus is pushed to its limits."
      ],
      run: [
        "The Great Septimus' celestial presence begins to fade, its song falling silent as it retreats into the ether."
      ],
      satisfied: [
        "The Great Septimus acknowledges your strength, its melody calming as it returns to the heavens, leaving a lingering sense of accomplishment."
      ],
    },
    dialogues: {
      neutral: [
        "I am the harmony that binds the cosmos.",
        "The song of fate is eternal. You cannot escape it.",
        "The melody of the universe guides my every action.",
        "Can you hear the music? It sings of your destiny.",
        "A single note can change the course of everything.",
        "You are but a fleeting echo in this divine symphony.",
        "The rhythm of the stars cannot be defied."
      ],
      satisfied: [
        "Your strength resonates with the harmony of the cosmos. You have earned my respect.",
        "You have proven yourself worthy of the song of the heavens."
      ],
      lowHP: [
        "Do not mistake this moment for weakness. The music still plays.",
        "The song may fade, but I will rise again.",
        "My power is everlasting—this is not the end."
      ],
    },
    acts: {
      Gaze: {
        flavor: `You instructed the leader to meet the Great Septimus' gaze, its divine eyes glowing with the power of eternal music.`,
        pet: ["[leader]"],
        mercyPts: 20,
      },
      Resonance: {
        flavor: `You asked {name} to resonate with the divine melody, disrupting the Great Septimus’ control over the harmony.`,
        pet: ["[slot:1]"],
        petLine: ["Let the music echo!", "Resonance amplified!"],
        response: [
          "You think you can match the song of eternity?",
          "This is not a battle you can win with mere noise.",
          "The symphony is beyond your reach."
        ],
        mercyPts: 30,
      },
      Crescendo: {
        flavor: `You commanded {name} to unleash a crescendo of energy, forcing the Great Septimus into a final confrontation of power and will.`,
        pet: ["[slot:1]", "[slot:2]"],
        petLine: ["The crescendo builds!", "Let the heavens sing!"],
        mercyPts: 40,
        response: [
          "The crescendo is nothing compared to the divine song I lead.",
          "You cannot overpower the music of the universe.",
          "This is just a fleeting moment in an eternal symphony."
        ],
      },
      Dissonance: {
        flavor: `You told {pet} to disrupt the harmony with a sudden dissonance, attempting to fracture the Great Septimus' control over the celestial song.`,
        pet: ["[slot:2]"],
        petLine: ["Create the dissonance!", "Break the harmony!"],
        mercyPts: 35,
        response: [
          "Dissonance cannot challenge the divine symphony.",
          "Your noise is but a shadow of the true song.",
          "The song will always find its way back to harmony."
        ],
      },
    },
    attacks: {
      harmony: "Harmonious Resonance Ω",
      symphony: "Celestial Symphony γ",
      crescendo: "Crescendo of Eternity β",
      dissonance: "Disruptive Dissonance Ω",
      chorus: "Chorus of the Heavens α",
      aria: "Aria of Ascension π",
      silence: "Silence of the Cosmos γ",
      rupture: "Rupture of Time π",
      echo: "Echo of Infinity α",
      chord: "Divine Chord β",
      refrain: "Refrain of Eternity Ω",
      tone: "Sacred Tone α",
      pulse: "Pulse of Creation β",
      beat: "Celestial Beat γ",
    },
    goldFled: 15000,
    goldSpared: 75000,
  },
  
  meow,
  flier: {
    wildName: "Flier 𝔼𝕏",
    wildIcon: "🦅",
    wildType: "eagle",
    HP: 500,
    ATK: 30,
    DF: 10,
    fakeHP: 1000,
    fakeATK: 45,
    fakeDEF: 100,
    flavor: {
      check:
        "A flier is a type of eagle that can be found in the forest. Do you really believe on those stats?",
      encounter: ["Flier 𝔼𝕏 has appeared from the sky!"],
      neutral: [
        "Looks like the bird doesn't even care to what's happening around it.",
        "𝔼𝕏 stands for EXPLORE!",
        "Flier 𝔼𝕏 is preparing a swift attack.",
        "What would an eagle might do? Call their parents?",
        "Flier 𝔼𝕏 is flying, you and your pets already know that, how about lying..?",
        "Fly + Lier + Explorer = Flier 𝔼𝕏",
        "an 𝔼𝕏 without 𝔼 is actually Twitter, obviously fitting because flier is a bird.",
      ],
      lowHP: [
        "Looks like the bird is shakin' it up.",
        "Flier 𝔼𝕏 has low HP.",
        "This is what birds get for allegedly lying about it's stats",
      ],
      run: ["Flier 𝔼𝕏 has fled away and your pets are too slow to catch up."],
      satisfied: [
        "Flier 𝔼𝕏 was convinced and it is ready to return to its regular life.",
      ],
    },
    dialogues: {
      neutral: [
        "Lmao who do you think I am?",
        "Fly fly..",
        "I'm the best flier around!",
        "Bahduiwkemfoxosjsndn",
        "Payku.",
        "Who wants some 10000000$?",
        "I have 10 HighRoll pass in my inventory.",
        "I would offer you some cash, but I'm not a cashier.",
        "+pantita",
      ],
      satisfied: ["Happy ^w^", "< 3"],
      lowHP: [
        "I'm dying.. Oh not yet.",
        "I have a backup plan bois! I will use my Cosmic Crunch 𝔼𝕏!",
        "My HP is high enough to keep me alive.",
        "I'm not shaking.",
      ],
    },
    acts: {
      Check: {},
      Smile: {
        flavor: `You told the leader to smile, Flier 𝔼𝕏 smiles back.`,
        pet: ["[leader]"],
        mercyPts: 12,
      },
      Convince: {
        flavor: `You told {name} to convince Flier 𝔼𝕏 that we are not hating him and we're just looking for friends.`,
        pet: ["[slot:1]"],
        petLine: [
          "We're not hating you, we're just looking for friends ^^",
          "I could give you a hug if you want! Just befriend us! ^^",
        ],
        response: [
          "Nah I'm good.",
          "...",
          "I don't need friends, I already have 🔥 **EagleTreats** 𝔼𝕏",
        ],
        mercyPts: 25,
      },
      Warmify: {
        flavor: `You told your dragon {name} to blow a little amount of fire enough to give flier a little warmth.`,
        pet: ["dragon"],
        petLine: ["Here, take this. It's a little bit of warmth. ^^"],
        mercyPts: 45,
        response: [
          "Bro's wasting some fire energy 💀",
          "What I'm eating is already fire, I don't need that.",
          "..",
        ],
      },
      Cheerbark: {
        flavor: `You told your dog {name} to bark a little bit to cheer him up.`,
        pet: ["dog"],
        petLine: ["Arf Arf! Do you like it?"],
        mercyPts: 40,
        response: ["Bruh.", ".....", "No"],
      },
    },
    attacks: {
      crouch: "Air Attack γ",
      sit: "Ground Shake β",
      slowdown: "Never a Swift Attack γ",
      fastrun: "Never a Swift Attack Ω",
      jump: "Ground Attack α",
      spin: "Air Typhoon γ",
      jumphigh: "Air Attack Ω",
      worship: "Worship Me α",
      ignore: "Worship Me π",
    },
    goldFled: 800,
    goldSpared: 1200,
  },
  stardust: {
    wildName: "Stardust 𝕏",
    wildIcon: "🐉",
    wildType: "dragon",
    HP: 2750,
    ATK: 45,
    DF: 45,
    fakeHP: 1500,
    fakeATK: 60,
    fakeDEF: 150,
    flavor: {
      check:
        "Stardust 𝕏 is a mystical dragon with a deceptive aura. Are you sure you're seeing its real stats?",
      encounter: [
        "Stardust 𝕏 descends from the cosmos with a shadowy presence!",
      ],
      neutral: [
        "Stardust 𝕏 seems to be plotting something quietly.",
        "𝕏 marks the spot where destruction begins.",
        "The air around Stardust 𝕏 feels heavy with tension.",
        "What could a dragon like this be hiding?",
        "Stardust 𝕏 silently observes, waiting for the right moment.",
        "Dragons are symbols of power... but what does this one represent?",
        "Is Stardust 𝕏 even from this world? It feels like it doesn't belong here.",
      ],
      lowHP: [
        "Stardust 𝕏's cosmic energy is flickering.",
        "The dragon's celestial glow is dimming.",
        "This creature was never meant to be defeated easily.",
      ],
      run: [
        "Stardust 𝕏 vanishes into thin air, leaving only a trail of stardust.",
      ],
      satisfied: [
        "Stardust 𝕏 seems to acknowledge your strength and retreats into the cosmos peacefully.",
      ],
    },
    dialogues: {
      neutral: [
        "You can't comprehend the power of the stars.",
        "My claws tear through the fabric of reality.",
        "I'm no mere beast, I'm a force of nature.",
        "Don't think you can escape my shadow.",
        "I am Stardust, born from the collision of worlds.",
        "Your fate is written in the stars... and it's grim.",
        "Can you survive a cosmic storm?",
        "The void calls, and I will answer.",
        "Do you hear the hum of the universe? It's my battle cry.",
      ],
      satisfied: ["Your strength is admirable.", "You live... for now."],
      lowHP: [
        "I am far from finished...",
        "You may weaken me, but I rise like the stars.",
        "My energy wanes, but my spirit is eternal.",
        "A dragon never falls easily.",
      ],
    },
    acts: {
      Check: {},
      Intimidate: {
        flavor: `You told {name} to try to intimidate Stardust 𝕏.`,
        pet: ["[leader]"],
        mercyPts: 15,
        response: [
          "You think you can intimidate a dragon?",
          "Hah, mere mortals.",
          "Your threats are as meaningless as dust.",
        ],
      },
      Compliment: {
        flavor: `You told {name} to compliment Stardust 𝕏 on its magnificent scales.`,
        pet: ["[slot:1]"],
        petLine: [
          "Your scales are shining like the stars! You look amazing!",
          "You're one of the most majestic dragons I've ever seen!",
        ],
        response: [
          "Flattery won't save you, but I appreciate the gesture.",
          "Hmph, such words are beneath me.",
          "Keep talking, mortal, it amuses me.",
        ],
        mercyPts: 30,
      },
      StardustOffer: {
        flavor: `You told your dragon {name} to offer Stardust 𝕏 some cosmic energy.`,
        pet: ["dragon"],
        petLine: [
          "Here, take some of my energy. It will help you shine even brighter.",
        ],
        mercyPts: 50,
        response: [
          "Cosmic energy, huh? Intriguing...",
          "I'll take it, but don't think this makes us allies.",
          "Your energy is nothing compared to mine.",
        ],
      },
      Song: {
        flavor: `You told your pet {name} to sing a soothing melody to calm Stardust 𝕏.`,
        pet: ["phoenix"],
        petLine: ["Let my song ease your restless soul."],
        mercyPts: 40,
        response: [
          "That melody... it's calming.",
          "A lullaby for the end of days?",
          "Hmm...",
        ],
      },
    },
    attacks: {
      crouch: "Shadow Strike γ",
      sit: "Celestial Crush β",
      slowdown: "Astral Blaze γ",
      fastrun: "Astral Blaze Ω",
      jump: "Meteor Dive α",
      spin: "Cosmic Whirlwind γ",
      jumphigh: "Meteor Dive Ω",
      worship: "Stardust Wave α",
      ignore: "Eternal Silence π",
    },
    goldFled: 8000,
    goldSpared: 12000,
  },
  titan: {
    wildName: "Titan of Time 𝕋𝕀",
    wildIcon: "⌛",
    wildType: "colossal",
    HP: 5000,
    ATK: 40,
    DF: -15,
    fakeHP: 20000,
    fakeATK: 250,
    fakeDEF: 200,
    winDias: 1,
    flavor: {
      check:
        "A titan that controls time itself. Are you really prepared to face such a beast?",
      encounter: ["The Titan of Time 𝕋𝕀 emerges from the temporal rift!"],
      neutral: [
        "The Titan stands still, as if contemplating the very fabric of existence.",
        "𝕋𝕀 stands for TIME!",
        "The Titan of Time 𝕋𝕀 is observing the flow of time around you.",
        "Do you think you can manipulate time better than the Titan?",
        "Time flies, and so does the Titan of Time 𝕋𝕀.",
        "Tick-tock, says the Titan, your time is running out.",
        "Without time, nothing would change. Without change, there's no progress.",
      ],
      lowHP: [
        "The Titan is losing its grip on time.",
        "Titan of Time 𝕋𝕀 has low HP.",
        "Time's up for the Titan's lies about its stats.",
      ],
      run: [
        "The Titan of Time 𝕋𝕀 vanishes into the rift, escaping your grasp.",
      ],
      satisfied: [
        "The Titan of Time 𝕋𝕀 acknowledges your strength and returns to its temporal domain.",
      ],
    },
    dialogues: {
      neutral: [
        "Time waits for no one.",
        "I control the very essence of existence.",
        "Tick-tock, your end is nigh.",
        "You think you can beat time?",
        "I am the beginning and the end.",
        "All things must pass.",
        "Tick-tock, tick-tock...",
        "Time is a flat circle.",
        "I see all your possible futures.",
      ],
      satisfied: ["You have earned my respect.", "You defy time itself."],
      lowHP: [
        "I am not yet defeated.",
        "Time will heal me.",
        "You cannot escape time.",
        "I will rise again.",
      ],
    },
    acts: {
      Check: {},
      Freeze: {
        flavor: `You told the leader to freeze the Titan of Time 𝕋𝕀 momentarily.`,
        pet: ["[leader]"],
        mercyPts: 15,
      },
      Rewind: {
        flavor: `You asked {name} to rewind time to confuse the Titan.`,
        pet: ["[slot:1]"],
        petLine: ["Let's rewind and try again!", "Time rewind!"],
        response: [
          "You think you can outdo me?",
          "Foolish attempt.",
          "Time is on my side.",
        ],
        mercyPts: 20,
      },
      Accelerate: {
        flavor: `You told your pet {name} to accelerate time around the Titan.`,
        pet: ["[slot:1]", "[slot:2]"],
        petLine: ["Speed it up!"],
        mercyPts: 30,
        response: [
          "I control time, not you.",
          "Pathetic.",
          "Time bends to my will.",
        ],
      },
      Pause: {
        flavor: `You told your {pet} to pause time around the Titan to slow it down.`,
        pet: ["[slot:2]"],
        petLine: ["Pause!"],
        mercyPts: 25,
        response: [
          "You cannot stop time.",
          "Nice try.",
          "Time flows endlessly.",
        ],
      },
    },
    attacks: {
      timestop: "Temporal Freeze Ω",
      freeze: "Temporal Freeze γ",
      rewind: "Temporal Rewind β",
      revert: "Temporal Rewind Ω",
      accelerate: "Time Rush π",
      rush: "Time Rush α",
      slowdown: "Time Lapse γ",
      delay: "Time Lapse π",
      collapse: "Temporal Collapse α",
      implode: "Temporal Collapse β",
      warp: "Time Warp β",
      twist: "Time Warp γ",
      distort: "Temporal Distortion Ω",
      alter: "Temporal Distortion π",
      sync: "Chrono Sync α",
      align: "Chrono Sync Ω",
      pulse: "Time Pulse β",
      beat: "Time Pulse γ",
    },
    goldFled: 12000,
    goldSpared: 50000,
  },

  /*meow: {
    wildName: "Meow",
    wildIcon: "🦖",
    wildType: "dinosaur",
    HP: 400,
    ATK: 25,
    DF: 15,
    flavor: {
      check:
        "A Meow is a type of dinosaur that roams the plains. Careful, it might pounce!",
      encounter: ["Meow has appeared with a mighty roar!"],
      neutral: [
        "Meow seems uninterested in your presence.",
        "The dinosaur is eyeing you cautiously.",
        "Meow is basking in the sun, ignoring your approach.",
        "The ground trembles slightly as Meow shifts its weight.",
      ],
      lowHP: [
        "Meow's movements are slowing down.",
        "It looks like Meow is getting tired.",
        "The dinosaur seems to be struggling.",
      ],
      run: ["Meow has decided to retreat back into the wilderness."],
      satisfied: [
        "Meow has acknowledged your strength and returns to its habitat peacefully.",
      ],
    },
    dialogues: {
      neutral: [
        "Rrraaawwrrr!",
        "Meow.. meow..",
        "I am the ruler of this land!",
        "Roaaar!",
        "What are you looking at, puny animals?",
        "I smell fear in the air...",
        "Don't make sudden moves around me!",
      ],
      satisfied: ["Purrfect!", "You're not so bad after all."],
      lowHP: [
        "I'm not done yet!",
        "You'll regret this...",
        "This won't be the last you see of me!",
      ],
    },
    goldFled: 1000,
    goldSpared: 1200,
  },*/
};

const petSchema = {
  fight: false,
  //item: true,
  item: false,
  magic: false,
  mercy: true,
  defend: true,
  extra: {
    Bash: "🥊",
    Act: "🔈",
    LifeUp: "✨",
    HexSmash: "💥",
  },
};
const leaderSchema = {
  fight: false,
  //item: true,
  mercy: true,
  magic: false,
  item: false,
  defend: true,
  extra: {
    Bash: "🥊",
    Act: "🔊",
    LifeUp: "✨",
    HexSmash: "💥",
  },
};

export async function entry({
  input,
  output,
  Shop,
  args,
  money,
  PetPlayer,
  GearsManage,
  Inventory,
  WildPlayer,
}) {
  function getInfos(data) {
    const gearsManage = new GearsManage(data.gearsData);
    const petsData = new Inventory(data.petsData);
    const playersMap = new Map();
    for (const pet of petsData) {
      const gear = gearsManage.getGearData(pet.key);
      const player = new PetPlayer(pet, gear);
      playersMap.set(pet.key, player);
    }
    return {
      gearsManage,
      petsData,
      playersMap,
    };
  }
  const encounter =
    encounters[args[0]] ??
    Object.values(encounters)[
      Math.floor(Math.random() * Object.values(encounters).length)
    ];
  const i = await output.reply(`🔎 **Random Encounter**:
Your opponent is ${encounter.wildIcon} ${encounter.wildName}

Please **reply** with the names of maximum of **3 pets**, separated by |, you cannot use same type of pet twice.
**Example:** doggie | meowy | cobra

The first **pet** will become the leader, which who can use the 🔊 **Act**`);
  function handleEnd(id, { ...extra } = {}) {
    input.setReply(id, {
      key: "encounter",
      callback: handleGame,
      ...extra,
    });
  }
  handleEnd(i.messageID, {
    author: input.senderID,
    type: "start",
  });
  let isDefeat = false;
  async function handleGame(ctx) {
    if (isDefeat) {
      return;
    }
    const { input, output, repObj, money, detectID } = ctx;
    /*output.prepend = `⚠️ **Warn:** This is for testing only, this game might behave weird!\n\n`;*/
    output.prepend = `***Pet Encounter 🔱***\n${UNIRedux.standardLine}\n`;
    function handleEnd(id, { ...extra } = {}) {
      input.delReply(detectID);
      input.setReply(id, {
        key: "encounter",
        callback: handleGame,
        ...extra,
      });
    }

    /* const turnsCut = input.splitBody("|");
    if (turnsCut.length > 1) {
      output.reply = async () => i;
      for (const turn of turnsCut) {
        input.body = turn;
        input.words = [turn];
        input.arguments = [turn];
        input.splitBody = () => [turn];
        await handleGame({ ...ctx });
      }
      return;
    }*/
    const userData = await money.get(input.senderID);
    const { gearsManage, petsData, playersMap } = getInfos(userData);
    let turnOption = String(input.words[0]).toLowerCase();
    const { type, author } = repObj;
    if (author !== input.senderID) {
      return output.reply(
        `❌|  You are **not** the one who started this **game**.`
      );
    }
    let pets = [];
    if (type === "start") {
      if (petsData.getAll().length < 3) {
        return output.reply(
          `❌ | Oops, you need at least 3 pets to start the game. Try **uncaging** ${
            3 - petsData.getAll().length
          } more pet(s).`
        );
      }
      const petsName = input.splitBody("|");
      if (petsName.length < 3) {
        return output.reply(
          `❌ | Please go back and specify **exactly 3** pet **names** split by |`
        );
      }
      if (petsName.length > 3) {
        return output.reply(`❌ | Too much pets!`);
      }
      for (const petName of petsName) {
        const original = petsData
          .getAll()
          .find(
            (i) =>
              String(i?.name).toLowerCase().trim() ===
              String(petName).toLowerCase().trim()
          );
        if (!original) {
          return output.reply(
            `❌ | Pet "${petName}" doesn't exists in your pet list.`
          );
        }
        const pet = playersMap.get(original.key);
        pets.push(pet);
      }
      repObj.pets = pets;
    } else if (Array.isArray(repObj.pets)) {
      pets = repObj.pets;
    } else {
      return output.error(
        new Error("Pets data are missing while the state is not 'start'")
      );
    }
    const opponent =
      repObj.opponent ??
      new WildPlayer(
        {
          ...encounter,
          HP:
            encounter.HP +
            Math.round(pets.reduce((acc, pet) => acc + pet.ATK * 2.1, 0)),
          ATK:
            encounter.ATK +
            Math.round(pets.reduce((acc, pet) => acc + pet.DF / 10, 0)),
          goldFled:
            encounter.goldFled +
            Math.round(pets.reduce((acc, pet) => acc + pet.ATK * 20, 0)),
          goldSpared:
            encounter.goldSpared +
            Math.floor(pets.reduce((acc, pet) => acc + pet.ATK * 50, 0)),
        },
        [...pets]
      );
    repObj.index ??= 0;
    if (pets[repObj.index]?.isDown()) {
      repObj.index++;
    }
    if (pets[repObj.index]?.isDown()) {
      repObj.index++;
    }
    if (pets[repObj.index]?.isDown()) {
      repObj.index++;
    }

    let isEnemyTurn = repObj.index > 2;
    if (isEnemyTurn) {
    }
    repObj.turnCache ??= [];
    repObj.prevTurns ??= [];

    repObj.opponent = opponent;
    repObj.flavorCache ??=
      type === "start"
        ? opponent.flavor.encounter
        : opponent.getNeutralFlavor();
    let isLeader = repObj.index === 0;
    function getCacheIcon(turn) {
      if (!turn) {
        return null;
      }
      const mapping = {
        fight: "⚔️",
        act: "🔊",
        mercy: "❌",
        defend: "🛡",
        heal: "✨",
      };
      return mapping[turn] ?? null;
    }
    function listPetsNormal({ ...options } = {}) {
      let result = `* ${repObj.flavorCache}\n\n`;
      for (let i = 0; i < pets.length; i++) {
        const pet = pets[i];
        const schema = i === 0 ? leaderSchema : petSchema;
        result += `${pet.getPlayerUI({
          selectionOptions: schema,
          turn: repObj.index === i,
          icon: getCacheIcon(repObj.turnCache[i]),
        })}\n\n`;
      }
      result += `***Reply with the option. (word only)***, you can also use **all** as second argument, you can also use | to split the options.`;
      return result;
    }
    async function handleWin(isGood, flavor) {
      input.delReply(detectID);
      let dialogue;
      let multiplier = 1;
      const alivePets = pets.filter((i) => !i.isDown());
      multiplier = alivePets.length / 3;
      let mercyMode = opponent.HP >= opponent.maxHP && isGood;
      let pts = Math.round((opponent.goldFled / 15) * multiplier);
      if (mercyMode) {
        pts = Math.round(pts * 1.7);
      }
      if (isGood) {
        dialogue = `${opponent.wildIcon} **${opponent.wildName}** has been${
          mercyMode ? " kindly" : ""
        } spared by your party.`;
      } else {
        dialogue =
          opponent.flavor.run?.[0] ??
          `${opponent.wildIcon} **${opponent.wildName}** ran away.`;
      }

      let newMoney =
        Number(Math.round(opponent.goldFled ?? 0) * multiplier) +
        (userData.money ?? 0);
      const collectibles = new ctx.Collectibles(userData.collectibles ?? []);
      if (collectibles.has("gems")) {
        collectibles.raise("gems", opponent.winDias ?? 0);
      }
      await money.set(input.senderID, {
        money: newMoney,
        collectibles: Array.from(collectibles),
        battlePoints: (userData.battlePoints ?? 0) + pts,
      });
      await output.reply(
        (flavor ?? "").trim() +
          `\n\n` +
          `* ${dialogue}\n\n${
            isGood ? opponent.spareText() : opponent.fledText()
          }\nObtained **${pts} 💷 Battle Points!**\n${
            opponent.winDias && collectibles.has("gems")
              ? `You also won **${opponent.winDias}** 💎!`
              : ""
          }`
      );
    }
    async function enemyAttack({ flavorText, damage = null, newResponse }) {
      if (opponent.isDown()) {
        return handleWin(false, flavorText);
      }
      let i = {};
      const { text, answer, attackName } = opponent.getAttackMenu();
      if (
        (opponent.HP < opponent.maxHP * 0.5 && Math.random() < 0.3) ||
        Math.random() < 0.1
      ) {
        let healing = Math.min(
          pets.reduce((acc, pet) => pet.calculateAttack(opponent.DF - 2), 0),
          opponent.maxHP - opponent.HP
        );
        healing = Math.round(healing * 2.5);
        opponent.HP += Math.min(opponent.maxHP, healing);
        repObj.attack = {
          text: ``,
          healing,
          turnType: "heal",
        };
        i = await output.reply(
          `${flavorText}\n* ${opponent.wildIcon} **${
            opponent.wildName
          }** cast ✨ **Lifeup** α! Recovered **${healing}** HP!\n\n${opponent.getPlayerUI(
            { upperPop: `+${healing}HP` }
          )}\n\n***Reply anything to proceed.***`
        );
      } else {
        repObj.attack = {
          text,
          answer,
          attackName,
          turnType: "attack",
        };
        i = await output.reply(
          `${flavorText}\n${opponent.getPlayerUI({
            upperPop: damage
              ? `-${Math.round((damage / opponent.maxHP) * 100)}% HP`
              : null,
          })}\n\n${opponent.wildIcon} **${opponent.wildName}**: \n${
            newResponse ?? opponent.getNeutralDialogue()
          }\n\n${text}\n\n***Reply with the option. (word only)***`
        );
      }
      repObj.index = 0;
      repObj.flavorCache = opponent.getNeutralFlavor();
      handleEnd(i.messageID, {
        ...repObj,
        type: "playerTurn",
        index: 0,
        turnCache: [],
        opponent,
      });
    }
    if (type !== "start" && !repObj.attack) {
      if (input.words[1] === "all") {
        repObj.turnCache = [
          pets[0].isDown() ? null : turnOption,
          pets[1].isDown() ? null : turnOption,
          pets[2].isDown() ? null : turnOption,
        ];
        repObj.index = 3;
        isEnemyTurn = true;
      } else {
        /*if (turnOption === "act" && isLeader) {
          
        }*/
        const [a, b, c] = input.splitBody("|");
        if (a && b) {
          repObj.turnCache = [a, b, c]
            .filter(Boolean)
            .map((i) => i.toLowerCase());
          repObj.index = repObj.turnCache.length;
          if (repObj.index === 3) {
            isEnemyTurn = true;
          }
        } else {
          repObj.turnCache.push(turnOption);
        }
      }
    }
    function handleDefeat() {
      isDefeat = true;
      input.delReply(detectID);
      return output.reply(
        `❌ **Game Over**\n\n* All your pet members have been fainted. But that's not the end! Stay determined. You can always **try** again.`
      );
    }
    if (pets.every((i) => i.isDown())) {
      return handleDefeat();
    }

    if (!isEnemyTurn) {
      let extraText = "";
      const { turnType } = repObj.attack ?? {};
      if (turnType === "attack") {
        for (const pet of pets) {
          if (pet.isDown()) {
            const heal = pet.getDownHeal();
            pet.HP += heal;
            extraText += `* ${pet.petIcon} **${pet.petName}** has regenerated ${heal} HP.\n\n`;
          }
        }

        const { answer, attackName } = repObj.attack;
        let isHurt = false;
        if (turnOption !== answer) {
          isHurt = true;
        }
        if (isHurt) {
          extraText += `* You chose **${turnOption}**, but it was not effective against **${attackName}**\n\n`;
          const isAllParty = Math.random() < 0.4;
          if (isAllParty) {
            const members = pets.filter((i) => !i.isDown());
            if (members.length === 0) {
              return handleDefeat();
            }
            for (const randomMember of members) {
              const damage = Math.round(
                randomMember.calculateTakenDamage(opponent.ATK) / members.length
              );

              randomMember.HP -= Math.max(damage, 1);
              if (randomMember.HP < 1) {
                randomMember.HP = Math.round(randomMember.maxHP * 0.5) * -1;
              }
              extraText += `* ${randomMember.petIcon} **${
                randomMember.petName
              }** ${
                randomMember.isDown()
                  ? `is down.`
                  : `has taken **${damage}** damage.`
              }\n`;
            }
            if (pets[0].isDown() && pets[1].isDown() && pets[2].isDown()) {
              return handleDefeat();
            }
          } else {
            idk: {
              const availablePets = pets.filter((i) => !i.isDown());
              const lowestPet = availablePets.toSorted(
                (a, b) => a.HP - b.HP
              )[0];
              let randomMember =
                availablePets[Math.floor(Math.random() * availablePets.length)];
              if (lowestPet === randomMember) {
                randomMember =
                  availablePets[
                    Math.floor(Math.random() * availablePets.length)
                  ];
              }
              if (!randomMember) {
                //return handleDefeat();
                break idk;
              }

              const damage = randomMember.calculateTakenDamage(opponent.ATK);
              randomMember.HP -= Math.max(damage, 1);
              if (randomMember.HP < 1) {
                randomMember.HP = Math.round(randomMember.maxHP * 0.5) * -1;
              }
              const members = pets.filter((i) => !i.isDown());
              if (
                members.length === 0 ||
                (pets[0].isDown() && pets[1].isDown() && pets[2].isDown())
              ) {
                return handleDefeat();
              }

              extraText += `* ${randomMember.petIcon} **${
                randomMember.petName
              }** ${
                randomMember.isDown()
                  ? `is down.`
                  : `has taken **${damage}** damage.`
              }\n`;
            }
          }
          extraText += `\n`;
        } else {
          extraText += `* You chose **${turnOption}** and the entire party has successfully dodged the **${attackName}**!\n\n`;
        }
      }
      /*for (const pet of pets) {
        if (pet.isDown()) {
          const heal = pet.getDownHeal();
          pet.HP += heal;
          extraText += `* ${pet.petIcon} **${pet.petName}** has regenerated ${heal} HP.\n\n`;
        }
      }*/
      if (pets[repObj.index]?.isDown()) {
        repObj.index++;
      }
      if (pets[repObj.index]?.isDown()) {
        repObj.index++;
      }

      repObj.attack = null;

      const i = await output.reply(
        extraText +
          listPetsNormal({
            encounter: type === "start",
          })
      );

      handleEnd(i.messageID, {
        ...repObj,
        type: "turnPlayer",
        index: repObj.index + 1,
      });
    } else {
      const turns = repObj.turnCache.map((i) => String(i).toLowerCase());
      repObj.prevTurns ??= [];
      const prev = repObj.prevTurns;
      let flavorText = ``;
      let damage = 0;
      let newResponse = null;
      let dodgeChance = Math.random();
      for (let i = 0; i < turns.length; i++) {
        const pet = pets[i];
        const turn = turns[i];
        if (!turn) {
          flavorText += `* ${pet.petIcon} **${pet.petName}** has no turn specified.\n`;
          continue;
        }
        if (pet.isDown()) {
          flavorText += `* ${pet.petIcon} **${pet.petName}** is currently down.\n`;
          continue;
        }
        switch (turn) {
          case "cheat": {
            if (input.isAdmin) {
              const allAtk = pets.reduce(
                (acc, pet) => acc + pet.calculateAttack(opponent.DF),
                0
              );
              damage += opponent.maxHP - allAtk;
            }
            break;
          }
          case "hexsmash":
            {
              flavorText += `* ${pet.petIcon} **${pet.petName}** used 💥 **HexMash**!\n`;
              if (
                (prev[i] === "hexsmash" && dodgeChance < 0.7) ||
                Math.random() < 0.1
              ) {
                flavorText += `* ${opponent.wildIcon} **${opponent.wildName}** successfully dodges!\n`;
              } else {
                const meanStat = (pet.ATK + pet.MAGIC) / 2;
                const init = pet.calculateAttack(opponent.DF, meanStat);
                const damageEach = Math.round(init * 1.5);
                opponent.HP -= damageEach;
                flavorText += `* Inflicted **${damageEach}** magical damage.\n${opponent.getPlayerUI()}\n`;
                damage += damageEach;
                opponent.HP += damageEach;
              }
              flavorText += `\n`;
            }
            break;
          case "bash":
            {
              flavorText += `* ${pet.petIcon} **${pet.petName}** attacks!\n`;
              if (
                (prev[i] === "bash" && dodgeChance < 0.7) ||
                Math.random() < 0.1
              ) {
                flavorText += `* ${opponent.wildIcon} **${opponent.wildName}** successfully dodges!\n`;
              } else {
                const damageEach = pet.calculateAttack(opponent.DF);
                opponent.HP -= damageEach;
                flavorText += `* Inflicted **${damageEach}** damage.\n${opponent.getPlayerUI()}\n`;
                damage += damageEach;
                opponent.HP += damageEach;
              }
              flavorText += `\n`;
            }
            break;
          case "defend":
            {
              flavorText += `* ${pet.petIcon} **${pet.petName}** defended.\n`;
            }
            break;
          case "mercy":
            {
              if (opponent.isSparable()) {
                flavorText += `* ${pet.petIcon} **${pet.petName}** spared ${opponent.wildIcon} **${opponent.wildName}**!`;
                return handleWin(true, flavorText);
              }
              const calc =
                (pet.calculateAttack(opponent.DF) / opponent.maxHP) * 100 * 0.2;
              opponent.addMercyInternal(calc * 25);
              flavorText += `* ${pet.petIcon} **${pet.petName}** spared ${
                opponent.wildIcon
              } **${
                opponent.wildName
              }**, but the name isn't **YELLOW**! gained ${Math.round(
                calc
              )}% Mercy Points.\n`;
            }

            break;
          case "debug":
            {
              flavorText += `${JSON.stringify(opponent, null, 2)}\n`;
            }
            break;
          case "act": {
            if (i !== 0) {
              const calc =
                (pet.calculateAttack(opponent.DF) / opponent.maxHP) * 100 * 0.4;
              opponent.addMercyInternal(calc * 25);
              flavorText += `* ${pet.petIcon} **${
                pet.petName
              }** used 🔊 **Pet Action**\n* Gained ${Math.floor(
                calc
              )}% Mercy Points.\n`;
            } else {
              const calc =
                (pet.calculateAttack(opponent.DF) / opponent.maxHP) * 100 * 0.6;
              opponent.addMercyInternal(calc * 25);
              const randomActs = Object.keys(opponent.acts).filter((i) =>
                opponent.isActAvailable(i)
              );
              const randomAct =
                randomActs[Math.floor(Math.random() * randomActs.length)];
              const actData = opponent.getAct(randomAct);
              let {
                flavor = `${pet.petIcon} **${pet.petName}** can't think of what to do.`,
                response,
                mercyPts = 0,
                petLine = "...",
              } = actData ?? {};
              opponent.MERCY += mercyPts;
              flavorText += `* 🔊 **${randomAct}**\n* ${flavor}\n\n${
                pet.petIcon
              } **${pet.petName}**: ${petLine}\n\n* Gained ${
                mercyPts + Math.floor(calc)
              }% Mercy Points.\n`;
              newResponse = response;
            }
          }

          case "magic":
            {
            }
            break;
          case "lifeup":
            {
              const magic = pet.MAGIC;
              const lowests = pets.toSorted(
                (a, b) => a.HP / a.maxHP - b.HP / b.maxHP
              );
              const firstLowest = lowests[0];
              const target =
                Math.random() < 0.3 && pet.HP < pet.maxHP ? pet : firstLowest;
              const healing = Math.max(
                Math.round((target.maxHP / 9) * (magic * 0.09)),
                Math.round(target.maxHP / 9)
              );
              const prevDown = target.isDown();
              const finalHealing = Math.min(healing, target.maxHP - target.HP);
              target.HP += finalHealing;
              if (
                prevDown &&
                target.HP > 0 &&
                target.HP < target.maxHP * 0.17
              ) {
                target.HP = Math.round(target.maxHP * 0.17);
              }
              flavorText += `* ${pet.petIcon} **${
                pet.petName
              }** cast ✨ **Lifeup** to ${
                target === pet ? `itself!` : `**${target.petName}**!`
              } ${
                target.HP >= target.maxHP
                  ? `HP has been maxed out.`
                  : `Recovered **${finalHealing}** HP.`
              }\n${target.getPlayerUI({
                upperPop:
                  prevDown && !target.isDown()
                    ? `UP`
                    : target.HP >= target.maxHP
                    ? `MAX`
                    : `+${finalHealing} HP`,
              })}\n\n`;
            }
            break;
          default: {
            flavorText += `* ${pet.petIcon} **${pet.petName}** did not learn **${turn}**.\n`;
          }
        }
      }
      opponent.HP -= damage;
      repObj.prevTurns = [...turns];
      return enemyAttack({ flavorText, newResponse, damage });
    }
  }
}

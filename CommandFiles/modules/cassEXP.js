export class CassidyUser {
  constructor(allData = {}) {
    this.allData = allData;
  }
}

/**
 * @typedef {{ exp: number }} CXP
 */

export class CassEXP {
  /**
   *
   * @param {CXP} cassEXP
   */
  constructor(cassEXP = {}) {
    this.cxp = this.sanitize(cassEXP);
    this.expControls = new EXP(this);
  }

  /**
   *
   * @param {CXP} data
   * @returns {CXP}
   */
  sanitize(data) {
    let { exp } = data;
    if (isNaN(exp)) {
      exp = 0;
    }
    exp = parseFloat(exp, 10);

    return {
      ...data,
      exp,
    };
  }

  getEXP() {
    return this.cxp.exp;
  }

  setEXP(exp) {
    this.cxp.exp = exp;
    return true;
  }

  get exp() {
    return this.getEXP();
  }

  set exp(exp) {
    return this.setEXP(exp);
  }

  getLevel() {
    return CassEXP.getLevelFromEXP(this.getEXP());
  }

  setLevel(level) {
    this.setEXP(CassEXP.getEXPFromLevel(level));
    return true;
  }

  get level() {
    return this.getLevel();
  }

  set level(level) {
    return this.setLevel(level);
  }

  getNextRemaningEXP() {
    const currentLevel = this.getLevel();
    const currentEXP = this.getEXP();
    const nextLevelEXP = CassEXP.getEXPFromLevel(currentLevel + 1);
    return nextLevelEXP - currentEXP;
  }

  getNextEXP() {
    const currentLevel = this.getLevel();
    const nextLevelEXP = CassEXP.getEXPFromLevel(currentLevel + 1);

    return nextLevelEXP;
  }

  getEXPBeforeLv() {
    const lim = CassEXP.getEXPFromLevel(this.getLevel() - 1);
    return lim;
  }

  getEXPCurrentLv() {
    const lim = CassEXP.getEXPFromLevel(this.getLevel() - 1);
    return this.getEXP() - lim;
  }

  raw() {
    return JSON.parse(JSON.stringify(this.cxp));
  }

  getRankString() {
    return CassEXP.rankNames[
      Math.max(0, Math.min(this.getLevel() - 1, CassEXP.rankNames.length - 1))
    ];
  }

  expReached(exp) {
    return this.getEXP() >= exp;
  }

  levelReached(level) {
    return this.getLevel() >= level;
  }

  static getEXPFromLevel(level) {
    const baseExp = 100;
    const multiplier = 1.5;

    if (level < 2) {
      return 0;
    }

    return Math.floor(baseExp * Math.pow(level - 1, multiplier));
  }

  static getLevelFromEXP(exp) {
    let level = 1;

    while (exp >= this.getEXPFromLevel(level + 1)) {
      level++;
    }

    return level;
  }

  // until level 200 lang to, bwahaha
  static rankNames = [
    "Novice",
    "Apprentice",
    "Adept",
    "Expert",
    "Master",
    "Grandmaster",
    "Champion",
    "Legend",
    "Mythic",
    "Godlike",
    "Hero",
    "Elite",
    "Veteran",
    "Elite Veteran",
    "Pro",
    "Master Pro",
    "Grandmaster Pro",
    "Immortal",
    "Ascendant",
    "Overlord",
    "Exalted",
    "Supreme",
    "Warlord",
    "Titan",
    "Champion of Champions",
    "Celestial",
    "Ascendant Master",
    "Sovereign",
    "Exemplary",
    "Invincible",
    "Radiant",
    "Virtuous",
    "Untouchable",
    "Eternal",
    "Indomitable",
    "Unyielding",
    "Pinnacle",
    "Invulnerable",
    "Unstoppable",
    "Unbeatable",
    "Invincible Ascendant",
    "Conqueror",
    "Conqueror Supreme",
    "Emperor",
    "Titan Master",
    "Supreme Immortal",
    "Legendary Immortal",
    "Divine",
    "Champion Ascendant",
    "Transcendent",
    "Mythical Champion",
    "Unmatched",
    "Grand Exemplar",
    "Celestial Legend",
    "Ancient",
    "Prime",
    "All-Powerful",
    "Unstoppable Force",
    "Peerless",
    "The Chosen One",
    "Master of Masters",
    "Guardian of Realms",
    "Celestial Overlord",
    "Elder Champion",
    "Ultimate",
    "Ultimate Ascendant",
    "Grand Titan",
    "Pinnacle Guardian",
    "Supreme Champion",
    "Unyielding Hero",
    "Arcane",
    "Sage",
    "Titan Guardian",
    "True Master",
    "Eternal Sovereign",
    "Guardian of Infinity",
    "Cosmic",
    "Universal Champion",
    "Elder Ascendant",
    "Sovereign Champion",
    "Prime Emperor",
    "Boundless",
    "Infinite",
    "Omnipotent",
    "Omniscient",
    "Supreme Ascendant",
    "Mythical Sovereign",
    "Celestial God",
    "Warden of Realms",
    "Timeless",
    "Destiny's Chosen",
    "Eternal Hero",
    "Champion of Time",
    "Beyond Legendary",
    "Eternal Exemplar",
    "Lord of Realms",
    "Cosmic Titan",
    "Master of Eternity",
    "Grand Warlord",
    "Celestial Exemplar",
    "Unstoppable Overlord",
    "Immortal Champion",
    "Titanic Legend",
    "Infallible",
    "Master of Time",
    "Warden of the Infinite",
    "Eternal Sovereign",
    "Cosmic Warlord",
    "Limitless",
    "Boundless Champion",
    "Guardian of Eternity",
    "Exalted Legend",
    "Unstoppable Legend",
    "Sage of Time",
    "Infinite Champion",
    "Champion of Realms",
    "Grand Immortal",
    "Guardian of Time",
    "Warden of Eternity",
    "Eternal Overlord",
    "All-Knowing",
    "Immortal Warlord",
    "True Exemplar",
    "Champion of Eternity",
    "Ultimate Lord",
    "Divine Guardian",
    "Supreme Warden",
    "Timeless Champion",
    "Cosmic Sovereign",
    "Transcendent Champion",
    "Omnipotent Guardian",
    "Beyond Supreme",
    "Unyielding Legend",
    "Infinite Sovereign",
    "Exalted Warlord",
    "Celestial Warden",
    "Ascendant Champion",
    "Divine Conqueror",
    "Titan of Eternity",
    "Warden of Time",
    "Unstoppable Sage",
    "Mythic Overlord",
    "Divine Exemplar",
    "Cosmic Overlord",
    "Elder Titan",
    "Cosmic Conqueror",
    "Champion of the Infinite",
    "Warlord of Time",
    "Champion of the Cosmos",
    "Legendary Overlord",
    "Timeless Titan",
    "Divine Ascendant",
    "Warden of Time",
    "Infinite Exemplar",
    "Cosmic Warlord",
    "Ascendant God",
    "Elder Conqueror",
    "Mythic Sovereign",
    "Beyond All",
    "Unstoppable Hero",
    "Legendary Sage",
    "Champion of the Infinite",
    "Boundless Overlord",
    "Eternal Conqueror",
    "Divine Warlord",
    "Champion of the Celestial",
    "Elder Warlord",
    "Immortal Sage",
    "Boundless Lord",
    "Warden of Infinity",
    "Ascendant Master",
    "Warden of Realms",
    "Beyond the Gods",
    "Omnipotent Overlord",
    "Titan of Realms",
    "Supreme Master",
    "Eternal Sage",
    "Mythic God",
    "Infinite Warlord",
    "Champion of Infinity",
    "Ultimate Warden",
    "Boundless Hero",
    "Warden of the Gods",
    "Ascendant Conqueror",
    "Immortal Hero",
    "Infinite Titan",
    "Eternal Warden",
    "Mythical Warlord",
    "Transcendent Warden",
    "Legendary Titan",
    "Omnipotent Champion",
    "Supreme Guardian",
    "Champion of Eternity",
    "Timeless Lord",
    "Exalted God",
    "Celestial Warlord",
    "Unbeatable Champion",
    "Legendary Sovereign",
    "Warden of Realms",
    "Eternal Warlord",
  ];
}

class EXP {
  constructor(parent = new CassEXP()) {
    // this.exp = exp;
    this.parent = parent;
  }
  get exp() {
    return this.parent.exp;
  }

  raise(expAmount) {
    this.exp += expAmount;
    this.parent.setEXP(this.exp);
  }

  decrease(expAmount) {
    this.exp -= expAmount;
    this.parent.setEXP(this.exp);
  }

  raiseToLevel(level) {
    const targetEXP = EXP.getEXPFromLevel(level);
    this.exp = targetEXP;
    this.parent.setEXP(this.exp);
  }

  raiseTo(targetEXP) {
    this.exp = targetEXP;
    this.parent.setEXP(this.exp);
  }

  raiseWithLevel(level) {
    const baseEXP = CassEXP.getEXPFromLevel(level);
    this.exp = baseEXP + this.exp;
    this.parent.setEXP(this.exp);
  }

  retrieve() {
    return this.exp;
  }

  getLevel() {
    return CassEXP.getLevelFromEXP(this.exp);
  }
}

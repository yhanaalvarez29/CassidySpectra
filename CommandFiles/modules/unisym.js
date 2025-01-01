export class UNIRedux {
  static burger = "☰"; // burger menu
  static standardLine = "━━━━━━━━━━━━━━━"; // Line
  static section = "§"; // Section sign
  static paragraph = "¶"; // Pilcrow sign
  static registered = "®"; // Registered trademark sign
  static trademark = "™"; // Trademark sign
  static copyright = "©"; // Copyright sign
  static degree = "°"; // Degree sign
  static micro = "µ"; // Micro sign
  static bullet = "•"; // Bullet
  static enDash = "–"; // En dash
  static emDash = "—"; // Em dash
  static prime = "′"; // Prime
  static doublePrime = "″"; // Double prime
  static daggers = "†"; // Dagger
  static doubleDagger = "‡"; // Double dagger
  static ellipsis = "…"; // Ellipsis
  static infinity = "∞"; // Infinity symbol
  static currency = "¤"; // Generic currency sign
  static yen = "¥"; // Yen sign
  static euro = "€"; // Euro sign
  static pound = "£"; // Pound sign
  static plusMinus = "±"; // Plus-minus sign
  static approximately = "≈"; // Approximately equal to
  static notEqual = "≠"; // Not equal to
  static lessThanOrEqual = "≤"; // Less than or equal to
  static greaterThanOrEqual = "≥"; // Greater than or equal to
  static summation = "∑"; // Summation sign
  static integral = "∫"; // Integral sign
  static squareRoot = "√"; // Square root sign
  static partialDifferential = "∂"; // Partial differential
  static angle = "∠"; // Angle
  static degreeFahrenheit = "℉"; // Degree Fahrenheit
  static degreeCelsius = "℃"; // Degree Celsius

  // Decorative Symbols
  static floralHeart = "❧"; // Floral Heart
  static starFlower = "✻"; // Star Flower
  static heavyStar = "★"; // Heavy Star
  static sparkle = "✦"; // Sparkle
  static asterisk = "✱"; // Asterisk
  static heavyCheckMark = "✔"; // Heavy Check Mark
  static heavyBallotX = "✖"; // Heavy Ballot X
  static heart = "♥"; // Heart
  static diamond = "♦"; // Diamond
  static club = "♣"; // Club
  static spade = "♠"; // Spade
  static musicalNote = "♪"; // Musical Note
  static doubleMusicalNote = "♫"; // Double Musical Note
  static snowflake = "❄"; // Snowflake
  static sparkleStar = "✨"; // Sparkle Star
  static anchor = "⚓"; // Anchor
  static umbrella = "☔"; // Umbrella
  static hourglass = "⌛"; // Hourglass
  static hourglassNotDone = "⏳"; // Hourglass Not Done

  static charm = "✦";
  static disc = "⦿";

  static reduxMark = `🌌 **Cassidy**[font=double_struck]Redux[:font=double_struck] **2.5** ${this.charm}\n[font=fancy_italic]Not React, Just Smart Chat![:font=fancy_italic]`;
  static redux = `🌌 **Cassidy**[font=double_struck]Redux[:font=double_struck] ${this.charm}`;
}

export const fontMarkups = new Proxy(
  {},
  {
    get(_, fontName) {
      return (value) => `[font=${fontName}]${value}[:font=${fontName}]`;
    },
  }
);

export function abbreviateNumber(value, places = 2, isFull = false) {
  let num = Number(value);
  if (isNaN(num)) return "Invalid input";

  const suffixes = ["", "K", "M", "B", "T", "P", "E"];
  const fullSuffixes = [
    "",
    "Thousand",
    "Million",
    "Billion",
    "Trillion",
    "Quadrillion",
    "Quintillion",
  ];

  const magnitude = Math.floor(Math.log10(num) / 3);

  if (magnitude === 0) {
    return num % 1 === 0 ? num.toString() : num.toFixed(places);
  }

  const abbreviatedValue = num / Math.pow(1000, magnitude);
  const suffix = isFull ? fullSuffixes[magnitude] : suffixes[magnitude];

  if (abbreviatedValue % 1 === 0) {
    return `${Math.round(abbreviatedValue)}${isFull ? ` ${suffix}` : suffix}`;
  }

  const formattedValue = abbreviatedValue.toFixed(places).replace(/\.?0+$/, "");

  return `${formattedValue}${isFull ? ` ${suffix}` : suffix}`;
}

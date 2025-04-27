export function parseBet(arg: string | number, bet?: number) {
  let targetArg = `${arg}`.trim();

  if (targetArg === "allin" && !isNaN(bet)) {
    return Math.min(global.Cassidy.highRoll, Number(bet));
  }

  if (targetArg === "allin" || (targetArg === "all" && !isNaN(bet))) {
    return Number(bet);
  }

  const clean = targetArg.replaceAll(",", "").replaceAll("_", "");

  const multipliers: Record<string, number> = {
    "": 1,
    k: 1e3,
    m: 1e6,
    b: 1e9,
    t: 1e12,
    qa: 1e15,
    qi: 1e18,
    sx: 1e21,
    sp: 1e24,
    oc: 1e27,
    no: 1e30,
    dc: 1e33,
    ud: 1e36,
    dd: 1e39,
    td: 1e42,
    qad: 1e45,
    qid: 1e48,
    sxd: 1e51,
    spd: 1e54,
    ocd: 1e57,
    nod: 1e60,
    vg: 1e63,
  };

  const suffixPattern = Object.keys(multipliers)
    .sort((a, b) => b.length - a.length)
    .join("|");

  const regex = new RegExp(
    `^([\\d.]+(?:e[+-]?\\d+)?)(?:(${suffixPattern}))?$`,
    "i"
  );

  const match = clean.match(regex);

  if (match) {
    const numberPart = parseFloat(match[1]);
    const abbreviation = match[2];

    if (!abbreviation) {
      return Math.floor(numberPart);
    }

    const multiplier = multipliers[String(abbreviation).toLowerCase()];
    if (multiplier !== undefined) {
      return Math.floor(numberPart * multiplier);
    }
  }

  return NaN;
}

export class ArielIcons {
  static mainArrow = "⇒";
  static info = "ℹ️ ⇒";
}

export function abbreviateNumber(value, places = 0, isFull = false) {
  let num = Number(value);
  if (isNaN(num)) return "Invalid input";
  if (num < 1000) {
    return num.toFixed(places).replace(/\.?0+$/, "");
  }

  const suffixes = [
    "", // 10^0
    "K", // 10^3
    "M", // 10^6
    "B", // 10^9
    "T", // 10^12
    "Qa", // Quadrillion, 10^15
    "Qi", // Quintillion, 10^18
    "Sx", // Sextillion, 10^21
    "Sp", // Septillion, 10^24
    "Oc", // Octillion, 10^27
    "No", // Nonillion, 10^30
    "Dc", // Decillion, 10^33
    "Ud", // Undecillion, 10^36
    "Dd", // Duodecillion, 10^39
    "Td", // Tredecillion, 10^42
    "Qad", // Quattuordecillion, 10^45
    "Qid", // Quindecillion, 10^48
    "Sxd", // Sexdecillion, 10^51
    "Spd", // Septendecillion, 10^54
    "Ocd", // Octodecillion, 10^57
    "Nod", // Novemdecillion, 10^60
    "Vg", // Vigintillion, 10^63
  ];

  const fullSuffixes = [
    "",
    "Thousand",
    "Million",
    "Billion",
    "Trillion",
    "Quadrillion",
    "Quintillion",
    "Sextillion",
    "Septillion",
    "Octillion",
    "Nonillion",
    "Decillion",
    "Undecillion",
    "Duodecillion",
    "Tredecillion",
    "Quattuordecillion",
    "Quindecillion",
    "Sexdecillion",
    "Septendecillion",
    "Octodecillion",
    "Novemdecillion",
    "Vigintillion",
  ];

  const magnitude = Math.floor(Math.log10(num) / 3);

  if (magnitude === 0) {
    return num % 1 === 0
      ? num.toString()
      : num.toFixed(places).replace(/\.?0+$/, "");
  }

  const abbreviatedValue = num / Math.pow(1000, magnitude);
  const suffix = isFull ? fullSuffixes[magnitude] : suffixes[magnitude];

  if (!suffix) {
    return num.toExponential();
  }

  if (abbreviatedValue % 1 === 0) {
    return `${Math.round(abbreviatedValue)}${isFull ? ` ${suffix}` : suffix}`;
  }

  const formattedValue = abbreviatedValue.toFixed(places).replace(/\.?0+$/, "");

  return `${formattedValue}${isFull ? ` ${suffix}` : suffix}`;
}

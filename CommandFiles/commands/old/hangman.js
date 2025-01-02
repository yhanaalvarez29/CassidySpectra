export const meta = {
  name: "hangman",
  description: "Guess the word before the hangman is completed!",
  version: "1.0.0",
  author: "Liane Cagara",
  usage: "{prefix}hangman",
  category: "Fun",
  permissions: [0],
  noPrefix: false,
  noWeb: true,
};

export const style = {
  title: "Hangman",
  titleFont: "bold",
  contentFont: "fancy",
};

export async function entry({ output, input, money }) {
  const words = [
    "javascript",
    "hangman",
    "computer",
    "programming",
    "algorithm",
    "openai",
    "chatgpt",
  ];
  const chosenWord = words[Math.floor(Math.random() * words.length)];
  let guessedWord = "_".repeat(chosenWord.length);
  let attempts = 6;
  let guessedLetters = [];

  const sendGameStatus = () => {
    const hangman = `
+---+
|   |
${attempts < 6 ? "O" : " "}
${attempts < 5 ? (attempts < 4 ? "/" : "/ ") : " "}
${attempts < 3 ? "|" : " "}
${attempts < 2 ? "/" : " "}
|
=========
`;

    /*output.reply(`**Hangman**:
    \`${hangman}\`
    **Guessed Word**: ${guessedWord}
    **Attempts Left**: ${attempts}
    **Guessed Letters**: ${guessedLetters.join(", ")}`);*/
  };

  //sendGameStatus();

  const onGuess = async () => {
    const hangman = `
+---+
|   |
${attempts < 6 ? "O" : " "}
${attempts < 5 ? (attempts < 4 ? "/" : "/ ") : " "}
${attempts < 3 ? "|" : " "}
${attempts < 2 ? "/" : " "}
|
=========
`;
    const { body } = await output.waitForReply(`**Hangman**:
\`${hangman}\`
**Guessed Word**: ${guessedWord}
**Attempts Left**: ${attempts}
**Guessed Letters**: ${guessedLetters.join(", ")}

Reply with a letter you guess.`);

    const letter = body.trim().toLowerCase();
    if (letter.length !== 1 || !/[a-z]/.test(letter)) {
      output.reply("Please enter a single letter from A to Z.");
      onGuess();
      return;
    }

    if (guessedLetters.includes(letter)) {
      output.reply("You already guessed that letter.");
      onGuess();
      return;
    }

    guessedLetters.push(letter);

    if (!chosenWord.includes(letter)) {
      attempts--;
    } else {
      for (let i = 0; i < chosenWord.length; i++) {
        if (chosenWord[i] === letter) {
          guessedWord =
            guessedWord.substring(0, i) + letter + guessedWord.substring(i + 1);
        }
      }
    }

    if (attempts === 0 || guessedWord === chosenWord) {
      if (attempts === 0) {
        output.reply(`Game over! The word was **${chosenWord}**.`);
      } else {
        output.reply(
          `Congratulations! You guessed the word **${chosenWord}** correctly! You won 500$!`,
        );
        const { money: playerMoney } = await money.get(input.senderID);
        await money.set(input.senderID, {
          money: playerMoney + 500,
        });
      }
    } else {
      sendGameStatus();
      onGuess();
    }
  };

  onGuess();
}

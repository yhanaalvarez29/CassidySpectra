import axios from 'axios';

export const meta = {
  name: "chuck",
  author: "Liane Cagara",
  description: "Get a random Chuck Norris joke",
  usage: "{prefix}chuck",
  version: "1.0.1",
  category: "Fun",
  permissions: [0],
  noPrefix: false,
  requirement: "2.5.0",
  icon: "😄",
};

export async function entry({ output }) {
  try {
    const response = await axios.get('https://api.chucknorris.io/jokes/random');

    const joke = response.data.value;

    output.reply(joke);
    
    output.reaction("😄");
  } catch (error) {
    console.error("Error fetching Chuck Norris joke:", error);
    output.reply("Sorry, I couldn't fetch a Chuck Norris joke at the moment. Please try again later.");
  }
}


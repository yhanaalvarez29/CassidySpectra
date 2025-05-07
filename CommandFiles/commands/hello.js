// @ts-check

export default easyCMD({
  name: "hello",
  description: "Greets a user.",
  title: "💗 Greetings",
  titleFont: "bold",
  async run({ print, reaction }) {
    print("Hello user!");
    reaction("💗");
  },
});

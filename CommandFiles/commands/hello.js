// @ts-check

export default easyCMD({
  name: "hello",
  description: "Greets a user.",
  title: "💗 Greetings",
  async run({ print, reaction, pause, edit }) {
    await print("Hello user!");
    await reaction("💗");

    await pause(5000);

    await edit("5 seconds later!");
  },
});

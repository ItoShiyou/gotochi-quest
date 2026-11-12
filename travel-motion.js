const toggle = document.querySelector(".motion-toggle");
const scene = document.querySelector(".hero-scene");

if (toggle && scene) {
  toggle.hidden = false;
  toggle.addEventListener("click", () => {
    const paused = scene.classList.toggle("travel-motion-paused");
    toggle.textContent = paused ? "動きを再開" : "動きを止める";
  });
}

const reaction = document.querySelector(".travel-reaction");
if (scene && reaction) {
  const characters = [
    {
      selector: ".travel-player",
      name: "主人公",
      lines: [
        "青島の冒険、一緒に行こう！",
        "鬼の洗濯板は、波が岩を削ってできたんだ。",
        "鬼の洗濯板は、国の天然記念物なんだよ。",
        "青島は、海幸彦と山幸彦の神話ゆかりの地なんだ。",
      ],
    },
    {
      selector: ".travel-companion",
      name: "ひなたもち",
      lines: [
        "もちっ！ 青島で待ってるよ。",
        "青島は島全体が青島神社の境内なんだって。",
        "島にはヤシの仲間のビロウが生えているよ。",
        "青島神社には、ハートに見える「猪の目」の模様があるよ。",
      ],
    },
  ];
  for (const { selector, name, lines } of characters) {
    const character = scene.querySelector(selector);
    if (!character) continue;
    let nextLine = 0;
    let clearReaction;
    character.disabled = false;
    character.addEventListener("click", () => {
      reaction.textContent = `${name}「${lines[nextLine]}」`;
      nextLine = (nextLine + 1) % lines.length;
      clearTimeout(clearReaction);

      // Restart the reaction when someone taps again before it finishes.
      character.classList.remove("is-reacting");
      void character.offsetWidth;
      character.classList.add("is-reacting");
      clearReaction = setTimeout(() => character.classList.remove("is-reacting"), 950);
    });
  }
}

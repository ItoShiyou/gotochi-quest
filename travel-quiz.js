const quiz = document.querySelector("#aoshima-quiz");

const questions = [
  {
    prompt: "鬼の洗濯板の岩を削ったのは？",
    options: ["風", "波", "雨"],
    answer: 1,
    hint: "ヒント：海から何度も打ち寄せるものだよ。",
    fact: "波が岩を削って、洗濯板のような形になったよ。",
  },
  {
    prompt: "青島神社の境内はどこまで？",
    options: ["青島全体", "鳥居の周りだけ", "本殿の周りだけ"],
    answer: 0,
    hint: "ヒント：本殿や鳥居より、ずっと広いよ。",
    fact: "青島は、島全体が青島神社の境内なんだ。",
  },
  {
    prompt: "青島神社で見られるハート形の模様は？",
    options: ["貝の耳", "鹿の角", "猪の目"],
    answer: 2,
    hint: "ヒント：ハートの形に見える、動物の目にちなんだ名前だよ。",
    fact: "ハート形の模様は「猪の目（いのめ）」と呼ばれるよ。",
  },
];

if (quiz) {
  const get = (name) => quiz.querySelector(`[data-quiz="${name}"]`);
  const jump = document.querySelector(".quiz-jump");
  const [progress, prompt, options, feedback, next, result, resultTitle, restart, mochi] =
    ["progress", "prompt", "options", "feedback", "next", "result", "result-title", "restart", "mochi"].map(get);
  let index = 0;
  let solved = false;

  function celebrate() {
    mochi.classList.remove("is-happy");
    void mochi.offsetWidth;
    mochi.classList.add("is-happy");
  }

  function showQuestion(moveFocus) {
    const question = questions[index];
    solved = false;
    mochi.classList.remove("is-happy");
    result.hidden = true;
    options.hidden = false;
    next.hidden = true;
    feedback.textContent = "";
    delete feedback.dataset.state;
    progress.textContent = `第 ${index + 1} 問 / 全 ${questions.length} 問`;
    prompt.textContent = question.prompt;
    options.replaceChildren(...question.options.map((label, choice) => {
      const button = document.createElement("button");
      button.className = "secondary quiz-option";
      button.type = "button";
      button.textContent = label;
      button.addEventListener("click", () => {
        if (solved || button.getAttribute("aria-disabled") === "true") return;
        if (choice !== question.answer) {
          button.dataset.state = "retry";
          button.setAttribute("aria-disabled", "true");
          feedback.dataset.state = "retry";
          feedback.textContent = `おしい！ ${question.hint}`;
          return;
        }
        solved = true;
        button.dataset.state = "correct";
        for (const option of options.children) option.setAttribute("aria-disabled", "true");
        feedback.dataset.state = "correct";
        feedback.textContent = `正解！ もちっ！ ${question.fact}`;
        next.textContent = index === questions.length - 1 ? "結果を見る" : "次の問題へ";
        next.hidden = false;
        celebrate();
      });
      return button;
    }));
    if (moveFocus) prompt.focus();
  }

  next.addEventListener("click", () => {
    if (!solved || next.hidden) return;
    index += 1;
    if (index < questions.length) {
      showQuestion(true);
      return;
    }
    progress.textContent = `全 ${questions.length} 問クリア`;
    prompt.textContent = "";
    options.hidden = true;
    next.hidden = true;
    feedback.textContent = "";
    result.hidden = false;
    celebrate();
    resultTitle.focus();
  });

  restart.addEventListener("click", () => {
    index = 0;
    showQuestion(true);
  });

  showQuestion(false);
  quiz.hidden = false;
  jump.hidden = false;
}

// & warhammerCliApp.js

import fs from "fs";
import readline from "readline";
import chalk from "chalk";

// & load in the questions from the JSON file
const questions = JSON.parse(fs.readFileSync("./warhammer_questions.json"));

// & keep track of scores for each faction
let scores = {
  Ork: 0,
  "Space Marine": 0,
  Eldar: 0,
  "Chaos Marine": 0,
  "Imperial Guard": 0,
};

let rl; // & readline will only be created after the intro finishes
let current = 0; // & index of the current question
let lastInvalid = false; // & track if the last input was invalid so we don’t reprint the question

// & dummy function (noop) used to swallow input during the intro
const swallowInput = () => {};

let escKeyHandler = null;

function cleanupAndExit() {
  try {
    process.stdin.removeListener("data", swallowInput);
  } catch {}
  try {
    if (escKeyHandler) process.stdin.removeListener("data", escKeyHandler);
  } catch {}
  try {
    if (process.stdin.isTTY) process.stdin.setRawMode(false);
  } catch {}
  try {
    rl && rl.close();
  } catch {}
  try {
    process.stdin.pause();
  } catch {}
  process.exit(0);
}

// & lock input so typing during intro doesn’t interfere
function lockInput() {
  try {
    if (process.stdin.isTTY) process.stdin.setRawMode(true);
  } catch {}
  process.stdin.resume();
  process.stdin.on("data", swallowInput);
}

// & unlock input once the intro is done &
function unlockInput() {
  process.stdin.removeListener("data", swallowInput);
  try {
    if (process.stdin.isTTY) process.stdin.setRawMode(false);
  } catch {}
}

// & slowly types out a string a character at a time
async function typeOut(text, delay = 35) {
  for (const char of text) {
    process.stdout.write(char);
    await new Promise((res) => setTimeout(res, delay));
  }
  process.stdout.write("\n");
}

// & prints the animated intro message, then sets up readline and starts quiz
async function showIntro() {
  const intro =
    "\nThis is the Dawn of War\n" +
    "Your dog in this fight will be determined by your answers to the following 25 questions\n" +
    "Choose wisely, for taking up arms with the wrong side may lead to a fate worse than death\n\n";

  lockInput(); // & lock keyboard while text prints
  await typeOut(chalk.bold.yellow(intro), 20);
  unlockInput(); // & allow keyboard again

  console.log(chalk.gray("Press Esc to exit")); // & let user know Esc can quit

  // & create readline now so nothing typed earlier goes in
  rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // & listen for Esc key to exit gracefully
  process.stdin.setRawMode(true);
  process.stdin.resume();
  escKeyHandler = (key) => {
    if (key && key.toString() === "\u001b") {
      console.log(chalk.red("\nExiting questionnaire..."));
      cleanupAndExit();
    }
  };
  process.stdin.on("data", escKeyHandler);
  askQuestion();
}

// & handles asking the current question
function askQuestion() {
  const q = questions[current];

  // & only show the question again if last input wasn’t invalid
  if (!lastInvalid) {
    console.log(`\n${chalk.yellow(`Q${q.id}: ${q.question}`)}`);
    q.options.forEach((opt, i) => {
      console.log(`${chalk.cyan(i + 1)}. ${opt.text}`);
    });
  }

  rl.question(
    chalk.green(`\nYour answer (1-${q.options.length}): `),
    (answer) => {
      const choice = parseInt(answer, 10);

      if (choice >= 1 && choice <= q.options.length) {
        const selected = q.options[choice - 1];
        scores[selected.category]++;
        console.log(
          chalk.bgGreen.black(`\nYou selected: ${choice}. ${selected.text}`)
        );
        lastInvalid = false;

        // & move to the next question after a short pause
        setTimeout(() => {
          current++;
          if (current < questions.length) {
            askQuestion();
          } else {
            showResults();
          }
        }, 500);
      } else {
        // & if invalid, don’t reprint the question, just show error
        lastInvalid = true;
        console.log(
          chalk.red(`Invalid choice. Please select 1–${q.options.length}.`)
        );
        askQuestion();
      }
    }
  );
}

// & show the final results at the end of the quiz
function showResults() {
  const quotes = {
    "Space Marine": "Burn the Heretic. Kill the Mutant. Purge the Unclean!",
    "Chaos Marine": "Let the galaxy burn.",
    Eldar: "We see the strands of fate. You merely stumble through them.",
    Ork: "WAAAGH!",
    "Imperial Guard": "Only in death does duty end.",
  };

  console.log("\n\n==============================");
  console.log(chalk.bold("Your Warhammer 40K Alignment Results:"));

  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  let resultText = "";

  // & loop over each faction and show percentages
  Object.entries(scores).forEach(([faction, value]) => {
    const percent = total ? Math.round((value / total) * 100) : 0;
    const bar = chalk
      .magenta("|")
      .repeat(percent / 2)
      .padEnd(50, "-");
    console.log(`${chalk.bold(faction.padEnd(15))}: ${bar} ${percent}%`);
    resultText += `${faction}: ${percent}%\n`;
  });

  // & find the faction with the highest score
  const dominant = Object.entries(scores).reduce((a, b) =>
    a[1] > b[1] ? a : b
  )[0];

  console.log(
    `\n${chalk.bold.green("You align most with:")} ${chalk.bold.underline(
      dominant
    )}!`
  );
  console.log(chalk.red(`"${quotes[dominant]}"`));
  console.log("==============================\n");

  // & save results to file
  resultText += `You align most with: ${dominant}\n`;
  fs.writeFileSync("result.txt", resultText);
  console.log(chalk.gray("Results saved to result.txt"));

  // & option to restart the quiz
  rl.question(
    chalk.blue("\nWould you like to retake the questionnaire? (y/n): "),
    (answer) => {
      if (answer.toLowerCase() === "y") {
        scores = {
          Ork: 0,
          "Space Marine": 0,
          Eldar: 0,
          "Chaos Marine": 0,
          "Imperial Guard": 0,
        };
        current = 0;
        lastInvalid = false;
        askQuestion();
      } else {
        console.log(chalk.gray("Good Luck."));
        cleanupAndExit();
      }
    }
  );
}

showIntro();

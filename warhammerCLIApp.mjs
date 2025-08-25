// warhammerCliApp.js

import fs from "fs";
import readline from "readline";
import chalk from "chalk";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const questions = JSON.parse(fs.readFileSync("./warhammer_questions.json"));

let scores = {
  Ork: 0,
  "Space Marine": 0,
  Eldar: 0,
  "Chaos Marine": 0,
  "Imperial Guard": 0,
};

let current = 0;
let lastInvalid = false; // Track if previous input was invalid

// Function to animate/slowly type out the intro message
async function typeOut(text, delay = 35) {
  for (const char of text) {
    process.stdout.write(char);
    await new Promise((res) => setTimeout(res, delay));
  }
  process.stdout.write("\n");
}

// Animated intro message
async function showIntro() {
  const intro =
    "\nThis is the Dawn of War\n" +
    "Your dog in this fight will be determined by your answers to the following 25 questions\n" +
    "Choose carefully - for fighting on a side you do not belong to will result in a terrible misery.\n\n";
  await typeOut(chalk.bold.yellow(intro), 35);
}

function askQuestion() {
  const q = questions[current];

  // Only print the question if the last input was not invalid
  if (!lastInvalid) {
    console.log(`\n${chalk.yellow(`Q${q.id}: ${q.question}`)}`);
    q.options.forEach((opt, i) => {
      console.log(`${chalk.cyan(i + 1)}. ${opt.text}`);
    });
  }

  rl.question(chalk.green("\nYour answer (1-4): "), (answer) => {
    const choice = parseInt(answer);

    if (choice >= 1 && choice <= 5) {
      const selected = q.options[choice - 1];
      scores[selected.category]++;
      // Highlight the selected option briefly before moving to the next
      console.log(
        chalk.bgGreen.black(`\nYou selected: ${choice}. ${selected.text}`)
      );
      lastInvalid = false;

      // Wait 1 second before moving to the next question or results
      setTimeout(() => {
        current++;
        if (current < questions.length) {
          askQuestion();
        } else {
          showResults();
        }
      }, 1500);
    } else {
      lastInvalid = true;
      console.log(chalk.red("Invalid choice. Please select 1–4."));
      askQuestion();
    }
  });
}

function showResults() {
  const quotes = {
    "Space Marine": "Burn the Heretic. Kill the Mutant. Purge the Unclean!",
    "Chaos Marine":
      "The memories they consume us! I feel the nostalgia overtaking me...it is a good pain!",
    Eldar: "We see the strands of fate. You merely stumble through them.",
    Ork: "WAAAGH!",
    "Imperial Guard":
      "For everyone of us who falls, ten more shall take his place!",
  };

  console.log("\n\n==============================");
  console.log(chalk.bold("Your Warhammer 40K Alignment Results:"));

  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  let resultText = "";

  Object.entries(scores).forEach(([faction, value]) => {
    const percent = Math.round((value / total) * 100);
    const bar = chalk
      .magenta("|")
      .repeat(percent / 2)
      .padEnd(50, "-");
    console.log(`${chalk.bold(faction.padEnd(15))}: ${bar} ${percent}%`);
    resultText += `${faction}: ${percent}%\n`;
  });

  const dominant = Object.entries(scores).reduce((a, b) =>
    a[1] > b[1] ? a : b
  )[0];

  console.log(
    `\n${chalk.bold.green("You align most with:")} ${chalk.bold.underline(
      dominant
    )}!`
  );
  console.log("==============================\n");

  resultText += `You align most with: ${dominant}\n`;
  console.log(chalk.gray(`"${quotes[dominant]}"`));

  fs.writeFileSync("result.txt", resultText);
  console.log(chalk.gray("Results saved to result.txt"));

  rl.question(
    chalk.blue("\nWould you like to play again? (y/n): "),
    (answer) => {
      if (answer.toLowerCase() === "y") {
        scores = {
          Ork: 0,
          "Space Marine": 0,
          Eldar: 0,
          "Chaos Marine": 0,
        };
        current = 0;
        lastInvalid = false;
        askQuestion();
      } else {
        console.log(chalk.gray("Goodbye."));
        rl.close();
      }
    }
  );
}

showIntro().then(askQuestion);

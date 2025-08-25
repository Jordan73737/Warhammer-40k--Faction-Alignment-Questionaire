# Warhammer 40K CLI Alignment Quiz

A fun, interactive CLI quiz that determines which Warhammer 40K faction you align with based on your answers to 25 themed questions.

## Features

- Animated intro and colored output
- Multiple-choice questions with lore-accurate answers
- Faction-based scoring
- Results summary with percentages and a quote
- Option to replay and saves results to `result.txt`
- Exit function

## Requirements

- git
- Node.js (v18+ recommended)
- npm
- fs, readline, chalk

## Setup

- Install **Git** https://git-scm.com/downloads
- Install **Node.js** (includes npm): [https://nodejs.org/](https://nodejs.org/)
- Open command line or Powershell window
- Clone the repository:  
  `git clone https://github.com/Jordan73737/Warhammer-40k--Faction-Alignment-Questionaire.git`
- Navigate inside the project root directory
- Install dependencies:  
  `npm install chalk`
- Ensure `warhammer_questions.json` is in the project directory

## Running the Quiz

Open command line in the program folder and type: node warhammerCLIApp.mjs

## Files

- `warhammerCLIApp.mjs` — Main CLI application
- `warhammer_questions.json` — Quiz questions and answers
- `result.txt` — Generated after each quiz with your results

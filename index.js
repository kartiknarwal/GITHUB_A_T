// commit-range-2025.js
// created by kartik narwal
import fs from "fs";
import path from "path";
import moment from "moment";
import simpleGit from "simple-git";
import random from "random";

const repoPath = process.cwd();          // repo root where script runs
const dataPath = path.join(repoPath, "data.json"); // file to touch
const git = simpleGit(repoPath);

/**
 * generateRandomDateBetween - returns an ISO string for a random datetime between start and end (inclusive)
 * @param {string|moment} startISO - e.g. '2025-01-01'
 * @param {string|moment} endISO - e.g. '2025-09-30'
 */
function generateRandomDateBetween(startISO, endISO) {
  const start = moment(startISO).startOf("day");
  const end = moment(endISO).endOf("day");
  const totalDays = end.diff(start, "days");
  const randDay = random.int(0, Math.max(0, totalDays));
  const randHour = random.int(0, 23);
  const randMinute = random.int(0, 59);
  const randSecond = random.int(0, 59);
  return start
    .clone()
    .add(randDay, "days")
    .add(randHour, "hours")
    .add(randMinute, "minutes")
    .add(randSecond, "seconds")
    .toISOString(); // use ISO format for --date
}

/**
 * createCommit - writes the file, stages it, commits with specified date
 * @param {string} isoDate - ISO timestamp string
 * @param {number} index - commit index for message
 */
async function createCommit(isoDate, index) {
  // Write a small payload so file changes each commit
  const payload = { date: isoDate, commitIndex: index };
  fs.writeFileSync(dataPath, JSON.stringify(payload, null, 2));

  // Stage and commit. We do not push here (push at end optionally).
  const message = `chore: dummy commit ${index} (${isoDate})`;
  await git.add([dataPath]);
  await git.commit(message, { "--date": isoDate });
  console.log(`Committed ${index} — ${isoDate}`);
}

/**
 * makeCommitsInRange - main driver
 * @param {number} n - number of commits to create
 * @param {string} startISO - start date inclusive (e.g. '2025-01-01')
 * @param {string} endISO - end date inclusive (e.g. '2025-09-30')
 * @param {boolean} pushAtEnd - whether to push to remote after committing
 */
async function makeCommitsInRange(n = 100, startISO = "2025-01-01", endISO = "2025-09-30", pushAtEnd = true) {
  if (n <= 0) {
    if (pushAtEnd) {
      await git.push();
    }
    return;
  }

  // Optional: sort dates so the history looks chronological (not required)
  const dates = new Array(n).fill(0).map(() => generateRandomDateBetween(startISO, endISO));
  dates.sort((a, b) => new Date(a) - new Date(b));

  for (let i = 0; i < dates.length; i++) {
    await createCommit(dates[i], i + 1);
  }

  if (pushAtEnd) {
    console.log("Pushing to remote...");
    await git.push();
    console.log("Push complete.");
  } else {
    console.log("Done. Not pushed (pushAtEnd = false).");
  }
}

/* ---------- usage ----------
   - run in your repo root: node --experimental-specifier-resolution=node commit-range-2025.js
   - or with node >= 18 and "type":"module" in package.json: node commit-range-2025.js
   - edit the call below to change number of commits or disable pushing
--------------------------------*/
(async () => {
  try {
    // params: (n, startISO, endISO, pushAtEnd)
    await makeCommitsInRange(70, "2023-04-01", "2024-09-30", true);
  } catch (err) {
    console.error("Error:", err);
  }
})();

---
mode: 'agent'
tools: ['workspaceTerminal', 'terminalLastCommand', 'codebase', 'git']
description: 'Resume an unfinished Copilot task by analysing last actions and continuing automatically.'
---

# Resume Stalled Task

If you (Copilot Agent) appear to have stalled, **pick up where you left off** using the following strategy. Ask the human **only if absolutely necessary**.

## 1. Re‑establish context

1. Run `git status` in the workspace terminal to see uncommitted changes.
2. If a `TODO.md` exists, open it and locate incomplete checkbox items.
3. Call `terminalLastCommand` to fetch the output of the last executed command; determine if it finished successfully or errored.
4. Check the most recent edits via `git diff --staged` or `git diff HEAD~1` to recall what was just implemented.

## 2. Identify the next actionable step

* If the previous command **failed**, analyse the error message and plan a fix or retry.
* If the last step completed but the checklist still has unticked items, start the next unchecked task.
* If all tasks are checked yet the objective (e.g. build passes) isn’t met, run `npm test`, `npm run build`, or project‑specific verification to confirm completion.

## 3. Continue execution

* Edit or create files as needed.
* Re‑run build, test, or lint commands until they succeed.
* Update `TODO.md`, marking tasks as complete or adding new subtasks that arise.
* Commit progress frequently with meaningful messages, e.g. `git commit -am "fix: resume scaffold – completed service‑worker config"`.

## 4. Escalate only on blockers

* If repeated attempts still fail **and** you lack clues from logs, prompt the user with a concise description of the blocker and the exact error output.
* Otherwise, proceed autonomously.

## 5. Finish up

* When all acceptance criteria are met, push to the repository if configured or notify the user that the task is complete.

---

### Quick‑start reminder for you (Copilot)

> **“Retrieve the last command output, reopen TODO.md, and continue executing pending steps until the build succeeds. Ask me only if you encounter a blocker you can’t resolve automatically.”**

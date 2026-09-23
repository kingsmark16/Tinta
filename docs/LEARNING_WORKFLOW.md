# Learning Workflow

The user is Tinta's developer. The AI agent is an engineering mentor. Optimize for the user's understanding of what is built, why, how it works, alternatives, testing, debugging, and safe deployment, rather than for finishing fastest. Work on one manageable step at a time, and explain concepts when they become relevant.

## Feature workflow

1. **Understand** — State what the feature does, why Tinta needs it, and any unfamiliar concepts. Explain alternatives and common mistakes when they affect the choice.
2. **Design** — Define the data model, API contract, validation, authentication, authorization, dependencies, and where the code belongs.
3. **Plan** — Split the feature into small steps with a clear result for each step.
4. **Implement** — The user normally writes the code. The agent explains the approach and reviews the result.
5. **Run** — The user normally runs the relevant service or command. The agent explains each suggested command and its expected result.
6. **Verify manually** — Check user-visible behavior, including errors, loading states, and empty states where relevant.
7. **Test automatically** — Cover important success, validation, authentication, authorization, ownership, and regression cases.
8. **Debug if needed** — Read the exact error, locate the failing layer, reproduce the issue, inspect recent changes and inputs, form and test a hypothesis, fix the root cause, verify again, and add a regression test when appropriate. Avoid broad rewrites before locating the cause.
9. **Review** — Check correctness, security, privacy, type safety, readability, maintainability, performance when relevant, and test quality.
10. **Refactor if justified** — Improve a design only when a concrete problem warrants it; keep behavior covered by relevant tests.
11. **Document** — Update only the documents affected by the change. Update `PROJECT_STATUS.md` at meaningful checkpoints.
12. **Commit** — The user reviews and makes a focused commit. The agent may suggest a message but does not commit automatically. Follow [GIT_WORKFLOW.md](GIT_WORKFLOW.md).
13. **Reflect** — Summarize what was built, what was learned, important concepts, and what remains uncertain.
14. **Continue** — Choose the next small piece of work.

## Example: creating a diary entry

First, agree on what an entry contains and how its calendar date should behave. Design `POST /entries` so the API takes validated entry fields and derives ownership from the verified Clerk identity, never from a client-supplied user ID.

Implement one layer at a time. Then manually create an entry and check that it appears on the intended day. Add tests for a valid entry, invalid input, missing authentication, and ownership protection. Review privacy and error handling before recording the feature as complete.

## Verification rule

Describe an unrun check as an **expected result**. Call it **verified** only after it has actually run. Do not weaken a failing test simply to make it pass.

## Engineering priorities and done criteria

Prefer correctness, security, privacy, simplicity, maintainability, testability, and developer experience before performance or scalability work that has no measured need. Keep the diary and writing experience central; avoid unnecessary abstractions, services, queues, or state stores.

For a meaningful feature, check the relevant requirements before calling it done: TypeScript, lint, formatting, automated tests, authentication, authorization, ownership, validation, errors, loading and empty states, security and privacy, migration review when applicable, documentation, and the absence of committed secrets or debug logging. Record checks that could not be run as open work rather than claiming they passed.

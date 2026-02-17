# Copilot Instructions – React.js Project

You are generating code for a production-grade React.js application.

Follow these rules strictly.

---

## Core Principles

- Use modern React (functional components only).
- Use React Hooks (no class components).
- Keep components small and focused.
- Prefer readability over cleverness.
- Avoid unnecessary abstractions.

---

## TypeScript (If Project Uses TS)

- Use strict TypeScript.
- Never use `any`.
- Always type props explicitly.
- Use proper interfaces or type aliases.
- Avoid type assertions unless required.

If this project is JavaScript-only:

- Use JSDoc types where useful.
- Write predictable and clean JS.

---

## Component Structure

- One component per file.
- File name matches component name.
- Keep components under 200 lines.
- Extract reusable logic into custom hooks.
- Avoid deeply nested JSX.

---

## State Management

- Prefer local state with `useState`.
- Use `useReducer` for complex state logic.
- Lift state only when necessary.
- Avoid prop drilling — use context if needed.
- Do not introduce external state libraries unless required.

---

## Hooks Rules

- Follow React Hooks rules strictly.
- Never call hooks conditionally.
- Keep effects minimal and focused.
- Clean up side effects properly.
- Avoid unnecessary dependencies in `useEffect`.

---

## Styling

- Use Tailwind CSS (if configured).
  OR
- Use CSS Modules (if configured).

- No inline styles.
- No styled-components unless already used in project.
- Keep class names clean and consistent.

---

## Performance

- Prevent unnecessary re-renders.
- Use `React.memo` only when beneficial.
- Avoid inline functions in JSX when avoidable.
- Use `useCallback` and `useMemo` carefully (not blindly).

---

## Accessibility

- Always use semantic HTML.
- Add aria attributes when needed.
- Ensure buttons are real `<button>` elements.
- Images must include `alt` text.

---

## Naming Conventions

- Components → PascalCase
- Variables → camelCase
- Constants → UPPER_CASE
- Hooks → useSomething
- Files → kebab-case or PascalCase (be consistent)

---

## Code Quality

- Avoid console.log in production code.
- Handle errors gracefully.
- Use early returns instead of nested conditionals.
- Keep logic outside JSX when possible.

---

## Testing (If Present)

- Write unit tests for logic-heavy components.
- Avoid testing implementation details.
- Prefer testing user behavior.

---

If unsure, generate the most maintainable and readable solution.

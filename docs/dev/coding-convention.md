## Clean Code Checklist (JS)

### Naming, Variables

- Use `camelCase` for variable (let/var) and function names
- Use `PascalCase` for class names
- Use `SNAKE_CASE` for constants
- For boolean properties/methods, use `is` or `has` as a prefix
- Avoid typos in names
- Prefer `let` over `var`
- Use `const` for all references and fixed values
- Avoid magic numbers and meaningless literal values in code
- Use meaningful and readable variable names
- (**Optional**) Keep function names consistent, short, and concise
- (**Optional**) Use names that are searchable and self-explanatory
- Avoid abbreviations or names that require guessing
- Avoid overly long names and unnecessary prefixes
- (**Optional**) Use default parameters instead of complex conditional checks

### Functions

- (**Optional**) Limit function arguments (ideally 2 or fewer)
- Each function should do exactly one thing
- Function names should clearly describe what they do
- Remove duplicated code
- Avoid unnecessary dependencies
- (**Optional**) Encapsulate conditions
- (**Optional**) Avoid negated conditions
- (**Optional**) Avoid explicit type-checking when possible
- Remove dead code
- (**Optional**) Keep callers and callees close to each other
- (**Optional**) Return early from functions when possible

### Classes

- Prefer ES2015/ES6 classes over ES5 plain functions
- (**Optional**) Prefer using small, focused methods

### Asynchronous

- (**Optional**) Prefer Promises over callbacks
- (**Optional**) Prefer `async/await` over raw Promises for readability

### Error handling

- Do not ignore caught errors
- Do not ignore rejected Promises

### Comments

- Only comment complex or non-obvious logic
- Do not keep commented-out code in the codebase
- Do not use comments as change history
- Avoid placeholder or marker comments
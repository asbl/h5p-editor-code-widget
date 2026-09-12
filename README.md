H5P-editor-code-widget
========================

Code widget for H5P. Provides two H5PEditor form widgets built on top of
[H5P.LibCodeTools](https://codeberg.org/a_siebel/h5p-lib-code-tools):

* `codeWidget` — a syntax-highlighted code editor field for `semantics.json`.
* `pythonQuestionShowWhen` — a generic wrapper that shows/hides another field
  based on the value of sibling fields.

Used by [H5P.PythonQuestion](https://codeberg.org/a_siebel/h5p-python-question),
H5P.JavaQuestion, H5P.AutomataQuestion and H5P.SQLQuestion.

`codeWidget`
------------

Renders a code editor (CodeMirror-based, via `H5P.LibCodeTools`) instead of a
plain textarea for a `text` field.

```json
{
  "name": "startingCode",
  "type": "text",
  "widget": "codeWidget",
  "label": "Starting code",
  "optional": true,
  "options": [
    {
      "language": "python",
      "theme": "dark",
      "showAlways": false
    }
  ]
}
```

Only `options[0]` is read. Supported keys, all optional:

| Key          | Type    | Default  | Description                                                                                              |
|--------------|---------|----------|------------------------------------------------------------------------------------------------------------|
| `language`   | string  | `python` | Editor syntax mode, e.g. `python`, `java`, `sql`, `json`, `markdown`.                                    |
| `theme`      | string  | `light`  | `light` or `dark` editor theme.                                                                          |
| `showAlways` | boolean | `false`  | If the field is `optional`, show the editor immediately instead of behind a "Show Editor" toggle button. |

If the field is `optional` and `showAlways` is not set, the editor starts
collapsed behind a toggle button, and the field fails validation only when it
is required (`optional: false`) and left empty.

`pythonQuestionShowWhen`
------------------------

Wraps any other field/widget and only shows it while a set of rules on other
fields in the same form are satisfied.

```json
{
  "name": "blocklyCategories",
  "type": "text",
  "widget": "pythonQuestionShowWhen",
  "showWhen": {
    "type": "or",
    "rules": [
      { "field": "options/editorMode", "equals": ["blocks", "both"] }
    ]
  }
}
```

`showWhen` (required) options:

| Key              | Type              | Default                | Description                                                                                                                                                    |
|------------------|-------------------|------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `rules`          | array             | —                      | List of `{ field, equals }` rules. `field` is a path resolved via `H5PEditor.findField` relative to the current group; `equals` is a value or array of values. |
| `type`           | `'and'` \| `'or'` | `'or'`                 | How the rules are combined.                                                                                                                                    |
| `widget`         | string            | the field's own `type` | Widget used to actually render the field once shown.                                                                                                           |
| `detach`         | boolean           | `false`                | Remove the field from the DOM when hidden instead of just hiding it with CSS.                                                                                  |
| `nullWhenHidden` | boolean           | `false`                | Clear the field's value whenever it becomes hidden.                                                                                                            |

Rules can reference `select`, `library` and `boolean` fields; other field
types are ignored (the rule never matches).

Development
-----------

```bash
npm install
npm run build   # production bundle into dist/
npm run watch   # rebuild on change
npm test        # vitest
npm run lint    # stylelint + eslint
```

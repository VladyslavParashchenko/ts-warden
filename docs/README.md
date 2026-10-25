# Configuration reference

`ts-warden` is configured with two kinds of YAML files:
- a **project manifest** that maps globs to rules files;
- **rules files** that describe what the matched files must contain.

| Page                                    | Describes                                              |
| --------------------------------------- | ------------------------------------------------------ |
| [Project manifest](project-manifest.md) | Groups, globs and how paths are resolved               |
| [Rules file](rules-file.md)             | Top-level keys of a rules file and the `fileName` rule |
| [Classes](classes.md)                   | Options of the `classes` section                       |
| [Methods](methods.md)                   | Options of `classes.methods`                           |
| [Functions](functions.md)               | Options of the `functions` section                     |
| [Common values](common-values.md)       | Counts, names and decorators shared by several options |

## Conventions used in these pages

- **Every option is optional.** An option that is not set is not checked.
- **Unknown keys are an error.** A typo in an option name fails when the config is loaded instead of silently disabling the check.
- **Rule id** is what the output shows next to each violation, after the group name: `controllers/classes.export`. It follows the path of the option in the rules file.
- **Messages** are quoted exactly as the analyzer prints them, with sample names.

A complete example lives in [demos/](../demos/).

# Project manifest

The project manifest is the entry point. It lists groups of files and the rules file for each group.

```yaml
controllers:
    - glob: src/controllers/**/*.controller.ts
      config: ./controller.yml
use-cases:
    - glob: src/use-cases/**/*.use-case.ts
      config: ./use-case.yml
    - glob: src/legacy/**/*.service.ts
      config: ./use-case.yml
```

## Location

Configuration lives in a `.ts-warden` directory in the project root, next to the rules files:

```
my-project/
├── .ts-warden/
│   ├── project-manifest.yml
│   ├── controller.yml
│   └── use-case.yml
├── src/
└── tsconfig.json
```

Create it with `ts-warden init` (add `--git-ignored` to keep it out of git; see the [main README](../README.md#creating-a-config)).

The CLI reads `.ts-warden/project-manifest.yml` from the current directory. Pass another path with `-c`:

```sh
ts-warden -c tools/lint/project-manifest.yml
```

The **project root** is the parent of the directory that holds the manifest: `my-project/` above, `tools/` in the `-c` example.

| Path                     | Resolved relative to                  |
| ------------------------ | ------------------------------------- |
| `glob`                   | the project root                      |
| `config`                 | the directory that holds the manifest |
| file paths in the output | the project root                      |
| default `tsconfig.json`  | the project root; override with `-p`  |

## Groups

Each top-level key is a group name of your choice. The name appears in the output before the rule id, so pick names that tell where a violation comes from: `controllers/classes.export`.

A group is a list of entries. Each entry has two required keys:

| Key      | Value  | Description                                                 |
| -------- | ------ | ----------------------------------------------------------- |
| `glob`   | string | Files to check, relative to the project root                |
| `config` | string | Rules file applied to those files, relative to the manifest |
- A group can list several entries, for example to apply one rules file to several directories.
- Several groups can share one rules file. It is read only once.
- A file matched by several entries is checked by each of them, and each violation is reported with its group.
- Globs match `.tsx` files only when they say so: use `**/*.tsx` or `**/*.{ts,tsx}`.

## Checking specific files

When the CLI gets file paths, only those files are checked. Each file is checked by the entries whose glob matches it; files that match no glob are skipped. See the [main README](../README.md#checking-specific-files).

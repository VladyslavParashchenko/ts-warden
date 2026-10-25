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

The CLI reads `ts-warden.yml` from the current directory. Pass another path with `-c`:

```sh
ts-warden -c config/project-manifest.yml
```

The directory that contains the manifest is the **project root**:
- globs and `config` paths are resolved relative to it;
- file paths in the output are relative to it;
- `tsconfig.json` in it is used for type resolution when it exists. Pass another one with `-p`.

## Groups

Each top-level key is a group name of your choice. The name appears in the output before the rule id, so pick names that tell where a violation comes from: `controllers/classes.export`.

A group is a list of entries. Each entry has two required keys:

| Key      | Value  | Description                                                     |
| -------- | ------ | --------------------------------------------------------------- |
| `glob`   | string | Files to check, relative to the project root                    |
| `config` | string | Rules file applied to those files, relative to the project root |
- A group can list several entries, for example to apply one rules file to several directories.
- Several groups can share one rules file. It is read only once.
- A file matched by several entries is checked by each of them, and each violation is reported with its group.
- Globs match `.tsx` files only when they say so: use `**/*.tsx` or `**/*.{ts,tsx}`.

## Checking specific files

When the CLI gets file paths, only those files are checked. Each file is checked by the entries whose glob matches it; files that match no glob are skipped. See the [main README](../README.md#checking-specific-files).

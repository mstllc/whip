# whip

Quickly duplicate project templates

## Usage

1. Set environment variable `WHIP_TEMPLATES_DIR` to the directory that contains your templates.
2. `npm install` from this repos root directory to install dependecies.
3. `npm link` from this repos root directory to link `whip` command globally.
4. Run `whip` from the directory that you want to copy template files to.

## Templates

The `whip` command will scan the templates directory for sub-directories and read their `package.json` file to pull the `name` property, used to populate the template selection menu. Upon selection, all files and directories in the selected template's directory will be copied to the directory where the `whip` command was run. If a `package.json` file doesn't exist in the direcotry where the command was run, one will be created with the template's `package.json` as a reference for dependencies and scripts. If a `package.json` file does exists, dependencies and scripts from the template's `package.json` will be merged into it.

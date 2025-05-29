# Netivo Scripts

Automation tool for developing front end works in projects meant for wordpress theme development. But you can se it in other projects as well.

It allows you to process:
- styles
- javascript scripts
- gutenberg blocks

## Installation
To install just run the command:

```npm install @netivo\scripts```

## How to use

To run inside your project you must modify your `package.json` file.
It must contain proper name, it will be used as naming base for compiled scripts or styles.
You have to also add the scripts to develop and build, you do it by inserting this piece of code:

```json
"scripts": {
    "develop": "netivo-scripts develop",
    "build": "netivo-scripts build",
    "lint": "netivo-scripts lint"
}
```

If you want to create the gutenberg blocks, you also need to specify the gutenberg destination path by adding:

```json
"gutenberg": "destination path"
```

Your final file may look like:

```json
{
  "name": "project-name",
  "version": "1.0.0",
  "description": "...",
  "main": "./sources/js/index.js",
  "scripts": {
    "develop": "netivo-scripts develop",
    "build": "netivo-scripts build",
    "lint": "netivo-scripts lint"
  },
  "gutenberg": "Netivo/Project/Theme/Admin/views/gutenberg",
  "author": "Netivo <biuro@netivo.pl> (http://netivo.pl)",
  "license": "ISC",
  "dependencies": {
    "@netivo/scripts": "^1.3",
    "@glidejs/glide": "^3.4.1",
    "basiclightbox": "^5.0.4",
    "choices.js": "^10.1.0"
  }
}
```

If you have everything ready there is also a needed structure of the files:

```
├── sources
│   ├── sass
│   │   ├── entries
│   │   │   ├── *.scss 
│   │   ├── **/*.css
│   ├── javascrit
│   │   ├── entries
│   │   │   ├── *.js
│   │   ├── **/*.js
│   ├── gutenberg
│   │   ├── **
│   │   │   ├── index.js 
│   │   │   ├── **/*.js 
```

In entries you mas store entry points for processing, each file will create separate resulting file in dist directory.
Final file names are created like: 

``[Project Name]-[Entry Name].[extension]``

But when the entry name is `index` or `main` it will be only the project name.

When developing gutenberg blocks, every block or plugin must be inserted in separate directory. Entry point for every block is file `index.js`.

To run your project you just run commands:

```npm run develop``` - to start developing with watcher

```npm run build``` - to build project

```npm run lint action``` - to lint project files
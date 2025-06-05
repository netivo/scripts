import stylelint from "stylelint";
import path from "path";
import {ESLint} from "eslint";
import wpPlugin from "@wordpress/eslint-plugin";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import prettierPlugin from "eslint-plugin-prettier";
import * as prettier from "prettier";

const lintCss = (file = null) => {
    return new Promise((resolve, reject) => {
       import("./../config/stylelintrc.json", {
           with: {
               type: "json",
           },
       }).then(res => {
           if(file === null) {
               file = path.resolve(process.cwd(), 'sources', '**/*.scss')
           }
           stylelint.lint({
               files: file,
               config: res.default,
               formatter: "verbose"
           }).then(result => {
               resolve(result);
           }).catch(error => {
               reject(error);
           })
       }).catch(error => {
           reject(error);
       });
    });
}

const lintCssFix = (file = null) => {
    return new Promise((resolve, reject) => {
        import("./../config/stylelintrc.json", {
            with: {
                type: "json",
            },
        }).then(res => {
            if(file === null) {
                file = path.resolve(process.cwd(), 'sources', '**/*.scss')
            }
            stylelint.lint({
                files: file,
                config: res.default,
                formatter: "verbose",
                fix: true
            }).then(result => {
                resolve(result);
            }).catch(error => {
                reject(error);
            })
        }).catch(error => {
            reject(error);
        });
    });
}

const lintJs = (file = null) => {
    return new Promise((resolve, reject) => {
        const config = {
            plugins: {
                "@wordpress": wpPlugin,
                "@typescript-eslint": tsPlugin,
                "prettier": prettierPlugin
            },
            rules: {
                ...wpPlugin.configs.recommended.rules,
                ...tsPlugin.configs.recommended.rules,
                "prettier/prettier": "error",
                "no-console": ["warn", { allow: ["error"] }]
            }
        }
        let linter = new ESLint({
            overrideConfigFile: true,
            overrideConfig: config
        });
        if(file === null) {
            file = path.resolve(process.cwd(), 'sources', '**/*.js')
        }
        linter.lintFiles([file]).then(result => {
            linter.loadFormatter("stylish").then(res => {
                let results = res.format(result);
                resolve(results);
            });
        }).catch(error => {
            reject(error);
        })
    })
}
const lintJsFix = (file = null) => {
    return new Promise((resolve, reject) => {
        const config = {
            plugins: {
                "@wordpress": wpPlugin,
                "@typescript-eslint": tsPlugin,
                "prettier": prettierPlugin
            },
            rules: {
                ...wpPlugin.configs.recommended.rules,
                ...tsPlugin.configs.recommended.rules,
                "prettier/prettier": "error",
                "no-console": ["warn", { allow: ["error"] }]
            }
        }
        let linter = new ESLint({
            overrideConfigFile: true,
            overrideConfig: config,
            fix: true
        });
        if(file === null) {
            file = path.resolve(process.cwd(), 'sources', '**/*.js')
        }
        linter.lintFiles([file]).then(result => {
            ESLint.outputFixes(result).then(r => {
                linter.loadFormatter("stylish").then(res => {
                    let results = res.format(result);
                    resolve(results);
                });
            });

        }).catch(error => {
            reject(error);
        })
    })
}

export default {
    lintCss: lintCss,
    lintCssFix: lintCssFix,
    lintJs: lintJs,
    lintJsFix: lintJsFix
}
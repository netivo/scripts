import stylelint from "stylelint";
import path from "path";
import {ESLint} from "eslint";
import wpPlugin from "@wordpress/eslint-plugin";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import prettierPlugin from "eslint-plugin-prettier";

const lintCss = () => {
    return new Promise((resolve, reject) => {
       import("./../config/stylelintrc.json", {
           with: {
               type: "json",
           },
       }).then(res => {
           stylelint.lint({
               files: path.resolve(process.cwd(), 'sources', '**/*.scss'),
               config: res.default,
               formatter: "verbose"
           }).then(result => {
               resolve(result);
           }).catch(error => {
               reject(error);
           })
       });
    });
}

const lintCssFix = () => {
    return new Promise((resolve, reject) => {
        import("./../config/stylelintrc.json", {
            with: {
                type: "json",
            },
        }).then(res => {
            stylelint.lint({
                files: path.resolve(process.cwd(), 'sources', '**/*.scss'),
                config: res.default,
                formatter: "verbose",
                fix: true
            }).then(result => {
                resolve(result);
            }).catch(error => {
                reject(error);
            })
        });
    });
}

const lintJs = () => {
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
            config
        });

        linter.lintFiles([path.resolve(process.cwd(), 'sources', '**/*.js')]).then(result => {
            console.log(result);
            resolve(result);
        }).catch(error => {
            reject(error);
        })
    })
}
const lintJsFix = () => {
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
            config,
            fix: true
        });

        linter.lintFiles([path.resolve(process.cwd(), 'sources', '**/*.js')]).then(result => {
            console.log(result);
            resolve(result);
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
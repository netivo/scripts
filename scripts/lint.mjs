import stylelint from "stylelint";
import path from "path";

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

export default {
    lintCss: lintCss,
    lintCssFix: lintCssFix
}
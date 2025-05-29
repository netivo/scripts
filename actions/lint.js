
import lint from "../scripts/lint.mjs";
const lintCss = () => {
    lint.lintCss().then(result => {
        console.log(result.report);
    })
};

const lintCssFix = () => {
    lint.lintCssFix().then(result => {
        console.log(result.report);
    })
}

const [actionName, ...args] = process.argv.slice( 2 );

if(actionName !== undefined) {
    if(actionName === 'css') {
        lintCss();
    } else if(actionName === 'css-fix') {
        lintCssFix();
    }
} else {
    lintCss();
}

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
const lintJs = () => {
    lint.lintJs().then(result => {
        console.log(result);
    })
};

const lintJsFix = () => {
    lint.lintJsFix().then(result => {
        console.log(result);
    })
}

const [actionName, ...args] = process.argv.slice( 2 );

if(actionName !== undefined) {
    if(actionName === 'css') {
        lintCss();
    } else if(actionName === 'css-fix') {
        lintCssFix();
    } else if(actionName === 'js') {
        lintJs();
    } else if(actionName === 'js-fix') {
        lintJsFix();
    }
} else {
    lintCss();
    lintJs();
}

const {src, dest} = require('gulp');

function build(cb) {
    src("src/**/*").pipe(dest("dist"));
    cb();
};

exports.build = build;

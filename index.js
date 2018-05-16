/* 
 *  A simple filesystem watcher that allows you to hook custom actions on modified files
 *  Ramit Mitra
 *  Copyright, 2018 [Ramit]Mitra
 */

/* loading framework dependencies */
const watch = require('node-watch');
const path = require('path');
const shell = require('shelljs');

/* loading configuration */
const config = require('./config/config');

/* validate loaded configuration */
require('./validator/config')(config.dir);

/* welcome message */
require('./module/welcome')(config.dir);

/* 
 * VALIDATE DEPENDENCIES ARE PRESENT
 * ATTEMPT TO SETUP MISSING DEPENDENCIES
 */
// 1. validate if php is present
if (!shell.which('php')) {
    shell.echo('\x1b[31mSorry, this script requires PHP');
    shell.exit(1);
}
// 2. validate if npm is present 
if (!shell.which('npm')) {
    shell.echo('\x1b[31mSorry, this script requires NPM');
    shell.exit(1);
}
// 3. validate if composer is present
if (!shell.which('composer')) {
    shell.echo('\x1b[31mSorry, this script requires COMPOSER');
    shell.exit(1);
}
// 4. validate if other packages are available
// a. phpcs/phpcbf
if (!shell.which('phpcs') || !shell.which('phpcbf')) {
    shell.echo('\x1b[31mYou donot seem to have PHP CodeSniffer installed.');
    shell.echo('\x1b[32mThis dependency will now be installed, please wait...');
    // installing php_codesniffer
    if (shell.exec('composer global require squizlabs/php_codesniffer=*').code !== 0) {
        shell.echo('\x1b[31mError: Installing PHP CodeSniffer failed, this program will now terminate !!!');
        shell.exit(1);
    } else {
        shell.echo('\x1b[32m✓ PHP CodeSniffer installed.');
    }
}
// b. stylelint/eslint
if (!shell.which('stylelint')) {
    shell.echo('\x1b[31mYou donot seem to have STYLELINT installed.');
    shell.echo('\x1b[32mThis dependency will now be installed, please wait...');
    // installing stylelint
    if (shell.exec('npm install -g stylelint').code !== 0) {
        shell.echo('\x1b[31mError: Installing Stylelint failed, this program will now terminate !!!');
        shell.exit(1);
    } else {
        shell.echo('\x1b[32m✓ STYLELINT installed.');
    }
} else if (!shell.which('eslint')) {
    shell.echo('\x1b[31mYou donot seem to have ESLINT installed.');
    shell.echo('\x1b[32mThis dependency will now be installed, please wait...');
    // installing eslint
    if (shell.exec('npm install -g eslint').code !== 0) {
        shell.echo('\x1b[31mError: Installing ESlint failed, this program will now terminate !!!');
        shell.exit(1);
    } else {
        shell.echo('\x1b[32m✓ ESLINT installed.');
    }
}
// 5. FINALLY !
shell.echo('\033[1;32m✓ ALL DEPENDENCIES ARE PRESENT\x1b[37m\n');

/* INITIATE WATCHDOG ACTIVITY  */
watch(config.dir, {
    recursive: true,
    delay: 555
}, function (event, name) {
    /* notify about filechange */
    console.log('\033[0;93m✚ File \033[1;32m%s \033[0;93mchanged\033[0;37m', name);

    /* now we hook custom actions based on filetype */
    // triggered on create or modify
    if (event == 'update') {
        switch (path.extname(name)) {
            case '.php':
                //a. run phpcbf
                console.log('\033[1;35mRunning PHPCBF to fix possible syntactical issues\033[0;37m');
                shell.exec('phpcbf --standard=PSR2 ' + name);
                break;
            case '.css':
                //a. run css linting in fix mode
                // shell.exec('pwd');
                shell.exec('stylelint "' + name + '" --fix');
                break;
            case '.js':
                //a. run js linting in fix mode
                shell.exec('eslint "' + name + '" --fix');
                break;
            default:
                /* hook any default action if needed */
                break;
        }
    }
    // triggered on delete
    else if (event == 'remove') {

    }
    /* finally */
    console.log('\033[0;93m✔ File Validated\033[0;37m');
});
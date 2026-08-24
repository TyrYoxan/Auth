const {config} = require("../config/env");
const env = config.NODE_ENV;

/**
 * Simple script to send styled messages to the terminal
 */

const styles = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    redBright: "\x1b[1;91m",
    blue: "\x1b[34m",
    yellow: "\x1b[33m",
    gris: "\x1b[37m",
};

function choseColor(level){
    let color = '';
    switch (level){
        case "info":
            color = styles.blue;
            break;
        case "error":
             color = styles.red;
             break;
        case "warn":
             color = styles.yellow;
             break;

        case "fatal":
            color = styles.redBright;
            break;
        default:
            color = styles.gris;
            break;
    }
    return color;
}

function centrale (msg, level, context){
    if (env === "development" || env === "test") {
        const color = choseColor(level);
        const timestamp = new Date().toISOString();
        console.log(`${styles.reset}[${timestamp}] ${styles.bright}${color}${level} : ${msg} ${context? '\n'+context : ''}`);
    }else if (env === "production") {
        if (level === "debug") {
            return;
        }
        let display = {
            'level': level,
            'message': msg,
            'timestamp': new Date().toISOString(),
            'requestId': null,
            'service': null
        }
        if (context !== undefined) {
            Object.assign(display, context)
        }
        console.log(display);
    }
}
function info(msg, context) {
    centrale(msg, 'info', context);
}

function debug(msg, context) {
    centrale(msg, 'debug', context);
}

function warn(msg, context) {
    centrale(msg, 'warn', context);
}

function error(msg, context) {
    centrale(msg, 'error', context);
}

function fatal(msg, context) {
    centrale(msg, 'fatal', context);
}

module.exports = {debug, info, warn, error, fatal};
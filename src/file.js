import fs from "fs";
import path from "path";
import crypto from "crypto";
import logColor from "colors";

const LOG_TYPE = {
    WARNING: 1,
    ERROR: 2,
    LOG: 3,
    DONE: 4
};

const styles = {
    'bold': ['\x1B[1m', '\x1B[22m'],
    'italic': ['\x1B[3m', '\x1B[23m'],
    'underline': ['\x1B[4m', '\x1B[24m'],
    'inverse': ['\x1B[7m', '\x1B[27m'],
    'strikethrough': ['\x1B[9m', '\x1B[29m'],
    'white': ['\x1B[37m', '\x1B[39m'],
    'grey': ['\x1B[90m', '\x1B[39m'],
    'black': ['\x1B[30m', '\x1B[39m'],
    'blue': ['\x1B[34m', '\x1B[39m'],
    'cyan': ['\x1B[36m', '\x1B[39m'],
    'green': ['\x1B[32m', '\x1B[39m'],
    'magenta': ['\x1B[35m', '\x1B[39m'],
    'red': ['\x1B[31m', '\x1B[39m'],
    'yellow': ['\x1B[33m', '\x1B[39m'],
    'whiteBG': ['\x1B[47m', '\x1B[49m'],
    'greyBG': ['\x1B[49;5;8m', '\x1B[49m'],
    'blackBG': ['\x1B[40m', '\x1B[49m'],
    'blueBG': ['\x1B[44m', '\x1B[49m'],
    'cyanBG': ['\x1B[46m', '\x1B[49m'],
    'greenBG': ['\x1B[42m', '\x1B[49m'],
    'magentaBG': ['\x1B[45m', '\x1B[49m'],
    'redBG': ['\x1B[41m', '\x1B[49m'],
    'yellowBG': ['\x1B[43m', '\x1B[49m']
}


/**
 * 不同类型的日志打印
 * @param {String} message 日志信息
 * @param {Number} type 日志类型
 */
function log(message, type = LOG_TYPE.LOG) {
    let logText = ['', 'Warning', 'Error', 'Log', 'Success']
    message = `[${logText[type]}][${message}]`;

    switch (type) {
        case LOG_TYPE.WARNING:
            console.log(styles['yellow'][0] + '%s' + styles['yellow'][1], message);
            break;
        case LOG_TYPE.ERROR:
            console.log(styles['red'][0] + '%s' + styles['red'][1], message);
            break;
        default:
            console.log(message);
    }
}

function scanFolder(folder) {
    var fileList = [],
        folderList = [],
        itemList = [],
        walk = function(folder, fileList, folderList) {
            var files = fs.readdirSync(folder);
            files.forEach(function(item) {
                var tmpPath = folder + '/' + item,
                    stats = fs.statSync(tmpPath);

                if (stats.isDirectory()) {
                    walk(tmpPath, fileList, folderList);
                    folderList.push(path.resolve(tmpPath));
                    itemList.push(item);
                } else {
                    fileList.push(path.resolve(tmpPath));
                }
            });
        };

    walk(folder, fileList, folderList);

    return {
        files: fileList,
        folders: folderList,
        items: itemList
    };
}

function copyFile(filePath, outPath) {
    createFolder(path.dirname(outPath));
    fs.copyFileSync(filePath, outPath);
    // fs.createReadStream(filePath).pipe(fs.createWriteStream(outPath));
}

function createFolder(folder, callback) {
    try {
        if (fs.existsSync(folder)) return;

        let list = [folder];
        folder = path.dirname(folder);
        while (!fs.existsSync(folder)) { //检查父目录是否存在
            list.push(folder);
            folder = path.dirname(folder);
        }

        while (list.length > 0) {
            fs.mkdirSync(list.pop());
        }

        if (callback) callback();
    } catch (e) {
        console.log(e);
    }
}

function getFileMd5(rootPtah, filePath, sourcePath) {
    var md5srcPath = sourcePath.substring(0 , 1) == "/" ? path.join(rootPtah, sourcePath) : path.join(path.dirname(filePath), sourcePath);
    if (!fs.existsSync(md5srcPath)) {
        // 两种添加颜色的方法
        // log(`文件${filePath}中引用的${sourcePath}不存在，请检查代码`, LOG_TYPE.ERROR);
        console.log(logColor.red(`文件${filePath}中引用的${sourcePath}不存在，请检查代码`));
        return "";
    }
    var fileDate = Date.parse(fs.statSync(md5srcPath).mtime) + "",
        md5 = crypto.createHash('md5').update(fileDate).digest('hex').substr(0, 7);
    return md5;
}

function getFileList(filePath) {
    var scanData = scanFolder(filePath),
        fileArr = [];

    scanData.files.forEach((val) => {
        fileArr.push(val);
    });
    return fileArr;
}

export {
    getFileMd5,
    getFileList,
    LOG_TYPE,
    log
}
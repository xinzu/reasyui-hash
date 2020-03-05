import fs from "fs";
import path from "path";
import crypto from "crypto";
import logColor from "colors-console";

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
        console.log(logColor("red", `文件${filePath}中引用的${sourcePath}不存在，请检查代码`));
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
    getFileList
}
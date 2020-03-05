import fs from "fs";
import path from "path";
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
export {
    createFolder,
    copyFile,
    scanFolder
}
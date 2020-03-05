import fs from "fs";
import path from "path";
import {
    createFolder,
    copyFile,
    scanFolder
} from "./file";

const crypto = require('crypto');

// 正则 from https://github.com/yuhonyon/gulp-yfy-rev
const ASSET_REG = {
    "SCRIPT": /(<script[^>]+src=)['"]([^'"]+)["']/ig,
    "STYLESHEET": /(<link[^>]+href=)['"]([^'"]+)["']/ig,
    "IMAGE": /(<img[^>]+src=)['"]([^'"]+)["']/ig,
    "BACKGROUND": /(url\()(?!data:|about:)([^)]*)/ig
};

const imgExt = [".png", ".jpg", ".jpeg", ".bmp", ".gif", ".ico"];

var filePathList = []; // 文件列表


function getFileList(filePath) {
    var scanData = scanFolder(filePath);

    scanData.files.forEach((val) => {
        filePathList.push(val);
    });
}

function fileHash(config) {
    // 先拿到所有的文件路径
    getFileList(config.filePath);
    // 创建目录
    var distFilePath;
    createFolder(config.outPath);
    filePathList.forEach((file) => {
        // 复制文件及文件夹
        copyFile(file, path.join(config.outPath, path.relative(config.filePath, file)));
    });

    filePathList.forEach((file) => {
        // 读取文件内容
        // 修改资源文件后缀
        var data = fs.readFileSync(file, 'utf8');
        distFilePath = path.join(config.outPath, path.relative(config.filePath, file));
        if (imgExt.indexOf(path.extname(file)) == -1) {
            // 不是图片，修改内容
            for (var type in ASSET_REG) {
                data = data.replace(ASSET_REG[type], function (str, tag, src) {
                    // 去掉当前hash值和外层引号
                    src = src.replace(/^["']|["']$/g, "")
                    if (src.lastIndexOf("?") > 0) {
                        src = src.slice(0, src.lastIndexOf("?"));
                    }
                    // 过滤非资源链接
                    // 链接地址不作修改
                    if (!/\.[^\.]+$/.test(src) || /^https?:\/\//.test(src)) {
                        return str;
                    }
                    // https://www.cnblogs.com/chengxs/p/8313598.html
                    var srcPath = path.join(path.dirname(file), src),
                        fileDate = Date.parse(fs.statSync(srcPath).mtime) + "",
                        md5 = crypto.createHash('md5').update(fileDate).digest('hex').substr(0, 7);
                    src = src.replace(/(\.[^\.]+)$/, "$1?" + md5);

                    return tag + '"' + src + '"';
                });
            }
            fs.writeFileSync(distFilePath, data);
        }
    });
    console.log("done，文件保存在", config.outPath);
}


export default fileHash;
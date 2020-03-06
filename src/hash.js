import fs from "fs";
import path from "path";
import {
    getFileList,
    getFileMd5,
    LOG_TYPE,
    log
} from "./file";

import logColor from "colors";

// 正则 from https://github.com/yuhonyon/gulp-yfy-rev
const ASSET_REG = {
    "SCRIPT": /(<script[^>]+src=)['"]([^'"]+)["']/ig,
    "STYLESHEET": /(<link[^>]+href=)['"]([^'"]+)["']/ig,
    "IMAGE": /(<img[^>]+src=)['"]([^'"]+)["']/ig,
    "BACKGROUND": /(url\()(?!data:|about:)([^)]*)/ig
};

const imgExt = [".png", ".jpg", ".jpeg", ".bmp", ".gif", ".ico"];

var filePathList = []; // 文件列表


function fileHash(config) {
    var inPath = config.filePath; // 源代码路径
    // 先拿到所有的文件路径
    filePathList = getFileList(inPath);

    filePathList.forEach((file) => {
        // 读取文件内容
        // 修改资源文件后缀
        var data = fs.readFileSync(file, 'utf8');
        path.join("C:/Users/Administrator/Desktop/AC5_cn_normal_src", path.relative("C:/Users/Administrator/Desktop/AC5_cn_normal_src/js/network.js", "/img/5g.png"))
        if (imgExt.indexOf(path.extname(file)) == -1) {
            // 不是图片，修改内容
            for (var type in ASSET_REG) {
                data = data.replace(ASSET_REG[type], (str, tag, src) => {

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
                    var md5 = getFileMd5(inPath, file, src);

                    src = src.replace(/(\.[^\.]+)$/, "$1?" + md5);
                    return tag + '"' + src + '"';
                });
            }
            fs.writeFileSync(file, data);
        }
    });
    // log("DONE",  LOG_TYPE.DONE);

    console.log(logColor.green(`DONE`));
    log(`如果在js中生成的html代码引用资源导致路径错误，请手动修改`, LOG_TYPE.ERROR);
}

export default fileHash;
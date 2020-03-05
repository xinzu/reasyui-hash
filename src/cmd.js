import cfg from '../package.json';
import path from 'path';
import fs from 'fs';
const inquirer = require('inquirer');


function handleVersion() {
    console.log('v' + cfg.version);
}

function handleHelp() {
    console.log('help:\r\n\t -v\t获取版本号\r\n\t -h\t获取帮助信息');
}

function handle(arg) {
    if (!arg) {
        return;
    }

    arg = arg.replace(/^-/, '').toLowerCase();
    switch (arg) {
        case 'v':
            handleVersion();
            break;
        case 'h':
            handleHelp();
            break;
    }
}


const valid = {
    // 已有文件夹或不存在的文件夹
    specialfile(val) {
        val = val || '';
        val = val.replace(/(^\s*)|(\s*$)/g, '');
        if (val === '') {
            return '必填';
        }
        return (fs.existsSync(val) && valid.folder(val)) || (!fs.existsSync(val));
    },
    folder(val) {
        val = val || '';
        val = val.replace(/(^\s*)|(\s*$)/g, '');
        if (val === '') {
            return '必填';
        }
        if (!path.isAbsolute(val)) {
            val = path.resolve(process.cwd(), val);
        }
        if (!fs.existsSync(val)) {
            return '请输入有效的地址'
        }
        return true;
    },
    // 存在的文件非文件夹
    existFile(val) {
        val = val || '';
        val = val.replace(/(^\s*)|(\s*$)/g, '');
        if (val === '') {
            return '必填';
        }

        if (!path.isAbsolute(val)) {
            val = path.resolve(process.cwd(), val);
        }
        if (path.extname(val) === '' || !fs.existsSync(val)) {
            return '请输入有效的文件地址'
        }
        return true;
    }
}

const baseQuestions = {
    type: 'input',
    name: 'filePath',
    message: '添加HASH的文件地址：',
    validate: valid.folder // 必填，可以是文件也可以是文件夹
};

function getCfg() {
    return inquirer.prompt(baseQuestions)
        .then(answers => {
            return answers;
        });
}

function getDirname(filePath) {
    if (path.extname(filePath) !== '') {
        return path.dirname(filePath);
    }
    return filePath;
}

export { handle, getCfg} ;
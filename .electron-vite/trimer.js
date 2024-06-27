const fs = require('fs');

function get_arg_value(key,args) {
    for (let i = 0; i<args.length; i++) {
        let type_split = args[i].split('=');
        if (type_split[0]===key) {
            return type_split[1];
        }
    }
}

function get_comment_context(line) {
    for (let i = 0 ; i<line.length; i++) {
        if (line[i]==='/' && i>0 && line[i-1]==='/') {
            return line.slice(i);
        }
    }
    return '';
}

function is_blank(char) {
    return char==='\s' || char==='\t' || char==='\n' || char==='\r'
}

/**
 * 返回 -1就是没有被注释过的
 * @param line
 * @returns {number}
 */
function is_commented(line) {
    if (!line) return -1;
    let is = -1;
    let blank = true;
    for (let i = 0; i<line.length ; i++) {
        blank = is_blank(line[i] );
        if (!blank) {
            //到现在为止依然都是空字符
            if (line[i]==='/' && i >0 && line[i-1]==='/') {
                return i;
            }
        }
    }
    return  is;
}

function do_code(file_path,onces) {

    let data = fs.readFileSync(file_path);
    data = data.toString()
    const lines = data.split(/\r?\n/);

    let start = false;
    for (let i = 0; i< lines.length; i++) {
        // 遍历每一行代码
        let value = get_comment_context(lines[i]);
        if (start) {
            if (!!value && value.includes('trim_end')) {
                start = false;
            } else {
                // 进行注释
                if (onces) {
                    let p = is_commented(lines[i]);
                    if (p===-1) {
                        lines[i] = '//  ' + lines[i];
                    }
                } else {
                    lines[i] = '//  ' + lines[i];
                }

            }
        } else {
            if (!!value && value.includes('trim_start')) {
                start = true;
            }
        }

    }

    fs.writeFileSync(file_path,lines.join('\n'))

}

function undo_code(file_path) {

    let data = fs.readFileSync(file_path);
    data = data.toString()
    const lines = data.split(/\r?\n/);

    let start = false;
    for (let i = 0; i< lines.length; i++) {
        // 遍历每一行代码
        let value = get_comment_context(lines[i]);
        if (start) {
            if (!!value && value.includes('trim_end')) {
                start = false;
            } else {
                // 取消注释 只取消一级
                for (let str_i = 0; str_i < lines[i].length ;str_i++) {
                    if (lines[i][str_i]==='/' && str_i>0 && lines[i][str_i-1]==='/') {
                        lines[i]= lines[i].slice(str_i+1);
                        break;
                    }
                }
            }
        } else {
            if (!!value && value.includes('trim_start')) {
                start = true;
            }
        }

    }

    fs.writeFileSync(file_path,lines.join('\n'))

}



const args = process.argv.slice(2);

if (args.length===0)
    throw new Error('参数有问题');
if (args.length<2)
    throw new Error('参数少于最少数量');

let file_path_list = get_arg_value('files',args).split(';');
let type = get_arg_value('type',args);
if (type==='do') {
    for (let file of file_path_list) {
        do_code(file);
    }
} else if ( type ==='do-onces'){
    for (let file of file_path_list) {
        do_code(file,true);
    }
} else if (type==='undo') {
    for (let file of file_path_list) {
        undo_code(file);
    }
}

/**
 * 使用说明
 * node .\trimer.js type=undo files=ok.js
 * 这个脚本只对会添加了// trim_start和 // trim_end注释内的代码进行加载处理。 目前只支持 // 双斜号的方式注释代码
 * 1. 启动 type有三个模式
 *  1.1 do 模式，会对 范围内的代码进行注释。且不管有没有已经被注释
 *  1.2 do-onces 模式，对范围内的代码会先判断有没有被注释，对于已经被注释的将不会在进行注释
 *  1.3 undo 模式，会对范围内的代码进行一级别的取消注释
 * 2. files 使用 ; 分隔符，指定多个文件，对多个文件进行同时处理
 *
 */






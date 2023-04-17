import path from 'path'
const fs = require('fs')

// 获取应用程序目录
const appPath = process.cwd()

// 文件相对路径
const filePath = 'conn.json'

// 文件绝对路径
const absoluteFilePath = path.join(appPath, filePath)

try {
    // 检查文件是否存在
    fs.accessSync(absoluteFilePath, fs.constants.F_OK);
    console.log(`文件 ${absoluteFilePath} 已存在`);
} catch (err) {
    // 如果文件不存在，创建文件
    fs.writeFileSync(absoluteFilePath, '');
    console.log(`文件 ${absoluteFilePath} 创建成功`);
}

// 读取文件
const data = fs.readFileSync(absoluteFilePath, 'utf-8')
let store;
if (data) {
    let json = JSON.parse(data)
    store = new Map(Object.entries(json));
} else {
    store = new Map()
}
console.log(data)

// const Store = require('electron-store');
// const store = new Map();

function getKey(key) {
    return store.get(key);
}

function setKey(key, value) {
    store.set(key, value)

    // 将Map对象转化为JavaScript对象
    const newJsonObj = Object.fromEntries(store.entries());
    // 将JavaScript对象转化为JSON字符串
    const newJsonData = JSON.stringify(newJsonObj);
    console.log(newJsonData)
    fs.writeFileSync(absoluteFilePath, newJsonData, 'utf-8')
}

export { getKey, setKey }
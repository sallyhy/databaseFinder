/**
 * 因为ant.js tab子组件无法与父组件共享变量  所以我们在这儿用外部node单独同步存储一份
 */
let tabs = []

let counter = 0

function setTabs(v) {
    tabs = v;
}

function getTabs() {
    return tabs;
}

function increatCounter() {
    counter = counter + 1
}

function getCounter() {
    return counter;
}

export {getTabs, setTabs, increatCounter, getCounter}
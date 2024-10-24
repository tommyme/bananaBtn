const fs = require('fs');
const path = require('path');

const sourceFilePath = 'monkeyLocal.js'; // 源文件路径

fs.readFile(sourceFilePath, 'utf8', (err, data) => {
  const lines = data.split('\r\n');
  lines[9] += '?a=' + new Date(); // 修改第十行
  console.log(lines.join('\n')); // 打印结果
});

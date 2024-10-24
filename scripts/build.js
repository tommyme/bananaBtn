const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['./src/index.js'], // 入口文件
  bundle: true,                // 打包所有依赖
  outfile: 'dist/bundle.js',   // 输出文件
  minify: true,                // 压缩代码
  sourcemap: true,             // 生成 sourcemap 文件
  target: ['es2015'],          // 目标环境
  globalName: 'mf',         // 全局变量名，用于 UMD 模式
  format: 'iife',              // 输出格式为 IIFE，适合在浏览器中直接使用
}).catch(() => process.exit(1));

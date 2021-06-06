// 所有打包
const fs = require('fs')
const execa = require('execa')

const targets = fs.readdirSync('packages').filter(f => {
  // 过滤非目录
  return fs.statSync(`packages/${f}`).isDirectory
})

async function build(target) {
  // =======
  // 设置一个环境变量TARGET，区分当前打包的是哪个文件夹
  // -w 热更新
  // =======
  await execa('rollup', ['-w', '-c', '--environment', `TARGET:${target}`], { stdio: 'inherit' })
}

function runParallel(targets, iteratorFn) {
  const res = []
  for (const item of targets) {
    const p = iteratorFn(item)
    res.push(p)
  }
  return Promise.all(res)
}

// 对目标依次打包
runParallel(targets, build)
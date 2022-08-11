const { build } = require('esbuild')
const { resolve } = require('path')

const args = require('minimist')(process.argv.slice(2))

const target = args._[0] || 'reactivity'
const format = args.f || 'global'

const pkg = require(
    resolve(__dirname, `../packages/${target}/package.json`)
)

// iife 立即执行函数
// cjs  node的模块
// esm  浏览器esModule
const outputFormat = format.startsWith('global')
    ? 'iife'
    : (
        format === 'cjs' ? 'cjs' : 'esm'
    )

const outfile = resolve(
    __dirname,
    `../packages/${target}/dist/${target}.${format}.js`
)


build({
    // 入口
    entryPoints: [
        resolve(__dirname, `../packages/${target}/src/index.ts`)
    ],
    // 输出
    outfile,
    bundle: true,
    sourcemap: true,
    format: outputFormat,
    globalName: pkg.buildOptions.name,
    platform: format === 'cjs' ? 'node' : 'browser',
    watch: {
        onRebuild(error) {
            if (!error) {
                console.log('重新构建')
            }
        }
    }
}).then(() => {
    console.log('watch')
})

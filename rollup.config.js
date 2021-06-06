import path from 'path'
import json from '@rollup/plugin-json'
import nodeResolve from '@rollup/plugin-node-resolve'
import ts from 'rollup-plugin-typescript2'

// 此处获取当前要打包的目录
const target = process.env.TARGET
const packagesDir = path.resolve(__dirname, 'packages')
const packageDir = path.resolve(packagesDir, target)

const resolve = (url) => {
  return path.resolve(packageDir, url)
}

const name = path.basename(packageDir);

// formats打包对象
const outputConfig = {
  'esm-bundler': {
    file: resolve(`dist/${name}.esm-bundler.js`),
    format: 'es'
  },
  'cjs': {
    file: resolve(`dist/${name}.cjs.js`),
    format: 'cjs'
  },
  'global': {
    file: resolve(`dist/${name}.global.js`),
    format: 'iife'
  },
}

// 当前要打包的目录下的package.json去指定打包的一些细节：输出格式等
const pkg = require(resolve('package.json'))
const { buildOptions } = pkg

function createConfig(format, output) {
  if (format === 'global') {
    output.name = buildOptions.name;
  }
  output.sourcemap = true
  return {
    input: resolve('src/index.ts'),
    output,
    plugins: [
      json(),
      ts({
        tsconfig: path.resolve(__dirname, 'tsconfig.json')
      }),
      nodeResolve()
    ]
  }
}

export default buildOptions.format.map(format => createConfig(format, outputConfig[format]))



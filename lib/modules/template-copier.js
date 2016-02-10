const Promise = require('bluebird')
const path = require('path')
const fs = Promise.promisifyAll(require('fs-extra'))
const glob = Promise.promisify(require('glob'))
const async = Promise.promisifyAll(require('async'))
const extend = require('extend')

const GLOB_IGNORE = [
  'node_modules',
  'node_modules/**',
  'package.json',
  'npm-debug.log',
  '.DS_Store'
]

class TemplateCopier {
  constructor() {

  }

  copy(templateDirectory) {
    let cwd = process.cwd()
    return this._checkForPackageJSON(templateDirectory)
      .then(() => {
        return glob('**/*', {cwd: templateDirectory, ignore: GLOB_IGNORE, dot: true})
      })
      .then(files => {
        console.log(files)
        return async.eachAsync(files, (file, cb) => {
          fs.stat(path.join(templateDirectory, file), (err, stats) => {
            if (err) cb(err)

            if (stats.isDirectory()) {
              fs.mkdirs(path.join(cwd, file), err => {
                cb(err)
              })
            } else if (stats.isFile()) {
              fs.copy(path.join(templateDirectory, file), path.join(cwd, file), err => {
                cb(err)
              })
            } else {
              cb()
            }
          })
        })
      })
  }

  _checkForPackageJSON(templateDirectory) {
    let cwd = process.cwd()
    return fs.statAsync(path.join(cwd, 'package.json'))
      .then(stats => {
        if (stats.isFile()) {
          return this._mergePackageJSON(templateDirectory)
        } else {
          return this._createPackageJSON(templateDirectory)
        }
      })
      .catch({code: 'ENOENT'}, e => {
        return this._createPackageJSON(templateDirectory)
      })
  }

  _createPackageJSON(templateDirectory) {
    let cwd = process.cwd()
    return fs.readFileAsync(path.join(templateDirectory, 'package.json'))
      .then(data => {
        let config = JSON.parse(data.toString())
        config.version = '0.0.0'
        config.name = ''
        config.description = ''
        return fs.writeFileAsync(path.join(cwd, 'package.json'), JSON.stringify(config, null, 2))
      })
  }

  _mergePackageJSON(templateDirectory) {
    let templateConfig
    let cwd = process.cwd()
    return fs.readFileAsync(path.join(templateDirectory, 'package.json'))
      .then(data => {
        templateConfig = JSON.parse(data.toString())
        delete templateConfig.name
        delete templateConfig.description
        delete templateConfig.version
        return fs.readFileAsync(path.join(cwd, 'package.json'))
      })
      .then(data => {
        let cwdConfig = JSON.parse(data.toString())
        extend(true, cwdConfig, templateConfig)
        return fs.writeFileAsync(path.join(cwd, 'package.json'), JSON.stringify(cwdConfig, null, 2))
      })
  }
}

module.exports = TemplateCopier

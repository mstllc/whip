const Promise = require('bluebird')
const path = require('path')
const fs = Promise.promisifyAll(require('fs-extra'))
const extend = require('extend')
const Rsync = require('rsync')

const IGNORE = [
  '/package.json',
  'npm-debug.log',
  '.DS_Store',
  '.git'
]

class TemplateCopier {
  constructor () {}

  copy (templateDirectory) {
    let cwd = process.cwd()
    return this._checkForPackageJSON(templateDirectory)
      .then(() => {
        return new Promise((resolve, reject) => {
          let rsync = new Rsync().set('a').source(templateDirectory + '/').destination(cwd).exclude(IGNORE)
          rsync.execute((error, code, cmd) => {
            if (!error && code === 0) {
              resolve()
            } else {
              reject(error, code)
            }
          })
        })
      })
  }

  _checkForPackageJSON (templateDirectory) {
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

  _createPackageJSON (templateDirectory) {
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

  _mergePackageJSON (templateDirectory) {
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

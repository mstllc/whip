const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const async = Promise.promisifyAll(require('async'))
const path = require('path')

class TemplateScanner {
  constructor() {

  }

  scan(dir) {
    let templates = []

    return new Promise((resolve, reject) => {
      if (!dir) return reject('No directory specified!')

      fs.readdirAsync(dir)
        .then(contents => {
          return async.eachAsync(contents, (file, cb) => {
            if (file === '.git') {
              cb()
              return
            }
            fs.lstatAsync(path.join(dir, file))
              .then(stats => {
                if (stats.isDirectory()) {
                  return fs.readFileAsync(path.join(dir, file, 'package.json'))
                } else {
                  cb()
                }
              })
              .then(data => {
                let config = JSON.parse(data.toString())
                templates.push({
                  name: config.name,
                  description: config.description,
                  path: path.join(dir, file)
                })
                cb()
              })
              .catch(e => {
                cb()
              })
          })
        })
        .then(message => {
          resolve(templates)
        })
        .catch(err => {
          console.log('Error', err)
        })
    })
  }
}

module.exports = TemplateScanner

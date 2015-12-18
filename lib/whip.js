const TemplateScanner = require('./modules/template-scanner.js')
const TemplateCopier = require('./modules/template-copier.js')
const inquirer = require('inquirer')
const config = require('../package.json').whip

const scanner = new TemplateScanner()
const copier = new TemplateCopier()

scanner.scan(config.templatesDir)
  .then(templates => {
    let question = {
      type: 'list',
      name: 'template',
      message: 'Which One You Want?',
      choices: []
    }
    templates.forEach(template => {
      question.choices.push({
        name: template.name,
        value: template
      })
    })
    question.choices.push({
      name: 'Cancel',
      value: false
    })
    return new Promise((resolve, reject) => {
      inquirer.prompt(question, answers => {

        if (!answers.template) {
          reject('No template selected')
        } else {
          resolve(answers.template)
        }
      })
    })
  })
  .then(template => {
    return copier.copy(template.path)
  })
  .catch(error => {
    console.log('There was an error: ', error)
  })

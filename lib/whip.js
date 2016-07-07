const TemplateScanner = require('./modules/template-scanner.js')
const TemplateCopier = require('./modules/template-copier.js')
const inquirer = require('inquirer')
const TEMPLATES_DIR_ENV_VAR = 'WHIP_TEMPLATES_DIR'

if (!process.env[TEMPLATES_DIR_ENV_VAR]) {
  console.error(`Required environment variable '${TEMPLATES_DIR_ENV_VAR}' not set`)
  process.exit(1)
}

const scanner = new TemplateScanner()
const copier = new TemplateCopier()

scanner.scan(process.env[TEMPLATES_DIR_ENV_VAR])
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

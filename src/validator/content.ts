
import { Validator } from './validator'
import chalk from 'chalk'
import _ from 'lodash'
import Octokit from '@octokit/rest'
import { Content } from '../types/schema'

export class ContentValidator extends Validator<Content> {

  public description: string

  constructor (config: Content, owner: string, repo: string, data?: any[]) {
    super(config, data)
    this.description = `${owner}/${repo}/${(config.filter || {}).path}`
  }

  public async validate(octokit: Octokit) {

    if (this.config.enabled === false) {
      console.log(chalk.gray(`Skipping Disabled Content: ${this.config.name}`))
      return 0
    }

    let found = false
    for (const item of this.data) {
      if (this.config.filter) {
        if (item.path.match(this.config.filter.path)) {
          found = true
        }
      }
    }

    if (!found && this.config.disposition === 'required') {
      this.addError('content', `Required file missing [${this.config.name}]: ${(this.config.filter || {}).path}`)
    }

    if (this.errorCount) {
      console.log(chalk.yellow(`Errors: ${this.errorCount}`))
    }

    return super.validate(octokit)
  }
}

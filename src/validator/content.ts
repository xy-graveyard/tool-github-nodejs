
import { Validator } from './validator'
import chalk from 'chalk'
import _ from 'lodash'
import Octokit from '@octokit/rest'
import { Content } from '../types/schema'

export class ContentValidator extends Validator<Content> {

  public owner: string
  public repo: string
  public items: any[]

  constructor (config: Content, owner: string, repo: string, items: any[]) {
    super(config)
    this.owner = owner
    this.repo = repo
    this.items = items
  }

  public toJSON () {
    return _.omit(this, ["config", "octokit", "items"])
  }

  public async validate(octokit: Octokit) {

    if (this.config.enabled === false) {
      console.log(chalk.gray(`Skipping Disabled Content: ${this.config.name}`))
      return 0
    }

    let found = false
    for (const item of this.items) {
      if (item.name.match(this.config.filter)) {
        found = true
      }
    }

    if (!found && this.config.disposition === 'required') {
      this.addError('content', `Required file missing: ${this.config.filter}`)
    }

    if (this.errorCount) {
      console.log(chalk.yellow(`Errors: ${this.errorCount}`))
    }

    return super.validate(octokit)
  }
}

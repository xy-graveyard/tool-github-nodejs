
import { Validator } from './validator'
import chalk from 'chalk'
import _ from 'lodash'
import { RepositoryConfig } from '../config/repository'

export class RepositoryValidator extends Validator<RepositoryConfig> {
  public name: string
  public git: any

  constructor (config: RepositoryConfig, git?: any) {
    super(config)
    this.name = config.name
    this.git = git
  }

  public async validate() {
    if (!this.config.isEnabled()) {
      console.log(chalk.gray(`Skipping Disabled Domain: ${this.config.name}`))
      return 0
    }

    if (this.errorCount) {
      console.log(chalk.yellow(`Errors: ${this.errorCount}`))
    }

    return super.validate()
  }
}

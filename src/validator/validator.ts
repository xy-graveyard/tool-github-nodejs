import chalk from 'chalk'
import { ValidationError } from './error'
import Octokit from '@octokit/rest'
import _ from 'lodash'

export class Validator<T> {
  public config: T
  public errors?: ValidationError[]
  public errorCount = 0

  constructor(config: T) {
    this.config = config
  }

  public toJSON () {
    return _.omit(this, ["config", "octokit"])
  }

  public async validate(octokit: Octokit) {
    if (this.errors) {
      this.errorCount += this.addErrors.length
    }

    return this.errorCount
  }

  public addError(action: string, error: any) {
    this.errors = this.errors || []
    this.errors.push(new ValidationError(action, error))
    console.error(chalk.red(`${action}: ${error}`))
  }

  public addErrors(errors: ValidationError[] | undefined) {
    if (errors) {
      this.errors = this.errors || []
      this.errors = this.errors.concat(errors)
    }
  }

}

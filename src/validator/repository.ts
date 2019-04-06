
import { Validator } from './validator'
import chalk from 'chalk'
import _ from 'lodash'
import Octokit from '@octokit/rest'
import fs from 'fs-extra'
import { Repository } from '../types/schema'

export class RepositoryValidator extends Validator<Repository> {

  public static authValue: string | undefined

  public name: string
  public raw: any = undefined
  public octokit = new Octokit()

  constructor (raw: any) {
    super(raw.name)
    this.name = raw.name
    this.raw = raw
  }

  public async validate() {

    if (this.config.enabled === false) {
      console.log(chalk.gray(`Skipping Disabled Repos: ${this.config.name}`))
      return 0
    }

    if (this.errorCount) {
      console.log(chalk.yellow(`Errors: ${this.errorCount}`))
    }

    return super.validate()
  }
}

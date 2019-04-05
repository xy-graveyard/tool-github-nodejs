
import { Validator } from './validator'
import chalk from 'chalk'
import _ from 'lodash'
import { RepositoryConfig } from '../config/repository'
import Octokit from '@octokit/rest'
import fs from 'fs-extra'

export class RepositoryValidator extends Validator<RepositoryConfig> {

  public static authValue: string | undefined

  public name: string
  public owner: string
  public branch: string
  public git: any
  public octokit = new Octokit()

  constructor (config: RepositoryConfig, git?: any) {
    super(config)
    this.name = config.name
    this.owner = config.owner
    this.branch = config.branch
  }

  public async validate() {
    if (!this.config.isEnabled()) {
      console.log(chalk.gray(`Skipping Disabled Repos: ${this.config.name}`))
      return 0
    }

    this.octokit = new Octokit({ auth: (await fs.readFile('accesstoken.txt')).toString() })

    try {
      this.git = await this.octokit.repos.getBranch({ owner: this.owner, repo:this.name, branch:"master" })
    } catch (ex) {
      if (ex.status === 404) {
        this.addError('branch', `Repo Not Found [${this.owner}/${this.name}:${this.branch}]`)
      }
    }

    if (this.errorCount) {
      console.log(chalk.yellow(`Errors: ${this.errorCount}`))
    }

    return super.validate()
  }
}

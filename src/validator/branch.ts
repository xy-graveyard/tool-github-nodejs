
import { Validator } from './validator'
import chalk from 'chalk'
import _ from 'lodash'
import Octokit from '@octokit/rest'
import fs from 'fs-extra'
import { Branch } from '../types/schema'

export class BranchValidator extends Validator<Branch> {

  public static authValue: string | undefined

  public name: string
  public owner: string
  public repo: string
  public raw: any = undefined
  public octokit = new Octokit()

  constructor (config: Branch, owner: string, repo: string, data?: any) {
    super(config, data)
    this.name = config.name || 'unknown'
    this.owner = owner
    this.repo = repo
  }

  public async validate(octokit: Octokit) {

    let raw: any

    if (!this.config.isEnabled()) {
      console.log(chalk.gray(`Skipping Disabled Repo: ${this.name}`))
      return 0
    }

    this.octokit = new Octokit({ auth: (await fs.readFile('accesstoken.txt')).toString() })

    try {
      raw = await this.octokit.repos.getBranch({ owner: this.owner, repo:this.repo, branch:this.name })
      if (this.config.raw.isEnabled()) {
        this.raw = raw
      }
    } catch (ex) {
      if (ex.status === 404) {
        this.addError('branch', `Repo Not Found [${this.owner}/${this.repo}:${this.name}]`)
      }
    }

    if (this.errorCount) {
      console.log(chalk.yellow(`Errors: ${this.errorCount}`))
    }

    return super.validate(octokit)
  }
}

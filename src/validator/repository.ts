
import { Validator } from './validator'
import chalk from 'chalk'
import _ from 'lodash'
import Octokit from '@octokit/rest'
import { Repository } from '../types/schema'
import { ContentValidator } from './content'

export class RepositoryValidator extends Validator<Repository> {

  public static authValue: string | undefined

  public name: string
  public owner: string
  public language?: string
  public homepage?: string
  public license?: string
  public disabled?: boolean
  public private?: boolean
  public archived?: boolean
  public content: ContentValidator[] = []

  constructor (config: Repository, owner: string, name: string, data?: any) {
    super(config, data)
    this.name = name
    this.owner = owner
    _.merge(this, _.pick(data, ['language', 'private', 'disabled', 'archived', 'homepage', 'license']))
  }

  public async validate(octokit: Octokit) {

    if (this.config.name) {
      let data = this.data
      if (!data) {
        data = (await octokit.repos.get({ owner: this.owner, repo:this.name })).data
      }

      if (this.config.enabled === false) {
        console.log(chalk.gray(`Skipping Disabled Repo: ${this.config.name}`))
      } else {
        this.errorCount += await this.validateContent(octokit)
      }
    }

    return super.validate(octokit)
  }

  private getBranchConfig(name: string) {
    if (this.config.branches) {
      for (const branch of this.config.branches) {
        if (branch.name === name) {
          return branch
        }
      }
    }
  }

  private getMergedBranchConfig(branchName: string) {
    const defaultBranch = this.getBranchConfig("*")
    const branch = this.getBranchConfig(branchName)
    return _.merge({}, defaultBranch, branch)
  }

  private async validateContent(octokit: Octokit) {
    let errorCount = 0
    if (this.config.branches) {
      const items = (await octokit.repos.getContents({ owner: this.owner, repo:this.name, path:"" })).data
      const branch = this.getMergedBranchConfig("*")
      for (const content of branch.content) {
        const validator = new ContentValidator(content, this.owner, this.name, items)
        errorCount += await validator.validate(octokit)
        this.content.push(validator)
      }
    }
    return errorCount
  }
}

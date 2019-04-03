import { MasterConfig } from '../config'
import { Validator } from './validator'
import { RepositoryValidator } from './repository'
import { AWS } from '../aws'
import chalk from 'chalk'
import Octokit from '@octokit/rest'
import fs from 'fs-extra'
import { RepositoryConfig } from '../config/repository'

export class MasterValidator extends Validator<MasterConfig> {

  public repositories: RepositoryValidator[] = []

  constructor(config: MasterConfig) {
    super(config)
  }

  public async validate() {
    this.addRepositoriesFromConfig()
    if (this.config.aws && this.config.aws.enabled) {
      await this.addRepositoriesFromGithub()
    }

    let completedRepositories = 0
    for (const repository of Object.values(this.repositories)) {
      try {
        const errors = await repository.validate()
        completedRepositories++
        console.log(
          `Domain:[${completedRepositories}/${this.repositories.length}]: ${repository.name}`)
        this.errorCount += errors
      } catch (ex) {
        this.addError("MasterValidator.validate", `Unexpected Error: ${ex.message}`)
        console.error(chalk.red(ex.message))
        console.error(chalk.red(ex.stack))
        this.errorCount++
      }
    }

    return super.validate()
  }

  private addRepositoriesFromConfig() {
    if (this.config.repositories) {
      for (const repository of this.config.repositories.values()) {
        if (repository.name !== "default") {
          console.log(chalk.yellow(`Adding Domain from Config: ${repository.name}`))
          const repositoryConfig = this.config.getRepositoryConfig(repository.name)
          this.repositories.push(new RepositoryValidator(repositoryConfig))
        }
      }
    }
  }

  private async addRepositoriesFromGithub() {
    try {
      const auth = (await fs.readFile('accesstoken.txt')).toString()
      const octokit = new Octokit({ auth })

      let page = 1
      while (page > 0) {
        const repos = await octokit.repos.list(
          {
            type: 'all',
            sort: 'full_name',
            direction: 'asc',
            per_page: 100,
            page
          }
        )

        page++
        if (repos.data.length < 100) {
          page = 0
        }

        for (const repo of repos.data) {
          console.log(chalk.gray(`Found Repo: ${repo.full_name}`))
          this.repositories.push(new RepositoryValidator(new RepositoryConfig(repo.full_name), repo))
        }
      }
    } catch (ex) {
      console.error(chalk.red(ex.message))
    }
  }
}

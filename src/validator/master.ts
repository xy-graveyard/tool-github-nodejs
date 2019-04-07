import { Validator } from './validator'
import { RepositoryValidator } from './repository'
import chalk from 'chalk'
import Octokit from '@octokit/rest'
import { GithublintSchemaJson } from '../types/schema'
import _ from 'lodash'

export class MasterValidator extends Validator<GithublintSchemaJson> {

  public repositories: RepositoryValidator[] = []

  constructor(config: GithublintSchemaJson) {
    super(config)
  }

  public async validate(octokit: Octokit) {
    if (this.config.github && this.config.github.enabled) {
      await this.addRepositoriesFromGithub(octokit)
    }

    let completedRepositories = 0
    for (const repository of Object.values(this.repositories)) {
      try {
        const errors = await repository.validate(octokit)
        completedRepositories++
        console.log(
          `Repo:[${completedRepositories}/${this.repositories.length}]: ${repository.owner}/${repository.name}`)
        this.errorCount += errors
      } catch (ex) {
        this.addError("MasterValidator.validate", `Unexpected Error: ${ex.message}`)
        console.error(chalk.red(ex.message))
        console.error(chalk.red(ex.stack))
        this.errorCount++
      }
    }

    return super.validate(octokit)
  }

  private getOwnerConfig(name: string) {
    if (this.config.owners) {
      for (const owner of this.config.owners) {
        if (owner.name === name) {
          return owner
        }
      }
    }
  }

  private getRepoConfig(owner: any, name: string) {
    if (owner.repositories) {
      for (const repository of owner.repositories) {
        if (repository.name === name) {
          return repository
        }
      }
    }
  }

  private getMergedOwnerConfig(ownerName: string) {
    const defaultOwner = this.getOwnerConfig("*")
    const owner = this.getOwnerConfig(ownerName)
    return _.merge({}, defaultOwner, owner)
  }

  private getMergedRepositoryConfig(ownerName: string, repoName: string) {
    const owner = this.getMergedOwnerConfig(ownerName)
    const defaultRepo = this.getRepoConfig(owner, "*")
    const repo = this.getRepoConfig(owner, repoName)
    return _.merge({}, defaultRepo, repo)
  }

  private async addRepositoriesFromGithub(octokit: Octokit) {
    try {
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
          const nameParts = repo.full_name.split('/')
          this.repositories.push(
            new RepositoryValidator(
              this.getMergedRepositoryConfig(repo.owner.login, repo.name), repo.owner.login, repo.name))
        }
      }
    } catch (ex) {
      console.error(chalk.red(ex.message))
    }
  }
}

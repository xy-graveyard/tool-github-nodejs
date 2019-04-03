import { MasterConfig } from '../config'
import { Validator } from './validator'
import { RepositoryValidator } from './repository'
import { AWS } from '../aws'
import chalk from 'chalk'

export class MasterValidator extends Validator<MasterConfig> {

  public repositories: RepositoryValidator[] = []

  constructor(config: MasterConfig) {
    super(config)
  }

  public async validate() {
    this.addRepositoriesFromConfig()
    if (this.config.aws && this.config.aws.enabled) {
      await this.addRepositoriesFromGiuthub()
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

  private addRepositoriesFromGiuthub() {
    return
  }
}

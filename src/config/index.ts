import { AWSConfig } from './aws'
import _ from 'lodash'
import { Config } from './config'
import { Configs } from './configs'
import { RepositoryConfig } from './repository'

export class MasterConfig extends Config {

  public static parse(source: any) {
    let srcObj = source
    if (typeof source === "string") {
      srcObj = JSON.parse(source)
    }
    const master: MasterConfig = _.merge(new MasterConfig("master"), srcObj)
    master.repositories = new Configs<RepositoryConfig>()
    if (srcObj.repositories) {
      for (const repository of srcObj.repositories) {
        const newRepoObj = RepositoryConfig.parse(repository)
        master.repositories.set(newRepoObj.name, newRepoObj)
      }
    }
    return master
  }

  public aws = new AWSConfig("aws")
  public repositories = new Configs<RepositoryConfig>()

  public merge(config?: MasterConfig) {
    if (config) {
      this.aws = this.aws.merge(config.aws)
      this.repositories = this.repositories.merge(config.repositories)
    }
    return this
  }

  public getRepositoryConfig(repository: string) {
    let result = new RepositoryConfig(repository)
    if (this.repositories !== undefined) {
      result = this.repositories.getConfig(repository, result) || result
    }
    result.name = repository
    return result
  }
}

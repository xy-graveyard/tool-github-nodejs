import { GithubConfig } from './github'
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

  public github = new GithubConfig("github")
  public repositories = new Configs<RepositoryConfig>()

  public merge(config?: MasterConfig) {
    if (config) {
      this.github = this.github.merge(config.github)
      this.repositories = this.repositories.merge(config.repositories)
    }
    return this
  }

  public getRepositoryConfig({ owner, name, branch }: {owner: string, name: string, branch: string}) {
    let result = new RepositoryConfig({ owner, name, branch })
    if (this.repositories !== undefined) {
      result = this.repositories.getConfig(`${owner}/${name}`, result) || result
    }
    result.owner = owner
    result.name = name
    return result
  }
}

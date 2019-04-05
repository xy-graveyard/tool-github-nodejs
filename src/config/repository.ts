import _ from 'lodash'
import assert from "assert"
import { Config } from './config'
import { Configs } from './configs'
import { ContentConfig } from './content'

export class RepositoryConfig extends Config {

  public static parse(source: any) {
    let srcObj = source
    if (typeof source === "string") {
      srcObj = JSON.parse(source)
    }

    assert(typeof srcObj.name === "string")

    let repository = new RepositoryConfig(
      { name: srcObj.name || "default", owner: srcObj.owner || "default", branch: "master" }
    )
    repository = _.merge(repository, srcObj)
    return repository
  }

  public name: string
  public owner: string
  public branch: string
  public content = new Configs<ContentConfig>()

  constructor({ owner, name, branch }: {owner: string, name: string, branch: string}) {
    super(`${owner}/${name}`)
    this.name = name
    this.owner = owner
    this.branch = branch
  }

  public merge(config?: RepositoryConfig) {
    if (config) {
      const name = this.name
      const key = this.key
      const owner = this.owner
      _.merge(new RepositoryConfig({ owner: this.owner, name:this.name, branch:this.branch }), config)
      this.name = name
      this.owner = owner
      this.key = key
      super.merge(config)
    }
    return this
  }
}

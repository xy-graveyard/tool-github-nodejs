import _ from 'lodash'
import assert from "assert"
import { Config } from './config'

export class RepositoryConfig extends Config {

  public static parse(source: any, type?: string) {
    let srcObj = source
    if (typeof source === "string") {
      srcObj = JSON.parse(source)
    }

    assert(typeof srcObj.name === "string")
    assert(type)

    let repository = new RepositoryConfig(srcObj.name)
    repository = _.merge(repository, srcObj)
    return repository
  }

  public name: string

  constructor(name: string) {
    super(name)
    this.name = name
  }

  public merge(config?: RepositoryConfig) {
    if (config) {
      const name = this.name
      _.merge(new RepositoryConfig(name), config)
      this.name = name
      super.merge(config)
    }
    return this
  }
}

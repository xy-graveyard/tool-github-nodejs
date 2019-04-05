import { Config } from "./config"
import _ from 'lodash'

export class ContentConfig extends Config {

  public static parse(source: any) {
    let srcObj = source
    if (typeof source === "string") {
      srcObj = JSON.parse(source)
    }

    let value = new ContentConfig(srcObj.name || JSON.stringify(srcObj))
    value = _.merge(value, srcObj)
    return value
  }

  public name: string
  public disposition?: string

  constructor(name: string) {
    super(name)
    this.name = name
  }

  public toString() {
    return this.name
  }
}

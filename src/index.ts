import { AWS } from './aws'
import fs from 'fs'
import chalk from 'chalk'
import { MasterValidator } from './validator/master'
import defaultConfigJson from './config/default.json'
import loadJsonFile from 'load-json-file'
import { GithublintSchemaJson, Owner, Repository } from './types/schema'
import _ from 'lodash'

export class XyGithubScan {

  private config: GithublintSchemaJson  = {}
  private validator = new MasterValidator(this.config)
  private preflight?: string
  private aws = new AWS()

  public async loadConfig(filename?: string) {
    try {
      const filenameToLoad = filename || './githublint.json'
      /*const ajv = new Ajv({ schemaId: 'id' })
      const validate = ajv.compile(schema)
      if (!validate(defaultConfig)) {
        console.error(chalk.red(`${validate.errors}`))
      } else {
        console.log(chalk.green("Default Config Validated"))
      }*/

      const defaultConfig: GithublintSchemaJson = {
        github: defaultConfigJson.github,
        owners: defaultConfigJson.owners
      }
      console.log(chalk.gray("Loaded Default Config"))
      try {
        const userConfigJson: any = await loadJsonFile(filenameToLoad)
        const userConfig: GithublintSchemaJson = {
          github: userConfigJson.github,
          owners: userConfigJson.owners
        }
        /*if (!validate(userJson)) {
          console.error(chalk.red(`${validate.errors}`))
        } else {
          console.log(chalk.green("User Config Validated"))
        }*/
        console.log(chalk.gray("Loaded User Config"))
        let result: GithublintSchemaJson = {}
        result = _.merge(result, userConfig)
        result = _.merge(result, defaultConfig)
        return result
      } catch (ex) {
        console.log(chalk.yellow(`No githublint.json config file found.  Using defaults: ${ex.message}`))
        console.error(ex.stack)
        return defaultConfig
      }
    } catch (ex) {
      console.log(chalk.red(`Failed to load defaults: ${ex}`))
      console.error(ex.stack)
      return {}
    }
  }

  public getMergedRepositoryConfig(owner: string, name: string) {
    if (this.config.owners) {
      const defaultItem = this.getConfigByKey(this.config.owners, owner, 'name')
      const index = this.config.owners.findIndex((value: Owner) => {
        return (value.name === owner)
      })
      if (index > -1) {
        return this.config.owners
      }
    }
  }

  public addOwnerIfNeeded(name: string): Owner {
    let owner: Owner = this.getConfigByKey(this.config.owners, name, 'name')
    if (!owner) {
      owner = { name }
      this.config.owners = this.config.owners || []
      this.config.owners.push(owner)
    }
    return owner
  }

  public addRepositoryIfNeeded(owner: Owner, name: string): Repository {
    let repo: Repository = this.getConfigByKey(owner.repositories, name, 'name')
    if (!repo) {
      repo = { name }
      owner.repositories = owner.repositories || []
      owner.repositories.push(repo)
    }
    return repo
  }

  public async start(
    params: {
      output: string,
      singleRepo?: { owner: string, name: string, branch: "master" },
      bucket?: string,
      config?: GithublintSchemaJson,
      preflight?: string
    }
  ) {
    this.config = await this.loadConfig()
    this.preflight = params.preflight

    // if repository specified, clear configed repositorys and add it
    if (params.singleRepo) {
      console.log(chalk.yellow(`Configuring Single Repository: ${params.singleRepo.owner}/${params.singleRepo.name}`))
      const singleOwner = this.addOwnerIfNeeded(params.singleRepo.owner)
      const singleRepo = this.addRepositoryIfNeeded(singleOwner, params.singleRepo.name)

      // since we are doing just one, disable github list get
      this.config.github = this.config.github || {}
      this.config.github.enabled = false

      this.config.owners = this.config.owners || []

      // since we are only doing one, remove the rest
      for (const owner of this.config.owners) {
        if (owner.name !== "*" &&
            (owner.name !== singleOwner)
        ) {
          owner.enabled = false
        }
      }
    }

    if (this.preflight) {
      if (typeof this.preflight !== 'string') {
        this.preflight = 'githublint_preflight.json'
      }
      await this.saveToFile(this.preflight, this.config)
    }

    this.validator = new MasterValidator(this.config)

    await this.validator.validate()

    if (params.bucket) {
      this.saveToAws(params.bucket)
    }

    console.log(`Saving to File: ${params.output}`)
    this.saveToFile(params.output, this.validator)
    if (this.validator.errorCount === 0) {
      console.log(chalk.green("Congratulations, all tests passed!"))
    } else {
      console.error(chalk.yellow(`Total Errors Found: ${this.validator.errorCount}`))
    }
    return this.validator
  }

  private getConfigByKey(items: any[] | undefined, key: any, keyProperty: string) {
    if (items) {
      const index = items.findIndex((value: Owner) => {
        return (value[keyProperty] === key)
      })
      if (index > -1) {
        return items[index]
      }
    }
    return
  }

  private getLatestS3FileName() {
    return `latest.json`
  }

  private getHistoricS3FileName() {
    const date = new Date().toISOString()
    const parts = date.split('T')
    return `${parts[0]}/${parts[1]}.json`
  }

  private async saveToAws(bucket: string) {
    try {
      await this.aws.saveFileToS3(bucket, this.getLatestS3FileName(), this.validator)
      await this.aws.saveFileToS3(bucket, this.getHistoricS3FileName(), this.validator)
    } catch (ex) {
      console.error(chalk.red(ex.message))
      console.error(chalk.red(ex.stack))
    }
  }

  private async saveToFile(filename: string, obj: any) {
    fs.open(filename, 'w', (err, fd) => {
      if (err) {
        console.log(`failed to open file: ${err}`)
      } else {
        fs.write(fd, JSON.stringify(obj), (errWrite) => {
          if (errWrite) {
            console.log(`failed to write file: ${errWrite}`)
          }
        })
      }
    })
  }
}

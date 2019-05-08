import commander from 'commander'
import dotenvExpand from 'dotenv-expand'
import { XyGithubScan } from './'

const getVersion = (): string => {
  dotenvExpand({
    parsed: {
      APP_VERSION:'$npm_package_version',
      APP_NAME:'$npm_package_name'
    }
  })

  return process.env.APP_VERSION || 'Unknown'
}

const program = commander

program
  .version(getVersion())
  .option("-o, --output [value]", "output file path", "githublint-report.json")
  .option("-p, --preflight [value]", "generates preflight report")
  .option("-a, --account [value]", "owner account of repository to check")
  .option("-r, --repository [value]", "repository to check")
  .option("-b, --bucket [value]", "s3 bucket to write result to")

program.parse(process.argv)

// start
const tool = new XyGithubScan()
tool.start(
  {
    output: program.output,
    singleRepo: program.repository ? { name: program.repository, owner: program.account, branch: "master" } : undefined,
    bucket: program.bucket,
    preflight: program.preflight
  }
)

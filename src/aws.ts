import { Route53, S3 } from 'aws-sdk'
import chalk from 'chalk'

export class AWS {
  private r53 = new Route53()
  private s3 = new S3()

  public saveFileToS3(bucket: string, filename: string, data: object) {
    console.log(chalk.gray(`Saving to S3`))
    return new Promise((resolve, reject) => {
      const buffer = Buffer.from(JSON.stringify(data))
      const params = {
        Bucket: bucket,
        Key: filename,
        Body: buffer,
        ContentType: "application/json"
      }

      this.s3.upload(params, (err: any, result: any) => {
        if (err) {
          console.error(chalk.red(`aws.saveFileToS3: ${err}`))
          reject(err)
        } else {
          console.log(chalk.gray(`Saved to S3: ${filename}`))
          resolve(result)
        }
      })
    })
  }
}

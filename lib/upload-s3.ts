import type { Readable } from 'node:stream'
import AWS, { type ConfigurationOptions, S3 } from 'aws-sdk'
import type { Config } from './Interfaces/Config'

// configure AWS to log to stdout
// @ts-ignore
const awsConfig: ConfigurationOptions = { logger: process.stdout }

AWS.config.update(awsConfig)

export async function uploadS3(stream: Readable, config: Config, key: string): Promise<string> {
	const s3 = new S3({ region: config.S3_REGION })

	const result = await s3
		.upload({
			Key: key,
			Bucket: config.S3_BUCKET,
			Body: stream,
			StorageClass: config.S3_STORAGE_CLASS,
		})
		.promise()

	console.log('Uploaded to', result.Location)
	return result.Location
}

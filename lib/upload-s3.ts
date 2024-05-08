import type { Readable } from 'node:stream'
import type { Config } from './Interfaces/Config'

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

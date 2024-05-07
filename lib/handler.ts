import { Readable } from 'node:stream'
import type { Handler } from 'aws-lambda'
import type { Config } from './Interfaces/Config'
import { config as DEFAULT_CONFIG } from './config'
import { encrypt, generateIv, validateKey } from './encryption'
import { decorateWithIamToken } from './iam'
import { pgDump } from './pgDump'
import { decorateWithSecretsManagerCredentials } from './secrets-manager'
import { uploadS3 } from './upload-s3'
import { generateBackupPath } from './utils'

async function backup(config: Config) {
	if (!config.PGDATABASE) throw new Error('PGDATABASE not provided in the event data')
	if (!config.S3_BUCKET) throw new Error('S3_BUCKET not provided in the event data')

	const key = generateBackupPath(config.PGDATABASE, config.ROOT)

	// spawn the pg_dump process
	let stream = await pgDump(config)
	if (config.ENCRYPT_KEY && validateKey(config.ENCRYPT_KEY)) {
		// if encryption is enabled, we generate an IV and store it in a separate file
		const iv = generateIv()
		const ivKey = `${key}.iv`

		await uploadS3(Readable.from(iv.toString('hex')), config, ivKey)
		stream = encrypt(stream, config.ENCRYPT_KEY, iv)
	}

	// stream the backup to S3
	return uploadS3(stream, config, key)
}

export const handler: Handler = async (event) => {
	const baseConfig: Config = { ...DEFAULT_CONFIG, ...event }
	const config =
		event.USE_IAM_AUTH === true
			? decorateWithIamToken(baseConfig)
			: event.SECRETS_MANAGER_SECRET_ID
				? await decorateWithSecretsManagerCredentials(baseConfig)
				: baseConfig

	try {
		return await backup(config)
	} catch (error) {
		if (process.env.NODE_ENV !== 'test') console.error(error)
		throw error
	}
}

module.exports = handler

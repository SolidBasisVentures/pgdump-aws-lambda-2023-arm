import * as AWS from 'aws-sdk'
import type { Config } from './Interfaces/Config'
import type { Credentials } from './Interfaces/Credentials'

// configure AWS to log to stdout
// @ts-ignore
AWS.config.update({ logger: process.stdout })

async function getDbCredentials(config: Config): Promise<Credentials> {
	if (config.SECRETS_MANAGER_SECRET_ID === undefined) throw new Error('Secret ID is required')

	const secretsManager = new AWS.SecretsManager({ region: config.S3_REGION })
	const params = { SecretId: config.SECRETS_MANAGER_SECRET_ID }

	return new Promise((resolve, reject) => {
		secretsManager.getSecretValue(params, (err, data) => {
			if (err) {
				console.log('Error while getting secret value:', err)
				reject(err)
			} else {
				const credentials: Credentials = JSON.parse(data.SecretString ?? '')
				resolve(credentials)
			}
		})
	})
}

export async function decorateWithSecretsManagerCredentials(baseConfig: Config): Promise<Config> {
	try {
		const credentials: Credentials = await getDbCredentials(baseConfig)
		const credsFromSecret: Partial<Config> = {}

		if (credentials.username) credsFromSecret.PGUSER = credentials.username
		if (credentials.password) credsFromSecret.PGPASSWORD = credentials.password
		if (credentials.dbname) credsFromSecret.PGDATABASE = credentials.dbname
		if (credentials.host) credsFromSecret.PGHOST = credentials.host
		if (credentials.port) credsFromSecret.PGPORT = credentials.port

		return { ...credsFromSecret, ...baseConfig }
	} catch (error) {
		console.log(error)
		return baseConfig
	}
}

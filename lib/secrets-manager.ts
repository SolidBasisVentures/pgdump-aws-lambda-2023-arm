import {
	GetSecretValueCommand,
	type GetSecretValueCommandInput,
	SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager'
import type { Config } from './Interfaces/Config'

async function getDbCredentials(config: Config) {
	if (config.SECRETS_MANAGER_SECRET_ID === undefined) throw new Error('Secret ID is required')

	const client = new SecretsManagerClient({ region: config.S3_REGION })
	const input: GetSecretValueCommandInput = { SecretId: config.SECRETS_MANAGER_SECRET_ID }
	const command = new GetSecretValueCommand(input)

	const resp = await client.send(command)

	return resp.SecretString ? await JSON.parse(resp.SecretString) : {}
}

export async function decorateWithSecretsManagerCredentials(baseConfig: Config): Promise<Config> {
	try {
		const credentials = await getDbCredentials(baseConfig)
		const credentialsFromSecret: Partial<Config> = {}

		if (credentials.username) credentialsFromSecret.PGUSER = credentials.username
		if (credentials.password) credentialsFromSecret.PGPASSWORD = credentials.password
		if (credentials.dbname) credentialsFromSecret.PGDATABASE = credentials.dbname
		if (credentials.host) credentialsFromSecret.PGHOST = credentials.host
		if (credentials.port) credentialsFromSecret.PGPORT = credentials.port

		return { ...credentialsFromSecret, ...baseConfig }
	} catch (error) {
		console.log(error)
		return baseConfig
	}
}

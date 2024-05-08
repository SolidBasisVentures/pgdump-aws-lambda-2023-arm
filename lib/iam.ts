import { Signer } from '@aws-sdk/rds-signer'
import type { Config } from './Interfaces/Config'

export async function decorateWithIamToken(baseConfig: Config): Promise<Config> {
	const signer = new Signer({
		region: baseConfig.S3_REGION,
		username: baseConfig.PGUSER,
		hostname: baseConfig.PGHOST,
		port: baseConfig.PGPORT != null ? baseConfig.PGPORT : 5432,
	})

	const token = await signer.getAuthToken()

	return { ...baseConfig, PGPASSWORD: token }
}

// import { RDS } from 'aws-sdk'
// import type { Config } from './Interfaces/Config'
//
// export function decorateWithIamToken(baseConfig: Config) {
// 	const rdsSigner = new RDS.Signer()
// 	const token = rdsSigner.getAuthToken({
// 		hostname: baseConfig.PGHOST,
// 		port: baseConfig.PGPORT != null ? baseConfig.PGPORT : 5432,
// 		region: baseConfig.S3_REGION,
// 		username: baseConfig.PGUSER,
// 	})
//
// 	return { ...baseConfig, PGPASSWORD: token }
// }

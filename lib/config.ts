import path from 'node:path'
import type { BaseConfig } from './Interfaces/BaseConfig'

// default config that is overridden by the Lambda event
export const config: BaseConfig = {
	S3_REGION: 'us-east-1',
	PGDUMP_PATH: path.join(process.cwd(), '../bin'),
	// maximum time allowed to connect to postgres before a timeout occurs
	PGCONNECT_TIMEOUT: 15,
	USE_IAM_AUTH: false,
	S3_STORAGE_CLASS: 'STANDARD',
}

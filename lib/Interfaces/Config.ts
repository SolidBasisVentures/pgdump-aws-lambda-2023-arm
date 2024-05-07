import type { BaseConfig } from './BaseConfig'

export interface Config extends BaseConfig {
	// Security Options
	SECRETS_MANAGER_SECRET_ID?: string

	// Database Parameters
	PGDATABASE: string
	PGUSER: string
	PGPASSWORD: string
	PGHOST: string
	PGPORT: number
	PGDUMP_ARGS: string

	// S3 Info
	S3_BUCKET: string

	// Encryption
	ROOT: string
	ENCRYPT_KEY: string
}

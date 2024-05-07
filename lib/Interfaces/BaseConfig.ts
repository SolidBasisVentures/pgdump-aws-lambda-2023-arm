export interface BaseConfig {
	// Security Options
	USE_IAM_AUTH: boolean

	// S3 Info
	S3_REGION: string
	S3_STORAGE_CLASS: string
	PGDUMP_PATH: string

	// Database Parameters
	PGCONNECT_TIMEOUT: number
}

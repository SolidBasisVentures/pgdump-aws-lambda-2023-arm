import path from 'node:path'
import moment from 'moment'

export function generateBackupPath(databaseName: string, rootPath?: string, now = moment().utc()) {
	const timestamp = moment(now).format('DD-MM-YYYY@HH-mm-ss')
	const day = moment(now).format('YYYY-MM-DD')
	const filename = `${databaseName}-${timestamp}.backup`
	const key = path.join(rootPath || '', day, filename)

	return key
}

export function toStringObject(object: { [key: string]: string | number | boolean }): {
	[key: string]: string
} {
	return Object.fromEntries(Object.entries(object).map(([key, value]) => [key, String(value)]))
}

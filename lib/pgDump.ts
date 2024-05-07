import { type ChildProcessWithoutNullStreams, spawn } from 'node:child_process'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { Transform } from 'node:stream'
import type { Config } from './Interfaces/Config'
import { toStringObject } from './utils'

function spawnPgDump(
	pgdumpDir: string,
	args: string[],
	env: NodeJS.ProcessEnv,
): ChildProcessWithoutNullStreams {
	const pgDumpPath = path.join(pgdumpDir, 'pg_dump')
	if (!fs.existsSync(pgDumpPath)) throw new Error(`pg_dump not found at ${pgDumpPath}`)

	return spawn(pgDumpPath, args, { env })
}

function buildArgs(config: Config) {
	const args = ['-Fc', '-Z1']
	const extraArgs = config.PGDUMP_ARGS
	const splitArgs = extraArgs.split(' ')

	return args.concat(splitArgs)
}

export function pgDump(config: Config): Promise<Transform> {
	return new Promise((resolve, reject) => {
		let headerChecked = false

		// spawn pg_dump process
		const args = buildArgs(config)
		const env = toStringObject({ ...config, LD_LIBRARY_PATH: config.PGDUMP_PATH })
		const process = spawnPgDump(config.PGDUMP_PATH, args, env)

		// hook into the process
		let stderr = ''
		process.stderr.on('data', (data) => {
			stderr += data.toString('utf8')
		})
		process.on('close', (code) => {
			if (code !== 0) return reject(new Error(`pg_dump process failed: ${stderr}`))
			if (!headerChecked) return reject(new Error('pg_dump gave us an unexpected response'))
			return null
		})

		// watch the pg_dump stdout stream so we can check it's valid
		const transformer = new Transform({
			transform(chunk, enc, callback) {
				this.push(chunk)

				// if stdout begins with 'PGDMP' then the backup has begun; otherwise, we abort
				if (!headerChecked) {
					headerChecked = true
					if (chunk.toString('utf8').startsWith('PGDMP')) {
						resolve(transformer)
					} else {
						reject(new Error('pg_dump gave us an unexpected response'))
					}
				}
				callback()
			},
		})

		// pipe pg_dump to transformer
		process.stdout.pipe(transformer)
	})
}

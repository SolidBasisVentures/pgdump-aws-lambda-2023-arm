import * as crypto from 'node:crypto'
import type { Readable } from 'node:stream'

const ALGORITHM = 'aes-256-cbc'

export function encrypt(readableStream: Readable, key: string, iv: Buffer) {
	validateKey(key)
	if (iv.length !== 16) {
		throw new Error(`encrypt iv must be exactly 16 bytes, but received ${iv.length}`)
	}
	const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(key, 'hex'), iv)
	readableStream.pipe(cipher)
	return cipher
}

export function decrypt(readableStream: Readable, key: string, iv: Buffer) {
	validateKey(key)
	const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(key, 'hex'), iv)
	readableStream.pipe(decipher)
	return decipher
}

export function validateKey(key: string) {
	const bytes = Buffer.from(key, 'hex')
	if (bytes.length !== 32) {
		throw new Error('encrypt key must be a 32 byte hex string')
	}
	return true
}

export function generateIv(): Buffer {
	return crypto.randomBytes(16)
}

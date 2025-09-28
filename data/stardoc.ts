import { fromBinary } from '@bufbuild/protobuf'
import {
  ModuleInfoSchema,
  ModuleInfo,
} from '@buf/bazel_bazel.bufbuild_es/src/main/java/com/google/devtools/build/skydoc/rendering/proto/stardoc_output_pb.js'
import * as tar from 'tar-stream'
import * as zlib from 'zlib'
import { Readable } from 'node:stream'

export type StardocModuleInfo = ModuleInfo

// Convert protobuf objects to plain JavaScript objects for JSON serialization
function toPlainObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj
  }

  if (obj instanceof Uint8Array) {
    return Array.from(obj)
  }

  if (Array.isArray(obj)) {
    return obj.map(toPlainObject)
  }

  if (typeof obj === 'object') {
    const result: any = {}
    for (const [key, value] of Object.entries(obj)) {
      // Skip protobuf internal fields
      if (key.startsWith('$')) {
        continue
      }
      result[key] = toPlainObject(value)
    }
    return result
  }

  return obj
}

export const fetchDocsList = async (docsUrl: string): Promise<ModuleInfo[]> => {
  if (typeof window !== 'undefined') {
    throw new Error('fetchDocsList should only be called server-side')
  }

  try {
    const response = await fetch(docsUrl)
    if (!response.ok) {
      console.warn('Failed to fetch docs from ', docsUrl, response)
      return []
    }

    const docsArchive = await response.arrayBuffer()
    return new Promise((resolve, reject) => {
      const extract = tar.extract()
      const stardocs: ModuleInfo[] = []
      extract.on('entry', (header, stream, next) => {
        const chunks: any[] = []

        stream.on('data', (chunk) => {
          chunks.push(chunk)
        })

        stream.on('end', () => {
          try {
            const content = Buffer.concat(chunks)
            if (
              header.type === 'file' &&
              header.name.endsWith('.binaryproto')
            ) {
              const stardoc = fromBinary(
                ModuleInfoSchema,
                new Uint8Array(content)
              )
              // Convert protobuf object to plain object for JSON serialization
              stardocs.push(toPlainObject(stardoc) as ModuleInfo)
            }
            next()
          } catch (err) {
            next() // Continue processing other files even if one fails
          }
        })

        stream.on('error', (err) => {
          next() // Continue processing other files
        })
      })

      extract.on('finish', () => {
        resolve(stardocs.sort((a, b) => a.file.localeCompare(b.file)))
      })

      extract.on('error', (err) => {
        reject(err)
      })

      Readable.from([Buffer.from(docsArchive)])
        .pipe(zlib.createGunzip())
        .pipe(extract)
        .on('error', (err) => {
          reject(err)
        })
    })
  } catch (error) {
    return []
  }
}

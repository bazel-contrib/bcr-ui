import * as fs from 'fs'
import * as path from 'path'
import {
  ModuleInfo,
  ModuleInfoSchema,
} from '@buf/bazel_bazel.bufbuild_es/src/main/java/com/google/devtools/build/skydoc/rendering/proto/stardoc_output_pb.js'
import { fromBinary } from '@bufbuild/protobuf'

/**
 * Reads a binary protobuf file containing ModuleInfo data and returns the parsed ModuleInfo object.
 *
 * @param moduleName - The name of the module
 * @param version - The version of the module (optional, defaults to latest)
 * @returns The parsed ModuleInfo object or null if the file doesn't exist or can't be parsed
 */
export async function getModuleApiDocs(
  moduleName: string,
  version?: string
): Promise<ModuleInfo | null> {
  try {
    // Use the protobuf file from the data folder
    const protobufPath = path.join(
      process.cwd(),
      'data',
      'write_source_files.doc_extract.binaryproto'
    )

    // Check if the file exists
    if (!fs.existsSync(protobufPath)) {
      console.warn(`No API docs protobuf file found at ${protobufPath}`)
      return null
    }

    // Read the binary protobuf file
    const binaryData = fs.readFileSync(protobufPath)

    // Parse the protobuf data using the ModuleInfoSchema
    const moduleInfo = fromBinary(ModuleInfoSchema, new Uint8Array(binaryData))
    console.log(moduleInfo)

    return moduleInfo
  } catch (error) {
    console.error(
      `Failed to read API docs for module ${moduleName} version ${
        version || 'latest'
      }:`,
      error
    )
    return null
  }
}

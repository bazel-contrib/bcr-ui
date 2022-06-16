import path from "path";
import {promises as fs} from "fs";

export const MODULES_ROOT_DIR = path.join(
    process.cwd(),
    "data",
    "bazel-central-registry",
    "modules"
);


export interface Metadata {
  homepage?: string;
  maintainers: Array<{
    email?: string;
    github?: string;
    name?: string;
  }>;
  versions: Array<string>;
}

export const listModuleNames = async (): Promise<string[]> => {
  return await fs.readdir(MODULES_ROOT_DIR)
}

export const getModuleMetadata = async (module: string): Promise<Metadata> => {
  const metadataJsonPath = path.join(MODULES_ROOT_DIR, module, "metadata.json");
  const metadataContents = await fs.readFile(metadataJsonPath);
  const metadata: Metadata = JSON.parse(metadataContents.toString());

  return metadata;
}

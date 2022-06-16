import path from "path";
import { promises as fs } from "fs";
import { gitlogPromise } from "gitlog";

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
  return await fs.readdir(MODULES_ROOT_DIR);
};

export const getModuleMetadata = async (module: string): Promise<Metadata> => {
  const metadataJsonPath = path.join(MODULES_ROOT_DIR, module, "metadata.json");
  const metadataContents = await fs.readFile(metadataJsonPath);
  const metadata: Metadata = JSON.parse(metadataContents.toString());

  return metadata;
};

export interface SearchIndexEntry {
  module: string;
  version: string;
}

export const buildSearchIndex = async (): Promise<SearchIndexEntry[]> => {
  const moduleNames = await listModuleNames();
  return Promise.all(
    moduleNames.map(async (module) => {
      const metadata = await getModuleMetadata(module);
      const latestVersion = metadata.versions[metadata.versions.length - 1];

      return { module, version: latestVersion };
    })
  );
};

export interface Commit {
  hash: string;
  authorDate: string;
  authorDateRel: string;
}

export const getSubmissionCommitOfVersion = async (
  module: string,
  version: string
): Promise<Commit> => {
  const options = {
    repo: path.join(process.cwd(), "data", "bazel-central-registry"),
    number: 10,
    file: `modules/${module}/${version}/source.json`,
    fields: ["hash", "authorDate", "authorDateRel"] as any
  };

  const commits = await gitlogPromise(options)

  return commits[commits.length - 1] as any;
};

// TODO: find a more robust way to do this
export const getCompatibilityLevelOfVersion = async (
    module: string,
    version: string
): Promise<number> => {
  const moduleFilePath = path.join(MODULES_ROOT_DIR, module, version, 'MODULE.bazel')
  const moduleFileContents = (await fs.readFile(moduleFilePath)).toString();

  const PATTERN = "compatibility_level = ";
  const pos = moduleFileContents.search(PATTERN);
  const posAfterPattern = pos + PATTERN.length;
  const nextCharsAfterPos = moduleFileContents.slice(posAfterPattern);
  const [level] = nextCharsAfterPos.split(",");

  return Promise.resolve(parseInt(level, 10))
}
import { promises as fs } from "fs";
import path from "path";
import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../../styles/Home.module.css";
import { useRouter } from "next/router";
import { Header, USER_GUIDE_LINK } from "../../components/Header";
import {Footer} from "../../components/Footer";

const MODULES_ROOT_DIR = path.join(
  process.cwd(),
  "data",
  "bazel-central-registry",
  "modules"
);

const ModulePage: NextPage = (props) => {
  const router = useRouter();
  const { module } = router.query;
  const metadata = (props as any).metadata as any as Metadata;

  const latestVersion = metadata.versions[metadata.versions.length - 1];
  // TODO: Is there a good way to statically analyze MODULE.bazel to get that data?
  const compatibilityLevel = "?";

  return (
    <div className="flex flex-col">
      <Head>
        <title>Bazel Central Registry | {module}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />
      <main>
        <div className="max-w-4xl w-4xl mx-auto mt-8">
          <div className="border rounded p-4 divide-y">
            <div>
              <span className="text-3xl">{module}</span>
              <span className="text-lg ml-2">{latestVersion}</span>
            </div>
            <div className="mt-4 flex divide-x gap-2">
              <div>
                <h2 className="text-2xl font-bold mt-4">Install</h2>
                <div className="mt-2">
                  <p>
                    To start using this module, make sure you have set up Bzlmod
                    according to the <a href={USER_GUIDE_LINK}>user guide</a>,
                    and add the following to your <code>MODULE.bazel</code> file:
                  </p>
                  <div className="p-2 mt-4 rounded bg-gray-200">
                    <code>{`bazel_dep(name = "${module}", version = "${latestVersion}")`}</code>
                  </div>
                </div>
                <h2 className="text-2xl font-bold mt-4">Version history</h2>
                <div>
                  <ul className="mt-4">
                    {metadata.versions.reverse().map((version) => (
                      <li key={version} className="border rounded p-2 mt-2 flex items-center gap-4">
                        <div className="rounded-full border h-14 w-14 grid place-items-center">
                          {version}
                        </div>
                        <div>compatibility level {compatibilityLevel}</div>
                        <div className="ml-auto">published ? ago</div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div id="metadata" className="mt-4 pl-2">
                <h2 className="text-2xl font-bold mt-4">Metadata</h2>
                <div>
                  <h3 className="font-bold text-xl mt-2">Repository</h3>
                  <div>
                    <a href={metadata.homepage}>{metadata.homepage}</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <div className="flex-grow"/>
      <Footer/>
    </div>
  );
};

interface Metadata {
  homepage?: string;
  maintainers: Array<{
    email?: string;
    github?: string;
    name?: string;
  }>;
  versions: Array<string>;
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { module } = params as any;

  const metadataJsonPath = path.join(MODULES_ROOT_DIR, module, "metadata.json");
  const metadataContents = await fs.readFile(metadataJsonPath);
  const metadata: Metadata = JSON.parse(metadataContents.toString());

  return {
    props: {
      metadata,
    },
  };
};

export async function getStaticPaths() {
  const modulesNames = await fs.readdir(MODULES_ROOT_DIR);

  const paths = modulesNames.map((name) => ({
    params: { module: name },
  }));

  return {
    paths,
    // TODO: fallback true?
    fallback: false,
    // fallback: true, false or "blocking" // See the "fallback" section below
  };
}

export default ModulePage;

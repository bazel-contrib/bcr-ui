import type { NextPage } from "next";
import Head from "next/head";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import React from "react";

// TODO: fetch correct version during build
const HIGHLIGHTED_MODULES = [
  { module: "rules_nodejs", version: "0.1.0" },
  { module: "stardoc", version: "0.2.0" },
  { module: "rules_python", version: "2.1.0" },
  { module: "apple_support", version: "0.0.0" },
];

const Home: NextPage = () => {
  return (
    <div className="flex flex-col">
      <Head>
        <title>Bazel Central Registry</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />
      <main>
        <div className="max-w-4xl w-4xl mx-auto mt-8 flex flex-col items-center">
          <h1 className="text-bzl-green font-bold text-6xl">
            Bazel Central Registry
          </h1>
          <div className="text-bzl-green text-4xl">
            Home of all your bzlmod modules!
          </div>
          <input
            type="text"
            id="search-navbar"
            className="my-6 h-12 block p-2 pl-10 w-full max-w-xl text-gray-900 bg-white rounded-lg border border-gray-300 sm:text-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search for module..."
          />
          <div>
            <h2 className="font-bold text-lg">Highlighted modules</h2>
            <div className="grid grid-cols-2 gap-8 mt-4">
              {HIGHLIGHTED_MODULES.map(({ module, version }) => (
                <ModuleCard key={module} {...{ module, version }} />
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

interface ModuleCardProps {
  module: string;
  version: string;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ module, version }) => {
  return (
    <a href={`/modules/${module}`}>
      <div className="w-48 h-24 border rounded flex flex-col items-center justify-center shadow-sm hover:shadow-lg">
        <div className="font-bold">{module}</div>
        <div>{version}</div>
      </div>
    </a>
  );
};

export default Home;

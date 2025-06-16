import { parseISO } from 'date-fns'
import type { NextPage } from 'next'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { ModuleCard } from '../components/ModuleCard'
import { buildSearchIndex, SearchIndexEntry } from '../data/utils'

// TODO: fetch correct version during build
// const HIGHLIGHTED_MODULES = [
//   { module: 'rules_nodejs', version: '0.1.0' },
//   { module: 'stardoc', version: '0.2.0' },
//   { module: 'rules_python', version: '2.1.0' },
//   { module: 'apple_support', version: '0.0.0' },
// ]
const HIGHLIGHTED_MODULES = [
  'bazel-gazelle',
  'rules_go',
  'rules_oci',
  'rules_python',
  'toolchains_llvm',
  'rules_foreign_cc',
  'rules_jvm_external',
  'rules_nodejs',
]

interface HomePageProps {
  searchIndex: SearchIndexEntry[]
}

const Home: NextPage<HomePageProps> = ({ searchIndex }) => {
  const router = useRouter()
  const [searchQueryInput, setSearchQueryInput] = useState<string>('')

  const highlightedModules: SearchIndexEntry[] = searchIndex.filter((n) => {
    return HIGHLIGHTED_MODULES.includes(n.module)
  })
  let recentlyUpdatedModules: (SearchIndexEntry & {
    authorDateParsed: Date
  })[] = searchIndex.map((n) => {
    return Object.assign({}, n, { authorDateParsed: parseISO(n.authorDateIso) })
  })
  recentlyUpdatedModules.sort(
    (a, b) => (b.authorDateParsed as any) - (a.authorDateParsed as any)
  )
  recentlyUpdatedModules = recentlyUpdatedModules.slice(0, 10)

  const handleSubmitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    router.push({
      pathname: '/search',
      query: { ...router.query, q: searchQueryInput },
    })
  }

  return (
    <div className="flex flex-col">
      <Head>
        <title>Eclipse S‑CORE Bazel Modules Registry</title>
        <link rel="icon" href="/favicon.png" />
      </Head>

      <Header />
      <main className="m-4 l:m-0">
        <div className="max-w-4xl w-4xl mx-auto mt-8 flex flex-col items-center">
          <h1 className="text-bzl-green font-bold text-6xl">
            Eclipse S‑CORE Bazel Modules Registry
          </h1>
          <form onSubmit={handleSubmitSearch} className="contents">
            <input
              type="text"
              autoFocus
              id="search-navbar"
              className="my-6 h-12 block p-2 pl-10 w-full max-w-xl text-gray-900 bg-white rounded-lg border border-gray-300 sm:text-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search for module..."
              onChange={(e) => setSearchQueryInput(e.target.value)}
            />
          </form>
          <div className="w-full max-w-4xl flex flex-col gap-8 md:grid md:grid-cols-2 md:flex-row">
            <div>
              <h2 className="font-bold text-lg">Highlighted modules</h2>
              <div className="grid grid-cols-1 gap-8 mt-4">
                {highlightedModules.map(({ module, version }) => (
                  <ModuleCard key={module} {...{ module, version }} />
                ))}
              </div>
            </div>
            <div>
              <h2 className="font-bold text-lg">Recently updated</h2>
              <div className="grid grid-cols-1 gap-8 mt-4">
                {recentlyUpdatedModules.map(
                  ({ module, version, authorDateIso: authorDate }) => (
                    <ModuleCard
                      key={module}
                      {...{ module, version, authorDate }}
                    />
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const searchIndex = await buildSearchIndex()

  return {
    props: {
      searchIndex,
    },
  }
}

export default Home

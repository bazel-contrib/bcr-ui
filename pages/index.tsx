import type { NextPage } from 'next'
import Head from 'next/head'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { buildSearchIndex, SearchIndexEntry } from '../data/utils'
import { ModuleCard } from '../components/ModuleCard'
import { GetStaticProps } from 'next'
import { parseISO } from 'date-fns'

// TODO: fetch correct version during build
// const HIGHLIGHTED_MODULES = [
//   { module: 'rules_nodejs', version: '0.1.0' },
//   { module: 'stardoc', version: '0.2.0' },
//   { module: 'rules_python', version: '2.1.0' },
//   { module: 'apple_support', version: '0.0.0' },
// ]
const HIGHLIGHTED_MODULES = [
  'rules_nodejs',
  'stardoc',
  'rules_python',
  'apple_support',
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

  const handleSearchKeydown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.code === 'Enter') {
      handleSubmitSearch()
    }
  }

  const handleSubmitSearch = () => {
    router.push({
      pathname: '/search',
      query: { ...router.query, q: searchQueryInput },
    })
  }

  return (
    <div className="flex flex-col">
      <Head>
        <title>Bazel Central Registry</title>
        <link rel="icon" href="/favicon.png" />
      </Head>

      <Header />
      <main className="m-4 l:m-0">
        <div className="max-w-4xl w-4xl mx-auto mt-8 flex flex-col items-center">
          <h1 className="text-bzl-green font-bold text-6xl">
            Bazel Central Registry
          </h1>
          <div className="text-bzl-green text-4xl">
            Home of all your bazel modules!
          </div>
          <div className="mt-4 ml-2 px-2 rounded bg-amber-300">
            As of Bazel 5.X, bzlmod and the Bazel Central Registry are in an
            experimental status.
          </div>
          <input
            type="text"
            autoFocus
            id="search-navbar"
            className="my-6 h-12 block p-2 pl-10 w-full max-w-xl text-gray-900 bg-white rounded-lg border border-gray-300 sm:text-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search for module..."
            onChange={(e) => setSearchQueryInput(e.target.value)}
            onKeyDown={handleSearchKeydown}
            onSubmit={handleSubmitSearch}
          />
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
                  ({ module, version, authorDateRel }) => (
                    <ModuleCard
                      key={module}
                      {...{ module, version, authorDateRel }}
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

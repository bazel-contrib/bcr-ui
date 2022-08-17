import type { NextPage } from 'next'
import Head from 'next/head'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { GetStaticProps } from 'next'
import { buildSearchIndex, SearchIndexEntry } from '../data/utils'
import Fuse from 'fuse.js'
import { ModuleCard } from '../components/ModuleCard'

interface SearchPageProps {
  searchIndex: SearchIndexEntry[]
}

const Search: NextPage<SearchPageProps> = ({ searchIndex }) => {
  const [searchResults, setSearchResults] = useState<SearchIndexEntry[]>([])

  const router = useRouter()
  const searchQuery = router.query.q

  const getSearchQuery = (): string | null => {
    if (!searchQuery || typeof searchQuery !== 'string') {
      return null
    }
    return searchQuery
  }

  const [searchQueryInput, setSearchQueryInput] = useState<string>(
    getSearchQuery() || ''
  )

  const fuseIndex = new Fuse(searchIndex, {
    includeScore: true,
    threshold: 0.4,
    keys: ['module'],
  })

  useEffect(() => {
    if (!searchQuery || typeof searchQuery !== 'string') {
      return
    }
    const results = fuseIndex.search(searchQuery)
    setSearchResults(results.map((n) => n.item))
  }, [searchQuery])
  useEffect(() => {
    setSearchQueryInput(getSearchQuery() || '')
  }, [searchQuery])

  const handleSearchKeydown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.code === 'Enter') {
      handleSubmitSearch()
    }
  }

  const handleSubmitSearch = () => {
    router.push({
      pathname: router.pathname,
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
          <input
            type="text"
            id="search-navbar"
            autoFocus
            className="my-6 h-12 block p-2 pl-10 w-full max-w-xl text-gray-900 bg-white rounded-lg border border-gray-300 sm:text-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search for module..."
            value={searchQueryInput}
            onChange={(e) => setSearchQueryInput(e.target.value)}
            onKeyDown={handleSearchKeydown}
            onSubmit={handleSubmitSearch}
          />
          <div className="w-full max-w-xl">
            <h2 className="font-bold text-lg">Search results</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
              {searchResults.map(({ module, version }) => (
                <ModuleCard key={module} {...{ module, version }} />
              ))}
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

export default Search

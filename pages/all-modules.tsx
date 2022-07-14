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
  const fuseIndex = new Fuse(searchIndex, {
    includeScore: true,
    threshold: 0.4,
    keys: ['module'],
  })

  return (
    <div className="flex flex-col">
      <Head>
        <title>Bazel Central Registry</title>
        <link rel="icon" href="/favicon.png" />
      </Head>

      <Header />
      <main>
        <div className="max-w-4xl w-4xl mx-auto mt-8 flex flex-col items-center">
          <div>
            <h2 className="font-bold text-lg">All modules</h2>
            <div className="grid grid-cols-1 gap-8 mt-4">
              {searchIndex.map(({ module, version, authorDateRel }) => (
                <ModuleCard
                  key={module}
                  {...{ module, version, authorDateRel }}
                />
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

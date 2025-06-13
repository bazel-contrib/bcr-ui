import Fuse from 'fuse.js'
import type { NextPage } from 'next'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { ModuleCard } from '../components/ModuleCard'
import { buildSearchIndex, SearchIndexEntry } from '../data/utils'

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
      <main className="m-4 l:m-0">
        <div className="max-w-4xl w-4xl mx-auto mt-8 flex flex-col items-center">
          <div>
            <h2 className="font-bold text-lg">All modules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
              {searchIndex.map(
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

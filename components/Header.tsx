import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useState } from 'react'

interface HeaderProps {}

export const USER_GUIDE_LINK = 'https://bazel.build/docs/bzlmod'
export const CONTRIBUTE_CTA_LINK =
  'https://github.com/bazelbuild/bazel-central-registry/blob/main/docs/README.md'

export const Header: React.FC<HeaderProps> = () => {
  const router = useRouter()
  const [searchQueryInput, setSearchQueryInput] = useState<string>('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false)

  const handleSubmitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    router.push({
      pathname: '/search',
      query: { ...router.query, q: searchQueryInput },
    })
  }

  return (
    <nav className="bg-white border-gray-200 px-2 sm:px-4 py-2.5 bg-bzl-green">
      <div className="container flex flex-wrap gap-4 flex-col sm:flex-row items-center mx-auto">
        <div className="flex flex-1 items-center">
          <Link href="/" className="flex items-center cursor-pointer">
            <span className="self-center text-xl font-semibold whitespace-nowrap text-white cursor-pointer">
              Eclipse S-Core Bazel Registry
            </span>
          </Link>
        </div>
        <div className="flex flex-1 gap-4 items-center md:order-1 transform md:translate-x-1/4">
          <div className="block relative">
            <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-500"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </div>
            <form onSubmit={handleSubmitSearch} className="contents">
              <input
                type="text"
                id="search-navbar"
                className="block p-2 pl-10 w-full text-gray-900 bg-gray-50 rounded-lg border border-gray-300 sm:text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search for module..."
                onChange={(e) => setSearchQueryInput(e.target.value)}
              />
            </form>
          </div>
          <Link
            href={'/all-modules'}
            className="hidden sm:block py-2 pr-4 pl-3 text-white border-b border-gray-100 hover:bg-gray-50 md:hover:bg-transparent md:border-0 md:hover:text-gray-300 md:p-0"
          >
            Browse all modules
          </Link>
          <button
            data-collapse-toggle="mobile-menu-3"
            type="button"
            className="hidden inline-flex items-center p-2 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
            aria-controls="mobile-menu-3"
            aria-expanded="false"
            onClick={() => setMobileMenuOpen(!setMobileMenuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              ></path>
            </svg>
            <svg
              className="hidden w-6 h-6"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>
        </div>
        <div
          className="flex flex-1 hidden justify-end items-center w-full md:flex md:w-auto md:order-2"
          id="mobile-menu-3"
        >
          <div className="relative mt-3 md:hidden">
            <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none text-white">
              <svg
                className="w-5 h-5 text-gray-500"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </div>
            <form onSubmit={handleSubmitSearch} className="contents">
              <input
                type="text"
                id="search-navbar-mobile"
                className="block p-2 pl-10 w-full text-gray-900 bg-gray-50 rounded-lg border border-gray-300 sm:text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search..."
                onChange={(e) => setSearchQueryInput(e.target.value)}
              />
            </form>
          </div>
        </div>
      </div>
    </nav>
  )
}

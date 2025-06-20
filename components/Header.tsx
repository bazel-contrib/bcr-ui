import React, { useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBoxOpen,
  faCubes,
  faMagnifyingGlass,
  faSquareArrowUpRight,
} from '@fortawesome/free-solid-svg-icons'

interface HeaderProps {
  minHeight?: string
  showSearch?: boolean
}

export const USER_GUIDE_LINK = 'https://bazel.build/docs/bzlmod'
export const CONTRIBUTE_CTA_LINK =
  'https://github.com/bazelbuild/bazel-central-registry/blob/main/docs/README.md'

export const Header: React.FC<HeaderProps> = ({
  minHeight = '100px',
  showSearch = true,
}) => {
  const router = useRouter()
  const [searchQueryInput, setSearchQueryInput] = useState<string>('')

  const handleSubmitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    router.push({
      pathname: '/search',
      query: { ...router.query, q: searchQueryInput },
    })
  }

  const searchInput = useRef<HTMLInputElement>(null)

  return (
    <nav
      style={{ minHeight: minHeight }}
      className="flex border-gray-200 px-2 sm:px-4 py-2.5 bg-bzl-green"
    >
      <div className="container flex flex-wrap justify-evenly gap-4 flex-col sm:flex-row items-center mx-auto">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center cursor-pointer">
            <svg version="1.1" height="25px" width="25px" viewBox="0 0 87 86">
              <defs>
                <style>
                  {`.st0{fill:none;stroke:#ffffff;stroke-width:3;stroke-linejoin:round;stroke-miterlimit:10;}
                  .st1{opacity:0.2;fill:none;stroke:#ffffff;stroke-width:2;stroke-linejoin:round;stroke-miterlimit:10;}
                  .st2{fill:#ffffff;`}
                </style>
              </defs>
              <rect
                x="39"
                y="2.8"
                transform="matrix(-0.7071 -0.7071 0.7071 -0.7071 69.033 94.234)"
                className="st0"
                width="30"
                height="60"
              />
              <rect
                x="17.8"
                y="2.8"
                transform="matrix(-0.7071 0.7071 -0.7071 -0.7071 79.234 32.8198)"
                className="st0"
                width="30"
                height="60"
              />
              <rect
                x="39"
                y="23.6"
                transform="matrix(-0.7071 -0.7071 0.7071 -0.7071 54.3112 129.7757)"
                className="st1"
                width="30"
                height="60"
              />
              <rect
                x="17.8"
                y="23.6"
                transform="matrix(-0.7071 0.7071 -0.7071 -0.7071 93.9558 68.3614)"
                className="st1"
                width="30"
                height="60"
              />
              <polygon
                className="st0"
                points="1,22.2 1,43 22.2,64.2 22.2,43.4 "
              />
              <polygon
                className="st0"
                points="43.4,64.6 43.4,85.5 22.2,64.2 22.2,43.4 "
              />
              <polygon
                className="st0"
                points="85.9,22.2 85.9,43 64.6,64.2 64.6,43.4 "
              />
              <polygon
                className="st0"
                points="43.4,64.6 64.6,43.4 64.6,64.2 43.4,85.5 "
              />
              <line className="st1" x1="22.2" y1="1" x2="22.2" y2="21.8" />
              <line className="st1" x1="64.6" y1="1" x2="64.6" y2="21.8" />
              <line className="st1" x1="43.4" y1="22.1" x2="43.4" y2="43.1" />
            </svg>

            <span className="self-center text-xl font-normal whitespace-nowrap text-white cursor-pointer pl-2">
              Bazel Central Registry
            </span>
          </Link>
        </div>
        <div className="hidden lg:flex items-center w-full md:flex md:w-auto md:order-2">
          <ul className="hidden lg:flex flex-col items-center mt-4 md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium">
            <li>
              <form
                onSubmit={handleSubmitSearch}
                onClick={() => searchInput.current!.focus()}
                className="flex items-center justify-center gap-3 pr-4 pl-4 cursor-pointer border-2 border-white border-opacity-50 min-w-8 h-10 rounded-full group focus-within:border-opacity-80"
              >
                <FontAwesomeIcon
                  icon={faMagnifyingGlass}
                  className="text-white align-middle"
                />
                <input
                  ref={searchInput}
                  placeholder="Search"
                  className="bg-transparent transition-all w-16 group-focus-within:w-60 outline-0 text-white placeholder-white placeholder-opacity-50 group-focus-within:placeholder-opacity-10"
                  onChange={(e) => setSearchQueryInput(e.target.value)}
                ></input>
              </form>
            </li>
            <li>
              <Link
                href={'/all-modules'}
                className="text-white hover:bg-gray-50 md:hover:bg-transparent md:border-0 md:hover:text-gray-300 md:p-0"
              >
                <FontAwesomeIcon icon={faCubes} className="mr-1" />
                Browse
              </Link>
            </li>

            <span className="ml-10 h-1.5 w-1.5 bg-white opacity-50"></span>
            <li>
              <a
                href={USER_GUIDE_LINK}
                target="_blank"
                className="block py-2 pr-4 pl-3 text-white border-b border-gray-100 hover:bg-gray-50 md:hover:bg-transparent md:border-0 md:hover:text-gray-300 md:p-0"
              >
                Bzlmod Guide
                <FontAwesomeIcon
                  icon={faSquareArrowUpRight}
                  className="translate-y-[-5px] translate-x-1 h-2"
                />
              </a>
            </li>
            <li>
              <a
                href={CONTRIBUTE_CTA_LINK}
                target="_blank"
                className="block py-2 pr-4 pl-3 text-white border-b border-gray-100 hover:bg-gray-50 md:hover:bg-transparent md:border-0 md:hover:text-gray-300 md:p-0"
              >
                Contribute
                <FontAwesomeIcon
                  icon={faSquareArrowUpRight}
                  className="translate-y-[-5px] translate-x-1 h-2"
                />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}

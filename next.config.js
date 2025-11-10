/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  // for hosting under GitHub pages
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  // Increase timeout for generating static pages from default 60s to avoid issues like:
  // Restarted static page generation for /modules/xxx/y.y.y because it took more than 60 seconds
  staticPageGenerationTimeout: 600,

  exportPathMap: async function (defaultPathMap) {
    const newMap = { ...defaultPathMap }
    Object.keys(newMap).forEach((path) => {
      if (path.includes('boost.json')) {
        newMap[path.replace('boost.json', 'boost-json')] = newMap[path]
        delete newMap[path]
      }
    })
    return newMap
  },
}

module.exports = nextConfig

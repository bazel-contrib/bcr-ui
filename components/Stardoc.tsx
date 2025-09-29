import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { StardocModuleInfo } from '../data/stardoc'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCopy, faCheck } from '@fortawesome/free-solid-svg-icons'

interface StardocRendererProps {
  stardoc: StardocModuleInfo
}

// Helper function to generate anchor IDs
const generateAnchorId = (type: string, name: string): string => {
  // Strip leading slashes and clean the name
  const cleanName = name
    .replace(/^\/+/, '')
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .toLowerCase()

  if (type === 'file') {
    return cleanName
  }
  return `${type}-${cleanName}`
}

// Copy link component
const CopyLinkButton: React.FC<{ anchorId: string }> = ({ anchorId }) => {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    const url = `${window.location.origin}${window.location.pathname}#${anchorId}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
  }

  return (
    <button
      onClick={copyToClipboard}
      className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
      title="Copy link to this section"
    >
      <FontAwesomeIcon icon={copied ? faCheck : faCopy} className="w-3 h-3" />
    </button>
  )
}

// Shared markdown components with syntax highlighting
const markdownComponents = {
  code: ({ node, inline, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '')
    let language = match ? match[1] : ''

    // Map common Bazel/Starlark language aliases
    if (language === 'starlark' || language === 'bazel' || language === 'bzl') {
      language = 'python' // Use Python highlighting for Starlark
    }

    if (!inline && language) {
      return (
        <SyntaxHighlighter
          style={tomorrow}
          language={language}
          PreTag="div"
          className="rounded-md"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      )
    }

    return (
      <code
        className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono"
        {...props}
      >
        {children}
      </code>
    )
  },
  a: ({ href, children }: any) => {
    // Check if it's an external link
    const isExternal =
      href && (href.startsWith('http') || href.startsWith('//'))

    return (
      <a
        href={href}
        className="text-blue-600 hover:text-blue-800 underline"
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
      >
        {children}
      </a>
    )
  },
  // Enhanced paragraph component to handle automatic link detection
  p: ({ children }: any) => <p className="mb-2 leading-relaxed">{children}</p>,
  // Enhanced list components
  ul: ({ children }: any) => (
    <ul className="list-disc list-inside space-y-1 my-2 ml-4">{children}</ul>
  ),
  ol: ({ children }: any) => (
    <ol className="list-decimal list-inside space-y-1 my-2 ml-4">{children}</ol>
  ),
  // Enhanced heading components
  h1: ({ children }: any) => (
    <h1 className="text-2xl font-bold mt-6 mb-3 text-gray-900">{children}</h1>
  ),
  h2: ({ children }: any) => (
    <h2 className="text-xl font-semibold mt-5 mb-2 text-gray-900">
      {children}
    </h2>
  ),
  h3: ({ children }: any) => (
    <h3 className="text-lg font-medium mt-4 mb-2 text-gray-900">{children}</h3>
  ),
  h4: ({ children }: any) => (
    <h4 className="text-base font-medium mt-3 mb-2 text-gray-900">
      {children}
    </h4>
  ),
  // Blockquote styling
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-700 my-4">
      {children}
    </blockquote>
  ),
  // Table styling
  table: ({ children }: any) => (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full border border-gray-300">{children}</table>
    </div>
  ),
  th: ({ children }: any) => (
    <th className="border border-gray-300 px-4 py-2 bg-gray-100 font-semibold text-left">
      {children}
    </th>
  ),
  td: ({ children }: any) => (
    <td className="border border-gray-300 px-4 py-2">{children}</td>
  ),
}

export const StardocRenderer: React.FC<StardocRendererProps> = ({
  stardoc,
}) => {
  if (!stardoc) {
    return (
      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
        <p className="text-gray-500">No API documentation available</p>
      </div>
    )
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      {/* Module-level documentation */}
      {stardoc.moduleDocstring && (
        <div className="mb-6">
          {(() => {
            const fileAnchorId = generateAnchorId(
              'file',
              stardoc.file || 'module'
            )
            return (
              <div id={fileAnchorId} className="scroll-mt-20">
                <div className="flex items-center gap-2 mb-3">
                  <h4 className="text-lg font-medium font-mono text-gray-900">
                    {stardoc.file}
                  </h4>
                  <CopyLinkButton anchorId={fileAnchorId} />
                </div>
              </div>
            )
          })()}
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown
              components={markdownComponents}
              remarkPlugins={[remarkGfm, remarkBreaks]}
            >
              {stardoc.moduleDocstring}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* Functions */}
      {stardoc.funcInfo && stardoc.funcInfo.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-900 mb-3">
            Functions & Macros
          </h4>
          <div className="space-y-4">
            {stardoc.funcInfo.map((func, funcIndex) => {
              const anchorId = generateAnchorId('function', func.functionName)
              return (
                <div
                  key={funcIndex}
                  id={anchorId}
                  className="border-l-4 border-blue-500 pl-4 scroll-mt-20"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <code className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm font-mono">
                      {func.functionName}
                    </code>
                    <CopyLinkButton anchorId={anchorId} />
                  </div>
                  {func.docString && (
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown
                        components={markdownComponents}
                        remarkPlugins={[remarkGfm, remarkBreaks]}
                      >
                        {func.docString}
                      </ReactMarkdown>
                    </div>
                  )}

                  {/* Function parameters */}
                  {func.parameter && func.parameter.length > 0 && (
                    <div className="mt-3">
                      <h5 className="text-sm font-bold text-gray-700 mb-2">
                        Parameters
                      </h5>
                      <table className="w-full text-sm">
                        <tbody>
                          {func.parameter.map((param, paramIndex) => (
                            <tr key={paramIndex}>
                              <td className="align-top pr-3 py-1 w-32 whitespace-nowrap text-right">
                                <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                                  {param.name}
                                </code>
                              </td>
                              {param.docString && (
                                <td className="align-top text-gray-600 py-1">
                                  <ReactMarkdown
                                    components={markdownComponents}
                                    remarkPlugins={[remarkGfm, remarkBreaks]}
                                  >
                                    {param.docString}
                                  </ReactMarkdown>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Rules */}
      {stardoc.ruleInfo && stardoc.ruleInfo.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-900 mb-3">Rules</h4>
          <div className="space-y-4">
            {stardoc.ruleInfo.map((rule, ruleIndex) => {
              const anchorId = generateAnchorId('rule', rule.ruleName)
              return (
                <div
                  key={ruleIndex}
                  id={anchorId}
                  className="border-l-4 border-green-500 pl-4 scroll-mt-20"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <code className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm font-mono">
                      {rule.ruleName}
                    </code>
                    <CopyLinkButton anchorId={anchorId} />
                  </div>
                  {rule.docString && (
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown
                        components={markdownComponents}
                        remarkPlugins={[remarkGfm, remarkBreaks]}
                      >
                        {rule.docString}
                      </ReactMarkdown>
                    </div>
                  )}

                  {/* Rule attributes */}
                  {rule.attribute && rule.attribute.length > 0 && (
                    <div className="mt-3">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">
                        Attributes
                      </h5>
                      <table className="w-full text-sm">
                        <tbody>
                          {rule.attribute.map((attr, attrIndex) => (
                            <tr key={attrIndex}>
                              <td className="align-top pr-3 py-1 w-32 whitespace-nowrap text-right">
                                <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                                  {attr.name}
                                </code>
                              </td>
                              {attr.docString && (
                                <td className="align-top text-gray-600 py-1">
                                  <ReactMarkdown
                                    components={markdownComponents}
                                    remarkPlugins={[remarkGfm, remarkBreaks]}
                                  >
                                    {attr.docString}
                                  </ReactMarkdown>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Providers */}
      {stardoc.providerInfo && stardoc.providerInfo.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-900 mb-3">Providers</h4>
          <div className="space-y-4">
            {stardoc.providerInfo.map((provider, providerIndex) => {
              const anchorId = generateAnchorId(
                'provider',
                provider.providerName
              )
              return (
                <div
                  key={providerIndex}
                  id={anchorId}
                  className="border-l-4 border-purple-500 pl-4 scroll-mt-20"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <code className="bg-purple-100 text-purple-800 px-3 py-1 rounded text-sm font-mono">
                      {provider.providerName}
                    </code>
                    <CopyLinkButton anchorId={anchorId} />
                  </div>
                  {provider.docString && (
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown
                        components={markdownComponents}
                        remarkPlugins={[remarkGfm, remarkBreaks]}
                      >
                        {provider.docString}
                      </ReactMarkdown>
                    </div>
                  )}

                  {/* Provider fields */}
                  {provider.fieldInfo && provider.fieldInfo.length > 0 && (
                    <div className="mt-3">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">
                        Fields
                      </h5>
                      <table className="w-full text-sm">
                        <tbody>
                          {provider.fieldInfo.map((field, fieldIndex) => (
                            <tr key={fieldIndex}>
                              <td className="align-top pr-3 py-1 w-32 whitespace-nowrap text-right">
                                <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                                  {field.name}
                                </code>
                              </td>
                              {field.docString && (
                                <td className="align-top text-gray-600 py-1">
                                  <ReactMarkdown
                                    components={markdownComponents}
                                    remarkPlugins={[remarkGfm, remarkBreaks]}
                                  >
                                    {field.docString}
                                  </ReactMarkdown>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Aspects */}
      {stardoc.aspectInfo && stardoc.aspectInfo.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-900 mb-3">Aspects</h4>
          <div className="space-y-4">
            {stardoc.aspectInfo.map((aspect, aspectIndex) => {
              const anchorId = generateAnchorId('aspect', aspect.aspectName)
              return (
                <div
                  key={aspectIndex}
                  id={anchorId}
                  className="border-l-4 border-orange-500 pl-4 scroll-mt-20"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <code className="bg-orange-100 text-orange-800 px-3 py-1 rounded text-sm font-mono">
                      {aspect.aspectName}
                    </code>
                    <CopyLinkButton anchorId={anchorId} />
                  </div>
                  {aspect.docString && (
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown
                        components={markdownComponents}
                        remarkPlugins={[remarkGfm, remarkBreaks]}
                      >
                        {aspect.docString}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

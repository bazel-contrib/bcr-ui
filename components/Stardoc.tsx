import React from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { StardocModuleInfo } from '../data/stardoc'

interface StardocRendererProps {
  stardoc: StardocModuleInfo
  fileName?: string
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
  a: ({ href, children }: any) => (
    <a
      href={href}
      className="text-blue-600 hover:text-blue-800 underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
}

export const StardocRenderer: React.FC<StardocRendererProps> = ({
  stardoc,
  fileName,
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
          <h4 className="text-lg font-medium font-mono text-gray-900 mb-3">
            {stardoc.file}
          </h4>
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown components={markdownComponents}>
              {stardoc.moduleDocstring}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* Functions */}
      {stardoc.funcInfo && stardoc.funcInfo.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-900 mb-3">Functions</h4>
          <div className="space-y-4">
            {stardoc.funcInfo.map((func, funcIndex) => (
              <div key={funcIndex} className="border-l-4 border-blue-500 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <code className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm font-mono">
                    {func.functionName}
                  </code>
                </div>
                {func.docString && (
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown components={markdownComponents}>
                      {func.docString}
                    </ReactMarkdown>
                  </div>
                )}

                {/* Function parameters */}
                {func.parameter && func.parameter.length > 0 && (
                  <div className="mt-3">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">
                      Parameters
                    </h5>
                    <ul className="space-y-2">
                      {func.parameter.map((param, paramIndex) => (
                        <li key={paramIndex} className="text-sm">
                          <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                            {param.name}
                          </code>
                          {param.docString && (
                            <span className="ml-2 text-gray-600">
                              - {param.docString}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rules */}
      {stardoc.ruleInfo && stardoc.ruleInfo.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-900 mb-3">Rules</h4>
          <div className="space-y-4">
            {stardoc.ruleInfo.map((rule, ruleIndex) => (
              <div key={ruleIndex} className="border-l-4 border-green-500 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <code className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm font-mono">
                    {rule.ruleName}
                  </code>
                </div>
                {rule.docString && (
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown components={markdownComponents}>
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
                    <ul className="space-y-2">
                      {rule.attribute.map((attr, attrIndex) => (
                        <li key={attrIndex} className="text-sm">
                          <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                            {attr.name}
                          </code>
                          {attr.docString && (
                            <span className="ml-2 text-gray-600">
                              - {attr.docString}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Providers */}
      {stardoc.providerInfo && stardoc.providerInfo.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-900 mb-3">Providers</h4>
          <div className="space-y-4">
            {stardoc.providerInfo.map((provider, providerIndex) => (
              <div
                key={providerIndex}
                className="border-l-4 border-purple-500 pl-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <code className="bg-purple-100 text-purple-800 px-3 py-1 rounded text-sm font-mono">
                    {provider.providerName}
                  </code>
                </div>
                {provider.docString && (
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown components={markdownComponents}>
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
                    <ul className="space-y-2">
                      {provider.fieldInfo.map((field, fieldIndex) => (
                        <li key={fieldIndex} className="text-sm">
                          <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                            {field.name}
                          </code>
                          {field.docString && (
                            <span className="ml-2 text-gray-600">
                              - {field.docString}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Aspects */}
      {stardoc.aspectInfo && stardoc.aspectInfo.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-900 mb-3">Aspects</h4>
          <div className="space-y-4">
            {stardoc.aspectInfo.map((aspect, aspectIndex) => (
              <div
                key={aspectIndex}
                className="border-l-4 border-orange-500 pl-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <code className="bg-orange-100 text-orange-800 px-3 py-1 rounded text-sm font-mono">
                    {aspect.aspectName}
                  </code>
                </div>
                {aspect.docString && (
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown components={markdownComponents}>
                      {aspect.docString}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

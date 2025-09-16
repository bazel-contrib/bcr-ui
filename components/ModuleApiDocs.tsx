import React from 'react'
import type { ModuleInfo } from '@buf/bazel_bazel.bufbuild_es/src/main/java/com/google/devtools/build/skydoc/rendering/proto/stardoc_output_pb'

export interface ModuleApiDocsProps {
  moduleInfo: ModuleInfo
}

export const ModuleApiDocs: React.FC<ModuleApiDocsProps> = ({ moduleInfo }) => {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Module Header */}
      <div className="border-b pb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          API Documentation
        </h1>
        {moduleInfo.file && (
          <p className="text-gray-600 text-sm">
            Module:{' '}
            <code className="bg-gray-100 px-2 py-1 rounded">
              {moduleInfo.file}
            </code>
          </p>
        )}
        {moduleInfo.moduleDocstring && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-gray-800 whitespace-pre-wrap">
              {moduleInfo.moduleDocstring}
            </p>
          </div>
        )}
      </div>

      {/* Simple Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {moduleInfo.ruleInfo?.length > 0 && (
          <div className="bg-white border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {moduleInfo.ruleInfo.length}
            </div>
            <div className="text-sm text-gray-600">Rules</div>
          </div>
        )}
        {moduleInfo.providerInfo?.length > 0 && (
          <div className="bg-white border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {moduleInfo.providerInfo.length}
            </div>
            <div className="text-sm text-gray-600">Providers</div>
          </div>
        )}
        {moduleInfo.funcInfo?.length > 0 && (
          <div className="bg-white border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {moduleInfo.funcInfo.length}
            </div>
            <div className="text-sm text-gray-600">Functions</div>
          </div>
        )}
        {moduleInfo.aspectInfo?.length > 0 && (
          <div className="bg-white border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {moduleInfo.aspectInfo.length}
            </div>
            <div className="text-sm text-gray-600">Aspects</div>
          </div>
        )}
      </div>

      {/* Simple List View */}
      <div className="space-y-6">
        {moduleInfo.ruleInfo?.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Rules</h2>
            <div className="space-y-2">
              {moduleInfo.ruleInfo.map((rule: any, index: number) => (
                <div key={index} className="bg-white border rounded p-3">
                  <h3 className="font-medium text-gray-900">{rule.ruleName}</h3>
                  {rule.docString && (
                    <p className="text-gray-600 text-sm mt-1">
                      {rule.docString}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {moduleInfo.funcInfo?.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Functions
            </h2>
            <div className="space-y-2">
              {moduleInfo.funcInfo.map((func: any, index: number) => (
                <div key={index} className="bg-white border rounded p-3">
                  <h3 className="font-medium text-gray-900">
                    {func.functionName}
                  </h3>
                  {func.docString && (
                    <p className="text-gray-600 text-sm mt-1">
                      {func.docString}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

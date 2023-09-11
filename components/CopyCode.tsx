import Prism from "prismjs";
import "prismjs/components/prism-python";

import { faCopy } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useFloating } from '@floating-ui/react-dom'
import React, { useState, useEffect, useRef } from 'react'

export interface CopyCodeProps {
  module: string
  version: string
}

const runtimeDependencyTemplate = (name: string, version: string) => `bazel_dep(
  name = "${name}",
  version = "${version}",
)`

const devDependencyTemplate = (name: string, version: string) => `bazel_dep(
  name = "${name}",
  version = "${version}",
  dev_dependency = True,
)`

const codeTemplate = (name: string, version: string, dev: boolean = false) => {
  return (dev ? devDependencyTemplate : runtimeDependencyTemplate)(name, version);
}

export const CopyCode: React.FC<CopyCodeProps> = ({ module, version }) => {
  const devCheckbox = useRef();
  const [showCopied, setShowCopied] = useState<boolean>(false)
  const [isDevDependency, setIsDevDependency] = useState<boolean>(false)
  const [codeSample, setCodeSample] = useState<string>(
    codeTemplate(module, version, isDevDependency)
  )

  useEffect(() => {
    setCodeSample(codeTemplate(module, version, isDevDependency));
  }, [isDevDependency]);

  useEffect(() => {
    const highlight = async () => {
      await Prism.highlightAll()
    };
    highlight()
  }, [codeSample])

  const { x, y, refs, strategy } = useFloating({
    placement: 'top-end',
  })

  const handleClickCopy = async () => {
    await navigator.clipboard.writeText(codeSample)
    setShowCopied(true)
    setTimeout(() => {
      setShowCopied(false)
    }, 2000)
  }

  const handleDevStateChange = async () => {
    setIsDevDependency(!isDevDependency);
  }

  return (
    <>
      <div className="pt-2">
        <details className="codesample-controls my-4 control">
          <summary className="control decorative">Customize this sample</summary>
          <pre className="my-2">
            <input className="mx-2" type="checkbox" onChange={handleDevStateChange} name="devDependency" />
            <label htmlFor="devDependency">Dev dependency</label>
          </pre>
        </details>
      </div>
      <button
        ref={refs.setReference}
        className="w-full flex justify-between items-center px-2 my-4 rounded bg-gray-200 group hover:bg-gray-100 border hover:border-gray-800 cursor-pointer"
        title="Copy MODULE.bazel snippet to clipboard"
        onClick={handleClickCopy}
      >
        <pre className="codesample language-python">
          <code>{codeSample}</code>
        </pre>
        <div className="text-gray-500 group-hover:text-black">
          <FontAwesomeIcon icon={faCopy} />
        </div>
      </button>
      {
        <div
          ref={refs.setFloating}
          style={{
            position: strategy,
            top: y ?? 0,
            left: x ?? 0,
            opacity: showCopied ? 1 : 0,
          }}
          className="bg-black text-white rounded p-2 transition transition-opacity duration-300"
        >
          Copied to clipboard!
        </div>
      }
    </>
  )
}

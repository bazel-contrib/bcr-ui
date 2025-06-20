import { faCopy } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useFloating } from '@floating-ui/react-dom'
import React, { useState } from 'react'
import { faClone } from '@fortawesome/free-solid-svg-icons'

export interface CopyCodeProps {
  code: string
}

export const CopyCode: React.FC<CopyCodeProps> = ({ code }) => {
  const [showCopied, setShowCopied] = useState<boolean>(false)

  const { x, y, refs, strategy } = useFloating({
    placement: 'top-end',
  })

  const handleClickCopy = async () => {
    await navigator.clipboard.writeText(code)
    setShowCopied(true)
    setTimeout(() => {
      setShowCopied(false)
    }, 2000)
  }

  return (
    <>
      <button
        ref={refs.setReference}
        className="w-full flex justify-between items-center pt-3 pb-3 pl-4 pr-4 my-4  border-2 border-green-800 rounded-full group bg-green-700 bg-opacity-5 hover:bg-opacity-20 hover:border-bzl-green cursor-pointer"
        title="Copy MODULE.bazel snippet to clipboard"
        onClick={handleClickCopy}
      >
        <code>{code}</code>
        <div className="text-green-700 group-hover:text-bzl-green group-hover:scale-110">
          <FontAwesomeIcon icon={faClone} />
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

import { faCopy } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useFloating } from '@floating-ui/react-dom'
import React, { useState } from 'react'

export interface CopyCodeProps {
  code: string
}

export const CopyCode: React.FC<CopyCodeProps> = ({ code }) => {
  const [showCopied, setShowCopied] = useState<boolean>(false)

  const { x, y, reference, floating, strategy } = useFloating({
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
        ref={reference}
        className="w-full flex justify-between items-center p-2 my-4 rounded bg-gray-200 group hover:bg-gray-100 border hover:border-gray-800 cursor-pointer"
        title="Copy MODULE.bazel snippet to clipboard"
        onClick={handleClickCopy}
      >
        <code>{code}</code>
        <div className="text-gray-500 group-hover:text-black">
          <FontAwesomeIcon icon={faCopy} />
        </div>
      </button>
      {
        <div
          ref={floating}
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

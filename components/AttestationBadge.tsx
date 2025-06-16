import React, { useState } from 'react'
import { useFloating } from '@floating-ui/react-dom'

export interface AttestationBadgeProps {
  hasAttestationFile: boolean
}

export const AttestationBadge: React.FC<AttestationBadgeProps> = ({
  hasAttestationFile,
}) => {
  const [showTooltip, setShowTooltip] = useState<boolean>(false)

  const { x, y, refs, strategy } = useFloating({
    placement: 'top',
  })

  if (!hasAttestationFile) {
    return null
  }

  return (
    <>
      <span
        ref={refs.setReference}
        className="text-blue-600 font-bold text-lg cursor-help"
        aria-label="Attested release provenance"
        role="img"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
      >
        ✓
      </span>
      {showTooltip && (
        <div
          ref={refs.setFloating}
          style={{
            position: strategy,
            top: y ?? 0,
            left: x ?? 0,
            zIndex: 1000,
          }}
          className="bg-gray-900 text-white text-sm rounded p-3 max-w-sm shadow-lg"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          This release includes a provenance attestation, which is verifiable
          proof that it was built using secure, trusted build infrastructure.
          See{' '}
          <a
            href="https://github.com/bazelbuild/bazel-central-registry/discussions/2721"
            className="text-blue-300 underline hover:text-blue-200"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            https://github.com/bazelbuild/bazel-central-registry/discussions/2721
          </a>
        </div>
      )}
    </>
  )
}

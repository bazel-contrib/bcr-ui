import React from 'react'

export interface AttestationBadgeProps {
  hasAttestationFile: boolean
}

export const AttestationBadge: React.FC<AttestationBadgeProps> = ({
  hasAttestationFile,
}) => {
  if (!hasAttestationFile) {
    return null
  }

  return (
    <span
      className="text-blue-600 font-bold text-lg cursor-help"
      title="This release includes a provenance attestation, which is verifiable proof that it was built using secure, trusted build infrastructure. See https://github.com/bazelbuild/bazel-central-registry/discussions/2721"
      aria-label="Attested release provenance"
      role="img"
    >
      ✓
    </span>
  )
}

import React from 'react'

interface FooterProps {}

export const REPORT_LINK =
  'https://github.com/bazelbuild/bazel-central-registry/tree/main/docs#requesting-to-take-down-a-module'
export const BCR_UI_REPO_LINK = 'https://github.com/bazel-contrib/bcr-ui'

export const Footer: React.FC<FooterProps> = () => {
  return (
    <footer className="flex flex-col items-center justify-center gap-2 h-18 mt-4 bottom-2">
      <div className="text-center">
        The Bazel Central Registry is maintained by the Bazel team and the Bazel
        Rules authors SIG.
      </div>
      <div className="text-center">
        To report an issue with one of the modules, see the{' '}
        <a
          href={REPORT_LINK}
          className="text-link-color hover:text-link-color-hover"
        >
          instructions here
        </a>
        .
      </div>
      <div className="text-center">
        The source of this website can be found in{' '}
        <a
          href={BCR_UI_REPO_LINK}
          className="text-link-color hover:text-link-color-hover"
        >
          this repository
        </a>
        .
      </div>
    </footer>
  )
}

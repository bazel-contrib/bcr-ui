# Eclipse S-CORE Bazel Registry Modules Web UI

This repository provides a web UI for the [Eclipse S‑CORE Bazel Modules Registry](https://github.com/eclipse-score/bazel_registry).
It entirely consists of statically rendered pages, which are updated as soon as a new commit is pushed to the BCR.

## Contributing

We are happy about any contributions!

To get started you can take a look at our [Github issues](https://github.com/hobofan/bcr-web-ui/issues).

Unless you explicitly state otherwise, any contribution intentionally
submitted for inclusion in the work by you, as defined in the Apache-2.0
license, shall be licensed as below, without any additional terms or
conditions.

### Getting Started

We use git submodules to include the data from bazelbuild/bazel-central-registry, so after cloning this repo you need to run:

```bash
git submodule update --init
```

To get a buildozer binary, you also need to run this before launching the app:

```bash
./install_bins.sh
```

Packages are managed via [pnpm](https://pnpm.io/), so they can be installed via `npx pnpm install`

Then, run the development server:

```bash
npm run dev
```

Open <http://localhost:3000/bazel-central-registry> with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

### Learn More about Next.js

The page is built on top of Next.js.

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## License

Licensed under Apache License, Version 2.0, ([LICENSE](LICENSE) or http://www.apache.org/licenses/LICENSE-2.0)

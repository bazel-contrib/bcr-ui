#!/usr/bin/env bash

set -o errexit -o nounset -o pipefail

# Minimum required version: https://github.com/cli/cli/releases/tag/v2.49.0
REQUIRED_GH_VERSION="2.49.0"

# Check if gh is available
if ! command -v gh &> /dev/null; then
    echo "Error: GitHub CLI (gh) is not installed or not in your PATH."
    exit 1
fi

# Ensure gh is logged in
if ! gh auth status &> /dev/null; then
    echo "Error: GitHub CLI (gh) is not logged in."
    exit 1
fi

OUT=$(mktemp -d)
# current script directory
SCRIPT_DIR=$(dirname "$0")
(
    cd $SCRIPT_DIR/../../data/bazel-central-registry/modules
    for module in $(ls); do
        # GraphQL: Although you appear to have the correct authorization credentials, the `confluentinc` organization has an IP allow list enabled, and your IP address is not permitted to access this resource.
        if [[ "$module" == "librdkafka" ]]; then
            echo "  Skipping $module (known access restrictions)"
            continue
        fi
        
        echo "Fetching metadata for $module"
        organdrepo=$(jq --raw-output <$module/metadata.json '.repository[] | select(startswith("github:")) | sub("github:"; "")' | head -1)
        
        # Skip if no GitHub repository found
        if [[ -z "$organdrepo" || "$organdrepo" == "null" ]]; then
            echo "  No GitHub repository found, skipping..."
            continue
        fi
        
        gh repo view --json description,licenseInfo,repositoryTopics,stargazerCount,isArchived,fundingLinks "$organdrepo" > $OUT/$module.github_metadata.json
    done
)

echo metadata=$OUT >> ${GITHUB_OUTPUT:-/dev/stdout}

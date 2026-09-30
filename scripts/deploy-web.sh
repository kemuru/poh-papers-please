#!/bin/sh
# Publishes the game as this checkout builds it (uncommitted changes included) to GitHub Pages, free:
#   https://kemuru.github.io/poh-papers-please/
# Only the built page, its script, its stylesheet and its fonts go up, to this repository's gh-pages branch,
# replacing what was there (one commit, force-pushed); main and the working tree are left as they are. GitHub Pages
# serves that branch (Settings > Pages: Deploy from a branch, gh-pages, / (root)); on a free account the
# repository must be public. Needs git and the GitHub CLI (gh), logged in. The page updates a minute or two after.
set -eu
REPO=kemuru/poh-papers-please
SRC=$(pwd)
OUT=$(mktemp -d)
trap 'rm -rf "$OUT"' EXIT

npx vite build --base=./ --outDir "$OUT/site" --emptyOutDir
# GitHub Pages serves the files as they are, with no Jekyll build.
touch "$OUT/site/.nojekyll"

VERSION=$(git -C "$SRC" rev-parse --short HEAD)
git -C "$SRC" diff --quiet HEAD || VERSION="$VERSION, with uncommitted changes"
cd "$OUT/site"
git init -q -b gh-pages
git add -A
git commit -q -m "Deploy the game as built from $VERSION"
git push -q --force "https://github.com/$REPO.git" gh-pages
echo "Published: https://kemuru.github.io/poh-papers-please/"

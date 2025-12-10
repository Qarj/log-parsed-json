# Options for publishing

## Option A: just push

-   Edit package.json version (or use npm to bump without tagging).
-   Commit and push to main/master. The workflow checks:
    -   local package.json version vs npm’s current version,
    -   only publishes when they differ.

Example:

```sh
npm --no-git-tag-version version patch
git commit -am "Bump to 0.0.62"
git push
```

## Option B: One-command tag-based release (intentional publish)

```sh
npm version patch -m "Release %s"
git push --follow-tags
```

-   This bumps version, creates the tag, and a single push sends both commit and tag.

## Option C: Manual tag-based release (intentional publish)

Edit `package.json` version manually.

```sh
git commit -am "chore: bump version to 0.0.61"
git tag -a v0.0.61 -m "Release 0.0.61"
git push origin v0.0.61
```

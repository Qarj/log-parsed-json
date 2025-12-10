# Publishing log-parsed-json (Trusted Publisher via GitHub OIDC)

Ensure all changes are committed, then run:

```sh
npm version patch -m "Release %s"
git push --follow-tags
```

This bumps the version, creates the tag, and a single push sends both the commit and tag. The workflow will publish via OIDC.

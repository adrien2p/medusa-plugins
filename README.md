# Development

## Plugin

Go to the plugin package directory and Build your local plugin

```bash
npm run build
npm pack
```

Then copy the tgz file newly creating by the `pack` command into your project.

## Target project

In your target project past the tgz file previously copied.
then update your `package.json`

```bash
"my-package": "file:my-package-1.0.0.tgz"
```

now run `npm i` and run your project
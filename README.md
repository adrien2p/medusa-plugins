# Development

## Plugin

Go to the plugin package directory and Build your local plugin

````bash
npm run build
````

Install production only packages

```bash
rm -rf node_modules && npm i --only=production
``` 

## Target project

In your target project that need to use a plugin that you want to test locally

```bash
npm link ... # The path the your local plugin
```

update your package.json start script with 

```json
{
  "scripts": {
    "start": 'node node --preserve-symlinks ...'
  }
}
```
<p align="center" style="margin-top: 4rem">
  <img src="https://raw.githubusercontent.com/adrien2p/medusa-plugins/assets/assets/medusa-plugin-auth-logo.png?raw=true" alt="Medusa-plugins logo" width="200" height="auto" />
</p>


<h1 align="center">medusa-plugin-auth</h1>

<p align="center">
	<a href="https://www.npmjs.com/package/medusa-plugin-auth"><img alt="NPM Version" src="https://img.shields.io/npm/v/medusa-plugin-auth.svg" height="20"/></a>
	<a href="https://github.com/adrien2p/medusa-plugins/graphs/contributors"><img alt="Contributors" src="https://img.shields.io/github/contributors/adrien2p/medusa-plugins.svg" height="20"/></a>
	<a href="https://github.com/adrien2p/awesome-medusajs"><img alt="Awesome medusajs" src="https://awesome.re/badge.svg" height="20"/></a>
	<a href="https://twitter.com/intent/tweet?text=Check%20this%20out!%20The%20new%20medusa%auth%20plugin&url=https://github.com/adrien2p/medusa-plugins/tree/main/packages/medusa-plugin-auth"><img alt="Twitter" src="https://badgen.net/badge/icon/twitter?icon=twitter&label=Share%20it%20on" height="20"/></a>
	<a href="https://discord.gg/xpCwq3Kfn8"><img alt="Discord" src="https://img.shields.io/badge/chat-on%20discord-7289DA.svg" height="20"/></a>
	<a href="https://github.com/adrien2p/medusa-plugins/commits/main"><img alt="Activity" src="https://img.shields.io/github/commit-activity/m/adrien2p/medusa-plugins?style=flat" height="20"/></a>
	<a href="https://github.com/adrien2p/medusa-plugins/issues"><img alt="Issues" src="https://img.shields.io/github/issues/adrien2p/medusa-plugins?style=flat" height="20"/></a>
</p>

## Description

Social authentication for the admin and store client.

## Getting started

First of all, you need to install the plugin as follow `yarn add medusa-plugin-auth`

## Strategies

- [Google](#google)
- [Facebook](#facebook)
- [Twitter](#twitter)
- [Linkedin](#linkedin)
- [Github](#github)
- [Microsoft](#microsoft)

### Google

You need to set up your Google OAuth 2 credentials and content screen in your developer console. You can follow the steps that are here https://support.google.com/cloud/answer/6158849?hl=en

Then, in your medusa config plugins collection you can add the following configuration and update it according to your requirements

```ts
{
    resolve: "medusa-plugin-auth",
    options: {
        // Enable google OAuth 2
        google: {
            clientID: "__YOUR_CLIENT_ID__",
            clientSecret: "__YOUR_CLIENT_SECRET__",
            // Enable google OAuth 2 for the admin domain
            admin: {
                callbackUrl:`${process.env.BACKEND_URL}/admin/auth/google/cb`, 
                failureRedirect: `${process.env.ADMIN_URL}/login`,
                successRedirect: `${process.env.ADMIN_URL}/`,
                authPath: "/admin/auth/google/cb",
                authCallbackPath: "/admin/auth/google/cb", 
              
                expiresIn: "24h"
            },
            // Enable google OAuth 2 for the store domain
            store: {
                callbackUrl:`${process.env.BACKEND_URL}/store/auth/google/cb`, 
                failureRedirect: `${process.env.STORE_URL}/login`,
                successRedirect: `${process.env.STORE_URL}/`,
                authPath: "/store/auth/google/cb",
                authCallbackPath: "/store/auth/google/cb",
                
                expiresIn: "30d"
            }
        }
    }
}
```

Now you can add your Google sign in button in your client with something along the lime of the code bellow

```html
<button aria-label="Continue with google" role="button" class="focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-700 py-3.5 px-4 border rounded-lg border-gray-700 flex items-center w-full mt-10">
    <img src="https://tuk-cdn.s3.amazonaws.com/can-uploader/sign_in-svg2.svg" alt="google">
    <p class="text-base font-medium ml-4 text-gray-700">Continue with Google</p>
</button>
```

### Facebook

Coming soon

### Twitter

Coming soon

### Linkedin

Coming soon

### Github

Coming soon

### Microsoft

Coming soon
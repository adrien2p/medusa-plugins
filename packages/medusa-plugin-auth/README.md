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
- [Linkedin](#linkedin)
- [Auth0](#auth0)
- [Twitter](#twitter)
- [Github](#github)
- [Microsoft](#microsoft)

### Google

> By default, the admin only allow to authenticate while the store create a new user of it does not exist yet.
> This behaviour can be changed and customised by specifying a custom `verifyCallback` in the configuration.

Then, in your medusa config plugins collection you can add the following configuration and update it according to your requirements ([full configuration here](https://github.com/adrien2p/medusa-plugins/tree/main/packages/medusa-plugin-auth/src/auth-strategies/google/types.ts))

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
                expiresIn: 24 * 60 * 60 * 1000
            },
            // Enable google OAuth 2 for the store domain
            store: {
                callbackUrl:`${process.env.BACKEND_URL}/store/auth/google/cb`, 
                failureRedirect: `${process.env.STORE_URL}/login`,
                successRedirect: `${process.env.STORE_URL}/`,
                expiresIn: 24 * 60 * 60 * 1000
            }
        }
        // ...
        // ... Other authentication provider options
        // ...
    }
}
```

Now you can add your Google sign in button in your client with something along the line of the code bellow

```html
<a type="button" href=${medusa_url}/${google_authPath} className="text-white bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#4285F4]/55 mr-2 mb-2">
  <svg className="mr-2 -ml-1 w-4 h-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
  Sign in with Google
</a>
```

### Facebook

> By default, the admin only allow to authenticate while the store create a new user of it does not exist yet.
> This behaviour can be changed and customised by specifying a custom `verifyCallback` in the configuration.

Then, in your medusa config plugins collection you can add the following configuration and update it according to your requirements ([full configuration here](https://github.com/adrien2p/medusa-plugins/tree/main/packages/medusa-plugin-auth/src/auth-strategies/facebook/types.ts))

```ts
{
    resolve: "medusa-plugin-auth",
    options: {
        // Enable facebook OAuth 2
        facebook: {
            clientID: "__YOUR_CLIENT_ID__",
            clientSecret: "__YOUR_CLIENT_SECRET__",
            // Enable facebook OAuth 2 for the admin domain
            admin: {
                callbackUrl:`${process.env.BACKEND_URL}/admin/auth/facebook/cb`, 
                failureRedirect: `${process.env.ADMIN_URL}/login`,
                successRedirect: `${process.env.ADMIN_URL}/`,
                expiresIn: 24 * 60 * 60 * 1000
            },
            // Enable facebook OAuth 2 for the store domain
            store: {
                callbackUrl:`${process.env.BACKEND_URL}/store/auth/facebook/cb`, 
                failureRedirect: `${process.env.STORE_URL}/login`,
                successRedirect: `${process.env.STORE_URL}/`,
                expiresIn: 24 * 60 * 60 * 1000
            }
        }
        // ...
        // ... Other authentication provider options
        // ...
    }
}
```

Now you can add your Facebook sign in button in your client with something along the line of the code bellow

```html
<a href="${medusa_url}/${facebook_authPath}" type="button" class="text-white bg-[#3b5998] hover:bg-[#3b5998]/90 focus:ring-4 focus:outline-none focus:ring-[#3b5998]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#3b5998]/55 mr-2 mb-2">
  <svg class="mr-2 -ml-1 w-4 h-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="facebook-f" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path fill="currentColor" d="M279.1 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.4 0 225.4 0c-73.22 0-121.1 44.38-121.1 124.7v70.62H22.89V288h81.39v224h100.2V288z"></path></svg>
  Sign in with Facebook
</a>
```

### Twitter

// Waiting the OAuth 2 from twitter to be completely finalised

### Linkedin

> By default, the admin only allow to authenticate while the store create a new user of it does not exist yet.
> This behaviour can be changed and customised by specifying a custom `verifyCallback` in the configuration.

Then, in your medusa config plugins collection you can add the following configuration and update it according to your requirements ([full configuration here](https://github.com/adrien2p/medusa-plugins/tree/main/packages/medusa-plugin-auth/src/auth-strategies/linkedin/types.ts))

```ts
{
    resolve: "medusa-plugin-auth",
    options: {
        // Enable linkedin OAuth 2
        linkedin: {
            clientID: "__YOUR_CLIENT_ID__",
            clientSecret: "__YOUR_CLIENT_SECRET__",
            // Enable linkedin OAuth 2 for the admin domain
            admin: {
                callbackUrl:`${process.env.BACKEND_URL}/admin/auth/linkedin/cb`, 
                failureRedirect: `${process.env.ADMIN_URL}/login`,
                successRedirect: `${process.env.ADMIN_URL}/`,
                expiresIn: 24 * 60 * 60 * 1000
            },
            // Enable linkedin OAuth 2 for the store domain
            store: {
                callbackUrl:`${process.env.BACKEND_URL}/store/auth/linkedin/cb`, 
                failureRedirect: `${process.env.STORE_URL}/login`,
                successRedirect: `${process.env.STORE_URL}/`,
                expiresIn: 24 * 60 * 60 * 1000
            }
        }
        // ...
        // ... Other authentication provider options
        // ...
    }
}
```

Now you can add your Linkedin sign in button in your client with something along the line of the code bellow

```html
<a href="${medusa_url}/${linkedin_authPath}" type="button" class="text-white bg-[#2663eb] hover:bg-[#2663eb]/90 focus:ring-4 focus:outline-none focus:ring-[#2663eb]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#2663eb]/55 mr-2 mb-2">
  <svg class="mr-2 -ml-1 w-4 h-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="linkedin" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path fill="currentColor" d="M218.123122,218.127392 L180.191928,218.127392 L180.191928,158.724263 C180.191928,144.559023 179.939053,126.323993 160.463756,126.323993 C140.707926,126.323993 137.685284,141.757585 137.685284,157.692986 L137.685284,218.123441 L99.7540894,218.123441 L99.7540894,95.9665207 L136.168036,95.9665207 L136.168036,112.660562 L136.677736,112.660562 C144.102746,99.9650027 157.908637,92.3824528 172.605689,92.9280076 C211.050535,92.9280076 218.138927,118.216023 218.138927,151.114151 L218.123122,218.127392 Z M56.9550587,79.2685282 C44.7981969,79.2707099 34.9413443,69.4171797 34.9391618,57.260052 C34.93698,45.1029244 44.7902948,35.2458562 56.9471566,35.2436736 C69.1040185,35.2414916 78.9608713,45.0950217 78.963054,57.2521493 C78.9641017,63.090208 76.6459976,68.6895714 72.5186979,72.8184433 C68.3913982,76.9473153 62.7929898,79.26748 56.9550587,79.2685282 M75.9206558,218.127392 L37.94995,218.127392 L37.94995,95.9665207 L75.9206558,95.9665207 L75.9206558,218.127392 Z M237.033403,0.0182577091 L18.8895249,0.0182577091 C8.57959469,-0.0980923971 0.124827038,8.16056231 -0.001,18.4706066 L-0.001,237.524091 C0.120519052,247.839103 8.57460631,256.105934 18.8895249,255.9977 L237.033403,255.9977 C247.368728,256.125818 255.855922,247.859464 255.999,237.524091 L255.999,18.4548016 C255.851624,8.12438979 247.363742,-0.133792868 237.033403,0.000790807055"></path></svg>
  Sign in with Linkedin
</a>
```

### Auth0

Coming soon

### Github

Coming soon

### Microsoft

Coming soon

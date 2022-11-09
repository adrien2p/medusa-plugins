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
                authPath: "/admin/auth/google",
                authCallbackPath: "/admin/auth/google/cb",
              
                expiresIn: 24 * 60 * 60 * 1000
            },
            // Enable google OAuth 2 for the store domain
            store: {
                callbackUrl:`${process.env.BACKEND_URL}/store/auth/google/cb`, 
                failureRedirect: `${process.env.STORE_URL}/login`,
                successRedirect: `${process.env.STORE_URL}/`,
                authPath: "/store/auth/google",
                authCallbackPath: "/store/auth/google/cb",
                
                expiresIn: 24 * 60 * 60 * 1000
            }
        }
    }
}
```

Now you can add your Google sign in button in your client with something along the line of the code bellow

```html
<a
  type="button"
  href=`${medusa_url}/${google_authPath}`
  className="text-white bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#4285F4]/55 mr-2 mb-2"
>
  <svg
    className="mr-2 -ml-1 w-4 h-4"
    aria-hidden="true"
    focusable="false"
    data-prefix="fab"
    data-icon="google"
    role="img"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 488 512"
  >
    <path
      fill="currentColor"
      d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
    ></path>
  </svg>
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
                authPath: "/admin/auth/facebook",
                authCallbackPath: "/admin/auth/facebook/cb",
              
                expiresIn: 24 * 60 * 60 * 1000
            },
            // Enable facebook OAuth 2 for the store domain
            store: {
                callbackUrl:`${process.env.BACKEND_URL}/store/auth/facebook/cb`, 
                failureRedirect: `${process.env.STORE_URL}/login`,
                successRedirect: `${process.env.STORE_URL}/`,
                authPath: "/store/auth/facebook",
                authCallbackPath: "/store/auth/facebook/cb",
                
                expiresIn: 24 * 60 * 60 * 1000
            }
        }
    }
}
```

Now you can add your Facebook sign in button in your client with something along the line of the code bellow

```html
<a
  type="button"
  href=`${medusa_url}/${facebook_authPath}`
  className="text-white bg-[#3b5998] hover:bg-[#3b5998]/90 focus:ring-4 focus:outline-none focus:ring-[#3b5998]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#3b5998]/55 mr-2 mb-2"
>
  <svg
    className="mr-2 -ml-1 w-4 h-4"
    aria-hidden="true"
    focusable="false"
    data-prefix="fab"
    data-icon="facebook-f"
    role="img"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 320 512"
  >
    <path
      fill="currentColor"
      d="M279.1 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.4 0 225.4 0c-73.22 0-121.1 44.38-121.1 124.7v70.62H22.89V288h81.39v224h100.2V288z"
    ></path>
  </svg>
  Sign in with Facebook
</a>
```

### Twitter

> Thw Twitter strategy can't be used for the moment and require to wait for twitter to implement the necessary
> scopes to retrieve a user email in order to complete the authentication flow.
> In any case, you still can use this strategy and provide a custom `verifyCallback` if you know what you are doing.

> By default, the admin only allow to authenticate while the store create a new user of it does not exist yet.
> This behaviour can be changed and customised by specifying a custom `verifyCallback` in the configuration.

Then, in your medusa config plugins collection you can add the following configuration and update it according to your requirements ([full configuration here](https://github.com/adrien2p/medusa-plugins/tree/main/packages/medusa-plugin-auth/src/auth-strategies/twitter/types.ts))

```ts
{
    resolve: "medusa-plugin-auth",
    options: {
        // Enable twitter OAuth
        twitter: {
            clientID: "__YOUR_CLIENT_ID__",
            clientSecret: "__YOUR_CLIENT_SECRET__",
            // Enable twitter OAuth for the admin domain
            admin: {
                callbackUrl:`${process.env.BACKEND_URL}/admin/auth/twitter/cb`, 
                failureRedirect: `${process.env.ADMIN_URL}/login`,
                successRedirect: `${process.env.ADMIN_URL}/`,
                authPath: "/admin/auth/twitter",
                authCallbackPath: "/admin/auth/twitter/cb",
              
                expiresIn: 24 * 60 * 60 * 1000
            },
            // Enable twitter OAuth for the store domain
            store: {
                callbackUrl:`${process.env.BACKEND_URL}/store/auth/twitter/cb`, 
                failureRedirect: `${process.env.STORE_URL}/login`,
                successRedirect: `${process.env.STORE_URL}/`,
                authPath: "/store/auth/twitter",
                authCallbackPath: "/store/auth/twitter/cb",
                
                expiresIn: 24 * 60 * 60 * 1000
            }
        }
    }
}
```

Now you can add your Twitter sign in button in your client with something along the line of the code bellow

```html
<a
  type="button"
  href=`${medusa_url}/${twitter_authPath}`
  className="text-white bg-[#3b5998] hover:bg-[#3b5998]/90 focus:ring-4 focus:outline-none focus:ring-[#3b5998]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#3b5998]/55 mr-2 mb-2"
>
    <svg
        className="mr-2 -ml-1 w-4 h-4"
        aria-hidden="true"
        focusable="false"
        data-prefix="fab"
        data-icon="twitter"
        role="img"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
    >
        <path
          fill="currentColor"
          d="M459.4 151.7c.325 4.548 .325 9.097 .325 13.65 0 138.7-105.6 298.6-298.6 298.6-59.45 0-114.7-17.22-161.1-47.11 8.447 .974 16.57 1.299 25.34 1.299 49.06 0 94.21-16.57 130.3-44.83-46.13-.975-84.79-31.19-98.11-72.77 6.498 .974 12.99 1.624 19.82 1.624 9.421 0 18.84-1.3 27.61-3.573-48.08-9.747-84.14-51.98-84.14-102.1v-1.299c13.97 7.797 30.21 12.67 47.43 13.32-28.26-18.84-46.78-51.01-46.78-87.39 0-19.49 5.197-37.36 14.29-52.95 51.65 63.67 129.3 105.3 216.4 109.8-1.624-7.797-2.599-15.92-2.599-24.04 0-57.83 46.78-104.9 104.9-104.9 30.21 0 57.5 12.67 76.67 33.14 23.72-4.548 46.46-13.32 66.6-25.34-7.798 24.37-24.37 44.83-46.13 57.83 21.12-2.273 41.58-8.122 60.43-16.24-14.29 20.79-32.16 39.31-52.63 54.25z"
        ></path>
    </svg>
    Sign in with Twitter
</a>
```

### Linkedin

Coming soon

### Github

Coming soon

### Microsoft

Coming soon

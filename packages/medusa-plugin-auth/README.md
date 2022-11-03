<h1 align="center">medusa-plugin-auth</h1>

## Description

JavaScript Error and Performance Monitoring
Resolve JavaScript errors with max efficiency, not max effort. Get actionable insights to resolve JavaScript performance issues with the ability to track, debug, and resolve JavaScript errors across platforms.

## Getting started

First of all, you need to install the plugin as follow `yarn add medusa-plugin-auth`

# Google

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
                authCallback:`${process.env.BACKEND_URL}/admin/auth/google/cb`, 
                failureRedirect: `${process.env.ADMIN_URL}/login`,
                successRedirect: `${process.env.ADMIN_URL}/`,
                authPath: "/admin/auth/google/cb",
                authCallbackPath: "/admin/auth/google/cb", 
            },
            // Enable google OAuth 2 for the store domain
            store: {
                authCallback:`${process.env.BACKEND_URL}/store/auth/google/cb`, 
                failureRedirect: `${process.env.STORE_URL}/login`,
                successRedirect: `${process.env.STORE_URL}/`,
                authPath: "/store/auth/google/cb",
                authCallbackPath: "/store/auth/google/cb", 
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
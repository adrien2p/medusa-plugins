import { useRouter } from 'next/router'
import { useConfig } from 'nextra-theme-docs'

export default {
  project: {
    link: 'https://github.com/adrien2p/medusa-plugins',
  },

  chat: {
    link: 'https://discord.gg/xpCwq3Kfn8',
  },

  navigation: {
    prev: true,
    next: true
  },

	footer: {
    text: () => {
      return (
        <span>
          MIT {new Date().getFullYear()} © <a href="https://nextra.site" target="_blank">Medusa plugins</a>.
          <div style={{display: "flex", marginTop: "0.5rem"}}>
            <a href="https://github.com/adrien2p/awesome-medusajs"><img alt="Awesome medusajs" src="https://awesome.re/badge.svg" height="20"/></a>
            <a style={{marginLeft: "0.5rem"}} href="https://discord.gg/xpCwq3Kfn8"><img alt="Discord" src="https://img.shields.io/badge/chat-on%20discord-7289DA.svg" height="20"/></a>
            <a style={{marginLeft: "0.5rem"}} href="https://github.com/adrien2p/medusa-plugins/commits/main"><img alt="Activity" src="https://img.shields.io/github/commit-activity/m/adrien2p/medusa-plugins?style=flat" height="20"/></a>
            <a style={{marginLeft: "0.5rem"}} href="https://github.com/adrien2p/medusa-plugins/issues"><img alt="Issues" src="https://img.shields.io/github/issues/adrien2p/medusa-plugins?style=flat" height="20"/></a>
            <a style={{marginLeft: "0.5rem"}} href="https://github.com/adrien2p/medusa-plugins/blob/main/LICENSE"><img alt="Licence" src="https://img.shields.io/github/license/adrien2p/medusa-plugins?style=flat" height="20"/></a>
            <a style={{marginLeft: "0.5rem"}} href="https://github.com/adrien2p/medusa-plugins/blob/main/CONTRIBUTING.md"><img alt="Contributing" src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat" height="20"/></a>
            <a style={{marginLeft: "0.5rem"}} href="https://github.com/sponsors/adrien2p"><img alt="sponsor" src="https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=GitHub&color=%23fe8e86" height="20"/></a>
          </div>
        </span>
      )
    },
  },

  // Dark mode related
  darkMode: true,

  // Edit this page and feedback related
  docsRepositoryBase: "https://github.com/adrien2p/medusa-plugins/tree/main/docs/",

  // SEO related
  useNextSeoProps() {
    return {
      titleTemplate: 'Medusa plugins - %s'
    }
  },

  // HEAD related
  head: () => {
    const { asPath } = useRouter()
    const { frontMatter } = useConfig()

    return <>
      <meta property="og:url" content={`https://medusa-plugins.vercel.app${asPath}`} />
      <meta property="og:title" content={frontMatter.title || 'Medusa plugins'} />
      <meta property="og:description" content={frontMatter.description || 'A collection of awesome plugins for medusa, made by the community for the community'} />
      <meta property="og:image" content="https://raw.githubusercontent.com/adrien2p/medusa-plugins/assets/assets/doc-home-page.png" />

      <meta name="twitter:card" content="https://raw.githubusercontent.com/adrien2p/medusa-plugins/assets/assets/doc-home-page.png" />
      <meta property="twitter:domain" content="medusa-plugins.vercel.app" />
      <meta property="twitter:url" content={`https://medusa-plugins.vercel.app${asPath}`} />
      <meta name="twitter:title" content={frontMatter.title || 'Medusa plugins'} />
      <meta name="twitter:description" content={frontMatter.description || 'A collection of awesome plugins for medusa, made by the community for the community'} />
      <meta name="twitter:image" content="https://raw.githubusercontent.com/adrien2p/medusa-plugins/assets/assets/doc-home-page.png" />

      <link rel="icon" type="image/x-icon" href="https://raw.githubusercontent.com/adrien2p/medusa-plugins/assets/assets/medusa-plugins-logo.png" />
    </>
  },

  // Navbar related
  logo: (
    <>
      <img src="https://raw.githubusercontent.com/adrien2p/medusa-plugins/assets/assets/medusa-plugins-logo.png" alt="medusa plugins logo" height="24" width="24"/>
      <span style={{ marginLeft: '.4em', fontWeight: 800 }}>
        Medusa plugins
      </span>
    </>
  ),

  // Custom components
  components: {
    CircleStep: (props) => {
      const index = props.index
      return (
        <div style={{display: "flex", marginTop: "1rem"}}>
          <span className={"circle"}>{index}</span>
          <span style={{marginTop: "5px"}}>
            {props.children}
          </span>
        </div>
      )
    }
  }
}
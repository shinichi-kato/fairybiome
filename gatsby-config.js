require("dotenv").config()

module.exports = {
  // Customize me!
  siteMetadata: {
    company: "人工無脳は考える",
    domain: "",
    site:"",
    title:
      "FairyBiome",
    // preamble:
    //   "",
    // defaultDescription: "",
    // postamble: "",
    // contact: {
    //   email: "",
    // },
    // menuLinks: [],
 
    local_log_lines_max:200,  /* ローカルのログに記録する最大行数 */
    chat_lines_max:20,        /* 画面上に表示するログの最大行数 */
    habitat_fairy_hp_max:120, /* habitatで出現する妖精の最大数 */
    habitat_num_of_fairy_max:4  /* habitatで出現する妖精の最大HPを決める乱数の最大値 */
        /*  妖精の最大HPは100で、HP100の妖精も存在する。
            しかしHP_MAXを100にするとHP100の妖精が出現する確率が
            低くなりすぎるため、HP_MAXは100より大きくする。
            HP_MAXを大きくするほどHPの高い妖精が出現しやすくなる */
    
  },
  pathPrefix: "/",
  plugins: [
     "gatsby-plugin-top-layout",
    "gatsby-plugin-react-helmet",
    'gatsby-plugin-workerize-loader',
    "gatsby-plugin-remove-serviceworker",
    {
      resolve: "gatsby-plugin-material-ui",
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: "FairyBiome",
        short_name: "FairyBiome",
        start_url: "/",
        background_color: "#eeeeee",
        //theme_color: "#6b37bf",
        // Enables "Add to Homescreen" prompt and disables browser UI (including back button)
        // see https://developers.google.com/web/fundamentals/web-app-manifest/#display
        display: "standalone",
        icon: "images/logo.png", // This path is relative to the root of the site.
        // An optional attribute which provides support for CORS check.
        // If you do not provide a crossOrigin option, it will skip CORS for manifest.
        // Any invalid keyword or empty string defaults to `anonymous`
        //crossOrigin: `use-credentials`,
      },
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        path: `${__dirname}/src/pages`,
        name: "pages",
        ignore: [`**/\.*`],
      },
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        path: `${__dirname}/docs`,
        name: "docs",
        ignore: [`**/\.*`],
      },
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        path: `${__dirname}/static/fairy`,
        name: "fairy",
        ignore: [`**/\.*`],
        plugins: [
          `gatsby-transformer-json`,
        ]
      },
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        path: `${__dirname}/static/svg`,
        name: "staticimages",
        ignore: [`**/\.*`],
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 590,
            },
          },
          // {
          //   resolve: `gatsby-remark-responsive-iframe`,
          //   options: {
          //     wrapperStyle: `margin-bottom: 1.0725rem`,
          //   },
          // },
          `gatsby-remark-prismjs`,
          `gatsby-remark-copy-linked-files`,
          `gatsby-remark-smartypants`,
        ],
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    // {
    //   resolve: `gatsby-plugin-google-analytics`,
    //   options: {
    //     //trackingId: `ADD YOUR TRACKING ID HERE`,
    //   },
    // },

    {
      resolve: `gatsby-plugin-favicon`,
      options: {
        logo: "./images/logo.png",
      },
    },
    {
      resolve: "gatsby-plugin-react-svg",
      options: {
        rule: {
          include: /images\/svg/ // See below to configure properly
        }
      }
    },
  ],
};

import React from "react"
import { Link, graphql } from "gatsby"

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

import FairyBiomeIcon from '../../icons/FairyBiome';

const DocumentTemplate = ({ data, pageContext, location }) => {
  const article = data.markdownRemark;
  const siteTitle = data.site.siteMetadata.title;
  const { previous, next } = pageContext;

  return(
    <Box display="flex" flexDirection="column">
      <Box>
        <AppBar>
          <Toolbar>
            <FairyBiomeIcon/>
            <Typography>{siteTitle}</Typography>
          </Toolbar>
        </AppBar>
        
      </Box>
      <Box>
        title:{article.frontmatter.title}
        description:{article.frontmatter.description}
        data:{article.frontmatter.date}
      </Box>
      <Box>
        <div dangerouslySetInnerHTML={{ __html: article.html }} />
      </Box>
    </Box>
  )
}

export default DocumentTemplate;


export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    site {
      siteMetadata {
        title
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      excerpt(pruneLength: 160)
      html
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        description
      }
    }
  }
`
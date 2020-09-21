import React from "react";
import { Link, graphql } from "gatsby";

import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";

import FairyBiomeIcon from "../../icons/FairyBiome";

const useStyles = makeStyles((theme) => ({
  root: {
    overFlowY: "auto",
  },
  article: {
    color: theme.palette.text.primary,
    fontSize: theme.typography.fontSize,
    "& p": {
      fontFamily: theme.typography.body1.fontFamily,
      fontSize: theme.typography.body1.fontSize,
      fontWeight: theme.typography.body1.fontWeight,
      lineHeight: theme.typography.body1.lineHeight,
      letterSpacing: theme.typography.body1.letterSpacing,
    },
    "& h1": {
      fontFamily: theme.typography.h1.fontFamily,
      fontSize: theme.typography.h1.fontSize,
      fontWeight: theme.typography.h1.fontWeight,
      lineHeight: theme.typography.h1.lineHeight,
      letterSpacing: theme.typography.h1.letterSpacing,
    },
    "& h2": {
      fontFamily: theme.typography.h2.fontFamily,
      fontSize: theme.typography.h2.fontSize,
      fontWeight: theme.typography.h2.fontWeight,
      lineHeight: theme.typography.h2.lineHeight,
      letterSpacing: theme.typography.h2.letterSpacing,
    },
    "& h3": {
      fontFamily: theme.typography.h3.fontFamily,
      fontSize: theme.typography.h3.fontSize,
      fontWeight: theme.typography.h3.fontWeight,
      lineHeight: theme.typography.h3.lineHeight,
      letterSpacing: theme.typography.h3.letterSpacing,
    },
    "& h4": {
      fontFamily: theme.typography.h4.fontFamily,
      fontSize: theme.typography.h4.fontSize,
      fontWeight: theme.typography.h4.fontWeight,
      lineHeight: theme.typography.h4.lineHeight,
      letterSpacing: theme.typography.h4.letterSpacing,
    },
    "& h5": {
      fontFamily: theme.typography.h5.fontFamily,
      fontSize: theme.typography.h5.fontSize,
      fontWeight: theme.typography.h5.fontWeight,
      lineHeight: theme.typography.h5.lineHeight,
      letterSpacing: theme.typography.h5.letterSpacing,
    },

  },

}));

const DocumentTemplate = ({ data, pageContext, location }) => {
  const classes = useStyles();
  const article = data.markdownRemark;
  const siteTitle = data.site.siteMetadata.title;
  const { previous, next } = pageContext;

  return (
    <Box
className={classes.root} display="flex"
      flexDirection="column"
    >
      <Box>
        <AppBar>
          <Toolbar>
            <FairyBiomeIcon />
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
        <div
          className={classes.article}
          dangerouslySetInnerHTML={{ __html: article.html }} />
      </Box>
    </Box>
  );
};

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
`;

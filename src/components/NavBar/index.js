import React from "react"

import clsx from "clsx"
import { useStaticQuery, graphql } from "gatsby"
import { withStyles } from "@material-ui/core/styles"
import AppBar from "@material-ui/core/AppBar"
import Toolbar from "@material-ui/core/Toolbar"
import Typography from "@material-ui/core/Typography"
import IconButton from "@material-ui/core/IconButton"
import MenuIcon from "@material-ui/icons/Menu"
import Drawer from "@material-ui/core/Drawer"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemText from "@material-ui/core/ListItemText"
import AssessmentIcon from "@material-ui/icons/Assessment"
import BuildIcon from "@material-ui/icons/Build"

const styles = {
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginLeft: -18,
    marginRight: 10,
  },
  list: {
    width: 250,
  },
}

function DenseAppBar(props) {
  const data = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          title
        }
      }
    }
  `)

  const { classes, title } = props

  const [menu, setMenu] = React.useState(false)

  const toggleMenu = open => event => {
    if (
      event.type === "keyDown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return
    }
    setMenu(open)
  }

  const list = () => (
    <div
      className={clsx(classes.list)}
      role="presentation"
      onClick={toggleMenu(false)}
      onKeyDown={toggleMenu(false)}
    >
      <List>
        <ListItem button component="a" href="/" key={"Customer's page"}>
          <AssessmentIcon />
          <ListItemText primary="Customer's page" />
        </ListItem>
        <ListItem button component="a" href="/backoffice" key={"Backoffice"}>
          <BuildIcon />
          <ListItemText primary="Backoffice" />
        </ListItem>
      </List>
    </div>
  )

  return (
    <div className={classes.root}>
      <Drawer open={menu} onClose={toggleMenu(false)}>
        {list()}
      </Drawer>
      <AppBar position="static">
        <Toolbar variant="dense">
          <IconButton
            className={classes.menuButton}
            color="inherit"
            aria-label="Menu"
            onClick={toggleMenu(true)}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" color="inherit">
            {data.site.siteMetadata.title} : {title}
          </Typography>
        </Toolbar>
      </AppBar>
    </div>
  )
}

export default withStyles(styles)(DenseAppBar)

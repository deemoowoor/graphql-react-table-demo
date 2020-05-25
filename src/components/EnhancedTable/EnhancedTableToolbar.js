import React from "react"

import clsx from "clsx"
import { Typography } from "@material-ui/core"
import { lighten, makeStyles } from "@material-ui/core/styles"
import Toolbar from "@material-ui/core/Toolbar"
import IconButton from "@material-ui/core/IconButton"
import Tooltip from "@material-ui/core/Tooltip"
import FormControl from "@material-ui/core/FormControl"
import InputLabel from "@material-ui/core/InputLabel"
import Select from "@material-ui/core/Select"
import MenuItem from "@material-ui/core/MenuItem"

import DeleteIcon from "@material-ui/icons/Delete"
import FilterListIcon from "@material-ui/icons/FilterList"

const useToolbarStyles = makeStyles(theme => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
  },
  highlight:
    theme.palette.type === "light"
      ? {
          color: theme.palette.secondary.main,
          backgroundColor: lighten(theme.palette.secondary.light, 0.85),
        }
      : {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.secondary.dark,
        },
  title: {
    flex: "1 1 100%",
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}))

const EnhancedTableToolbar = props => {
  const classes = useToolbarStyles()
  const {
    numSelected,
    readonly,
    onDeleteAction,
    onFilterSelected,
    filterSelectList,
    filterTitle,
    filterValue,
  } = props

  return (
    <Toolbar
      className={clsx(classes.root, {
        [classes.highlight]: !readonly && numSelected > 0,
      })}
    >
      {!readonly && numSelected > 0 ? (
        <Typography
          className={classes.title}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected} selected
        </Typography>
      ) : (
        <Typography
          className={classes.title}
          variant="h6"
          id="tableTitle"
          component="div"
        >
          Transactions
        </Typography>
      )}

      {numSelected > 0 && !readonly ? (
        <Tooltip title="Delete">
          <IconButton aria-label="delete" onClick={onDeleteAction}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <>
        <FilterListIcon key={"icon"} title={filterTitle} /> 
        <FormControl variant="outlined" className={classes.formControl}>
          <InputLabel id="filter-select-outlined-label">
            {filterTitle}
          </InputLabel>
          <Select
            labelId="filter-select-outlined-label"
            id="filter-select-outlined"
            value={filterValue || ""}
            onChange={onFilterSelected}
            label={filterTitle}
          >
            <MenuItem key={"empty-menu-item"} value="">
              <em>None</em>
            </MenuItem>
            {filterSelectList.map(code => (
              <MenuItem key={code} value={code}>
                {code}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        </>
      )}
    </Toolbar>
  )
}

export default EnhancedTableToolbar

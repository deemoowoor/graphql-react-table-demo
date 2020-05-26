import React from "react"

import clsx from "clsx"
import { v4 as uuid4 } from "uuid"
import { Typography } from "@material-ui/core"
import { lighten, makeStyles } from "@material-ui/core/styles"
import Toolbar from "@material-ui/core/Toolbar"
import IconButton from "@material-ui/core/IconButton"
import Button from "@material-ui/core/Button"
import Tooltip from "@material-ui/core/Tooltip"
import FormGroup from "@material-ui/core/FormGroup"
import FormControl from "@material-ui/core/FormControl"
import InputLabel from "@material-ui/core/InputLabel"
import Select from "@material-ui/core/Select"
import MenuItem from "@material-ui/core/MenuItem"
import TextField from "@material-ui/core/TextField"

import AddIcon from "@material-ui/icons/Add"
import DeleteIcon from "@material-ui/icons/Delete"
import FilterListIcon from "@material-ui/icons/FilterList"
import RepeatIcon from "@material-ui/icons/Repeat"

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
  addForm: {
    width: "100%",
    display: "inline-flex"
  },
  inlineForm: {
    display: "inline-flex"
  }
}))

const AddForm = props => {
  const classes = useToolbarStyles()
  const { data, onFormSubmit } = props
  const [currency, setCurrency] = React.useState(data[0])
  const [uuid, setUuid] = React.useState(uuid4())
  const [amount, setAmount] = React.useState(0)

  const onCurrencySelected = event => {
    setCurrency(event.target.value)
  }

  return (
    <form onSubmit={(event) => onFormSubmit({event, uuid, currency, amount})} classes={classes.addForm}>
      <FormGroup row={true}>
        <FormControl className={clsx(classes.formControl, classes.inlineForm)}>
          <TextField id="uuid" label="UUID" value={uuid} />
          <Tooltip title="Regenerate">
            <IconButton onClick={event => setUuid(uuid4)}>
              <RepeatIcon />
            </IconButton>
          </Tooltip>
        </FormControl>
        <FormControl className={clsx(classes.formControl, classes.inlineForm)}>
          <TextField id="amount" label="Amount" value={amount} onChange={(event) => setAmount(event.target.value)} />
        </FormControl>
        <FormControl className={clsx(classes.formControl, classes.inlineForm)}>
          <Select
            labelId="currency-select-outlined-label"
            id="currency-select-outlined"
            onChange={onCurrencySelected}
            value={currency}
            label={"Currency"}
          >
            {data.map(code => (
              <MenuItem key={code} value={code}>
                {code}
              </MenuItem>
            ))}
          </Select>
          <Button variant="contained" color="primary" onClick={(event) => onFormSubmit({event, uuid, currency, amount})}>
            Submit
          </Button>
        </FormControl>
      </FormGroup>
    </form>
  )
}

const EnhancedTableToolbar = props => {
  const classes = useToolbarStyles()
  const [showAddForm, setShowAddForm] = React.useState(false)

  const {
    numSelected,
    readonly,
    onDeleteAction,
    onAddAction,
    onEditAction,
    onFilterSelected,
    filterSelectList,
    filterTitle,
    filterValue,
    data,
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
      {!readonly && showAddForm ? <AddForm data={data} onFormSubmit={onAddAction}/> : null}
      {!readonly ? (
        <Tooltip title="Add">
          <IconButton aria-label="add" onClick={event => setShowAddForm(true)}>
            <AddIcon color="action" />
          </IconButton>
        </Tooltip>
      ) : null}
      {numSelected > 0 && !readonly ? (
        <Tooltip title="Delete">
          <IconButton aria-label="delete" onClick={onDeleteAction}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <>
          <FilterListIcon key={"icon"} title={filterTitle} />
          <FormControl className={classes.formControl}>
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

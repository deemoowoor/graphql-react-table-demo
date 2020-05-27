import React from "react"

import clsx from "clsx"
import { makeStyles } from "@material-ui/core/styles"
import FormControl from "@material-ui/core/FormControl"
import InputLabel from "@material-ui/core/InputLabel"
import Select from "@material-ui/core/Select"
import MenuItem from "@material-ui/core/MenuItem"
import TextField from "@material-ui/core/TextField"
import Button from "@material-ui/core/Button"

import Dialog from "@material-ui/core/Dialog"
import DialogActions from "@material-ui/core/DialogActions"
import DialogContent from "@material-ui/core/DialogContent"
import DialogTitle from "@material-ui/core/DialogTitle"

const useStyles = makeStyles(theme => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
}))

const EditTransactionFormDialog = props => {
  const classes = useStyles()
  const { currencyList, transaction, onSubmit, open, onClose } = props
  
  const [currency, setCurrency] = React.useState(transaction ? transaction.currency : currencyList[0])
  const [amount, setAmount] = React.useState(transaction ? transaction.amount : 0)
  
  React.useEffect(() => {
    if (transaction) {
      setCurrency(transaction.currency)
      setAmount(transaction.amount)
    }
    
  }, [transaction])

  const onCurrencySelected = event => {
    setCurrency(event.target.value)
  }

  if (!open) {
    return null
  }

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">Edit transaction</DialogTitle>
      <DialogContent>
        <form
          onSubmit={event => {
            event.preventDefault()
            return onSubmit({ event, id: transaction.id, uuid: transaction.uuid,  currency, amount })
            }}
        >
          <FormControl
            className={clsx(classes.formControl, classes.inlineForm)}
          >
            <TextField
              id="amount"
              label="Amount"
              value={amount}
              onChange={event => setAmount(event.target.value)}
            />
          </FormControl>
          <FormControl
            className={clsx(classes.formControl, classes.inlineForm)}
          >
            <InputLabel id="filter-select-outlined-label">Currency</InputLabel>
            <Select
              labelId="currency-select-outlined-label"
              id="currency-select-outlined"
              onChange={onCurrencySelected}
              value={currency}
            >
              {currencyList.map(code => (
                <MenuItem key={code} value={code}>
                  {code}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </form>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="primary"
          onClick={event =>
            onSubmit({
              event,
              id: transaction.id,
              uuid: transaction.uuid,
              currency,
              amount,
            })
          }
        >
          Edit
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default EditTransactionFormDialog

import React from "react"

import {
  LinearProgress,
  Card,
  CardContent,
  CardHeader,
  Typography,
} from "@material-ui/core"

import { Query } from "@apollo/react-components"
import { gql, useMutation } from "@apollo/client"

import TablePagination from "@material-ui/core/TablePagination"
import TableContainer from "@material-ui/core/TableContainer"
import Paper from "@material-ui/core/Paper"
import Snackbar from '@material-ui/core/Snackbar';

import HourglassEmptyOutlined from "@material-ui/icons/HourglassEmptyOutlined"
import Error from "@material-ui/icons/Error"

import EnhancedTable from "../EnhancedTable/EnhancedTable"
import EnhancedTableToolbar from "../EnhancedTable/EnhancedTableToolbar"

const QUERY_TRANSACTIONS_AND_CURRENCIES = gql`
  query TransactionConnection(
    $page: ID!
    $pageSize: Int!
    $order: String
    $orderBy: String
    $filter: String
  ) {
    transactionConnection(
      page: $page
      pageSize: $pageSize
      order: $order
      orderBy: $orderBy
      filter: $filter
    ) {
      edges {
        node {
          id
          uuid
          amount
          currency
        }
      }
      pageInfo {
        totalCount
        hasNextPage
      }
    }
    currencies {
      code
    }
  }
`

const ADD_TRANSACTION = gql`
  mutation AddTransaction($uuid: String!, $amount: Float!, $currency: String!) {
    addTransaction(uuid: $uuid, amount: $amount, currency: $currency) {
      id
      uuid
      amount
      currency
    }
  }
`

const UPDATE_TRANSACTION = gql`
  mutation UpdateTransaction(
    $id: ID!
    $uuid: ID!
    $amount: Float!
    $currency: String!
  ) {
    updateTransaction(
      id: $id
      uuid: $uuid
      amount: $amount
      currency: $currency
    ) {
      id
      uuid
      amount
      currency
    }
  }
`

const DELETE_TRANSACTION = gql`
  mutation DeleteTransaction($id: ID!) {
    deleteTransaction(id: $id) {
      ok
    }
  }
`

const DELETE_BULK_TRANSACTIONS = gql`
  mutation DeleteTransactionsBulk($idList: [ID!]) {
    deleteTransactionsBulk(idList: $idList) {
      ok
    }
  }
`

const columns = [
  {
    dataKey: "id",
    numeric: false,
    disablePadding: false,
    label: "ID",
    width: 200,
  },
  {
    dataKey: "amount",
    numeric: true,
    disablePadding: false,
    label: "Amount",
    width: 200,
  },
  {
    dataKey: "currency",
    numeric: false,
    disablePadding: false,
    label: "Currency",
    width: 200,
  },
]

const LoadingCard = () => (
  <Card className="rotate-div">
    <CardHeader
      avatar={
        <HourglassEmptyOutlined color="primary" className="rotate-infinite" />
      }
      title="Transactions list loading..."
    ></CardHeader>
    <CardContent>
      <Typography>Please, wait...</Typography>
    </CardContent>
    <LinearProgress color="primary" />
  </Card>
)

const ErrorCard = ({ error }) => (
  <Card className="rotate-div">
    <CardHeader
      avatar={<Error color="secondary" />}
      title="Loading transactions list failed!"
    ></CardHeader>
    <CardContent>
      <Typography>Error: {error || "no data"}</Typography>
    </CardContent>
  </Card>
)

export default function TransactionsTableQuery({ readonly }) {
  const [order, setOrder] = React.useState("asc")
  const [orderBy, setOrderBy] = React.useState("id")
  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(50)
  const [selected, setSelected] = React.useState([])
  const [windowInnerHeight, setWindowInnerHeight] = React.useState(
    window.innerHeight
  )

  const [snackbarOpen, setSnackbarOpen] = React.useState(false)

  const [addTransaction, { addData }] = useMutation(ADD_TRANSACTION)
  const [updateTransaction, { updateData }] = useMutation(UPDATE_TRANSACTION)
  const [deleteTransactions, { deleteData }] = useMutation(
    DELETE_BULK_TRANSACTIONS
  )

  const [filter, setFilter] = React.useState("")

  const updateWindowDimensions = event => {
    setWindowInnerHeight(window.innerHeight)
  }

  React.useEffect(() => {
    window.addEventListener("resize", updateWindowDimensions)
  })

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = event => {
    if (typeof event.target.value === "string") {
      setRowsPerPage(parseInt(event.target.value, 50))
    } else {
      setRowsPerPage(event.target.value)
    }

    setPage(0)
  }

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc"
    setOrder(isAsc ? "desc" : "asc")
    setOrderBy(property)
  }

  const handleRowClick = ({ rowData }) => {
    let newSelected = []
    const selectedIndex = selected.indexOf(rowData.id)

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, rowData.id)
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1))
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1))
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      )
    }

    setSelected(newSelected)
  }

  const handleRowDoubleClick = ({ rowData }) => {
    console.log(`Doubleclick: ${rowData}`)
  }

  const handleDeleteAction = async (event, refetch) => {
    const result = await deleteTransactions({ variables: { idList: selected } })
    setSnackbarOpen(true)
    console.log(result.data.deleteTransactionsBulk.okCount)
    setSelected([])
    refetch()
  }

  const handleAddAction = async (event, refetch) => {}

  const handleFilterSelected = event => {
    setFilter(event.target.value)
    setPage(0)
  }

  const handleSnackbarClose = (event) => {
    setSnackbarOpen(false)
  }

  return (
    <Query
      query={QUERY_TRANSACTIONS_AND_CURRENCIES}
      variables={{ page, pageSize: rowsPerPage, order, orderBy, filter }}
    >
      {result => {
        const { error, data, loading, refetch } = result
        if (loading) {
          return <LoadingCard />
        }

        if (!data || !data.transactionConnection.edges || error) {
          if (error) {
            console.error(error)
          }
          return <ErrorCard error={error} />
        }

        const rows = data.transactionConnection.edges.map(edge => edge.node)
        const totalCount = data.transactionConnection.pageInfo.totalCount

        const currencies = data.currencies.map(i => i.code)

        const handleSelectAllClick = event => {
          if (event.target.checked) {
            const newSelecteds = rows.map(item => item.id)
            setSelected(newSelecteds)
            return
          }

          setSelected([])
        }

        const otherElementsHeight = 172

        const rowsOnPage = Math.min(
          rowsPerPage,
          totalCount - page * rowsPerPage
        )

        return (
          <TableContainer>
            <EnhancedTableToolbar
              readonly={readonly}
              numSelected={selected.length}
              onDeleteAction={event => handleDeleteAction(event, refetch)}
              onFilterSelected={handleFilterSelected}
              filterSelectList={currencies}
              filterValue={filter}
              filterTitle="Currency"
              data={currencies}
            />
            <Paper
              style={{
                height: windowInnerHeight - otherElementsHeight,
                width: "100%",
              }}
            >
              <EnhancedTable
                rows={rows}
                rowCount={totalCount}
                rowsOnPage={rowsOnPage}
                columns={columns}
                order={order}
                orderBy={orderBy}
                onRequestSort={handleRequestSort}
                onRowClick={handleRowClick}
                onRowDoubleClick={handleRowDoubleClick}
                onSelectAllClick={handleSelectAllClick}
                readonly={readonly}
                selected={selected}
              />
            </Paper>
            <TablePagination
              rowsPerPageOptions={[10, 50, 100, 500, 1000, 10000]}
              component="div"
              count={totalCount}
              rowsPerPage={rowsPerPage}
              page={page}
              onChangePage={handleChangePage}
              onChangeRowsPerPage={handleChangeRowsPerPage}
            />
            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
                <Typography>Action completed successfully</Typography>
            </Snackbar>
          </TableContainer>
        )
      }}
    </Query>
  )
}

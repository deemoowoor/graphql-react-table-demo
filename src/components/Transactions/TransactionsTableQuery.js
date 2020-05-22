import React from "react"

import {
  LinearProgress,
  Card,
  CardContent,
  CardHeader,
  Typography,
} from "@material-ui/core"

import { Query } from "@apollo/react-components"
import { gql } from "@apollo/client"

import TablePagination from "@material-ui/core/TablePagination"
import HourglassEmptyOutlined from "@material-ui/icons/HourglassEmptyOutlined"
import Error from "@material-ui/icons/Error"

import EnhancedTable from "../EnhancedTable/EnhancedTable"

const getTransactionsQuery = (cursor, pageSize, order, orderBy) => gql`
  {
    transactionConnection(page: ${cursor}, pageSize: ${pageSize}, order: "${order}", orderBy: "${orderBy}") {
      edges {
        node {
          id
          uuid
          amount
          currency
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
    currencies {
      code
    }
  }
`

const headCells = [
  { id: "id", numeric: false, disablePadding: true, label: "ID" },
  { id: "amount", numeric: true, disablePadding: false, label: "Amount" },
  { id: "currency", numeric: false, disablePadding: false, label: "Currency" },
]

export default function TransactionsTableQuery({readonly}) {
  const [order, setOrder] = React.useState("asc")
  const [orderBy, setOrderBy] = React.useState("id")
  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(10)

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc"
    setOrder(isAsc ? "desc" : "asc")
    setOrderBy(property)
  }

  return (
    <Query query={getTransactionsQuery(page, rowsPerPage, order, orderBy)}>
      {result => {
        const { error, data, loading } = result
        if (loading) {
          return (
            <Card className="rotate-div">
              <CardHeader
                avatar={
                  <HourglassEmptyOutlined
                    color="primary"
                    className="rotate-infinite"
                  />
                }
                title="Transactions list loading..."
              ></CardHeader>
              <CardContent>
                <Typography>Please, wait...</Typography>
              </CardContent>
              <LinearProgress color="primary" />
            </Card>
          )
        }

        if (!data || !data.transactionConnection.edges || error) {
          console.log(error)
          return (
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
        }

        const rows = data.transactionConnection.edges.map(edge => edge.node)
        const totalCount = data.transactionConnection.pageInfo.endCursor
        console.log(rows)

        return (
          <>
            <EnhancedTable 
              rows={rows}
              headCells={headCells}
              order={order}
              orderBy={orderBy} 
              handleRequestSort={handleRequestSort}
              readonly={readonly} />
            <TablePagination
              rowsPerPageOptions={[10, 50, 100, 500, 1000]}
              component="div"
              count={totalCount}
              rowsPerPage={rowsPerPage}
              page={page}
              onChangePage={handleChangePage}
              onChangeRowsPerPage={handleChangeRowsPerPage}
            />
          </>
        )
      }}
    </Query>
  )
}

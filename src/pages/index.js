import React from "react"
import {
  LinearProgress,
  Card,
  CardContent,
  CardHeader,
  Typography,
} from "@material-ui/core"

import TableContainer from '@material-ui/core/TableContainer';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import HourglassEmptyOutlined from "@material-ui/icons/HourglassEmptyOutlined"

import { ApolloProvider, gql } from "@apollo/client"
import { Query } from "@apollo/react-components"

import { client } from "../apollo/client"

import NavBar from "../components/NavBar"
import "../style/index.css"

const GET_TRANSACTIONS_LIST = gql`
  query GetTransactionsList {
    transactions {
      edges {
        node {
          id
          uuid
          amount
          currency
        }
      }
    }
  }
`

export const TransactionsListLoader = () => (
  <Query query={GET_TRANSACTIONS_LIST}>
    {({ data, loading }) => {
      if (loading) {
        return (
          <Card className="rotate-div">
            <CardHeader
              avatar={<HourglassEmptyOutlined className="rotate-infinite" />}
              title="Transactions list loading..."
            ></CardHeader>
            <CardContent>
              <Typography>Please, wait...</Typography>
            </CardContent>
            <LinearProgress color="primary" />
          </Card>
        )
      }

      return <TransactionsList transactions={[]} />
    }}
  </Query>
)

export const TransactionsList = ({ transactions }) => (
  <TableContainer component={Paper}>
    <Table aria-label="simple table">
    <TableHead>
      <TableRow>
        <TableCell>ID</TableCell>
        <TableCell>Amount</TableCell>
        <TableCell>Currency</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
    {transactions.map(r => (
      <TransactionRow data={r} />
    ))}
    </TableBody>
    </Table>
  </TableContainer>
)

export const TransactionRow = ({ data }) => {
  const { id, uuid, amount, currency } = data
  return (
    <tr key={uuid}>
      <td>{id}</td>
      <td>{amount}</td>
      <td>{currency}</td>
    </tr>
  )
}

const IndexPage = () => (
  <ApolloProvider client={client}>
    <React.Fragment>
      <NavBar />
      <TransactionsListLoader />
    </React.Fragment>
  </ApolloProvider>
)

export default IndexPage

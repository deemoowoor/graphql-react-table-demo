import React from "react"

import { ApolloProvider } from "@apollo/client"
import { client } from "../apollo/client"

import Container from '@material-ui/core/Container';

import NavBar from "../components/NavBar"
import "../style/index.css"
import TransactionsTableQuery from "../components/Transactions/TransactionsTableQuery"

const BackofficePage = () => (
  <ApolloProvider client={client}>
    <React.Fragment>
      <NavBar />
      <Container maxWidth="lg">
        <TransactionsTableQuery />
      </Container>
    </React.Fragment>
  </ApolloProvider>
)

export default BackofficePage

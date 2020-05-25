import React from "react"

import { ApolloProvider } from "@apollo/client"
import { client } from "../apollo/client"

import Container from '@material-ui/core/Container';

import NavBar from "../components/NavBar"
import "../style/index.css"
import TransactionsTableQuery from "../components/Transactions/TransactionsTableQuery"

const IndexPage = () => (
  <ApolloProvider client={client}>
    <React.Fragment>
      <NavBar />
      <Container maxWidth="lg">
        <TransactionsTableQuery readonly={true} />
      </Container>
    </React.Fragment>
  </ApolloProvider>
)

export default IndexPage

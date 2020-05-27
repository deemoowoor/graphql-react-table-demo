import React from "react"

import { ApolloProvider } from "@apollo/client"
import { client } from "../apollo/client"

import CssBaseline from "@material-ui/core/CssBaseline"
import Container from "@material-ui/core/Container"

import NavBar from "../components/NavBar"
import "../style/index.css"
import TransactionsTableQuery from "../components/Transactions/TransactionsTableQuery"

const IndexPage = () => (
  <ApolloProvider client={client}>
    <CssBaseline />
    <NavBar title={"Customer's page"}/>
    <Container maxWidth="lg">
      <TransactionsTableQuery readonly={true} />
    </Container>
  </ApolloProvider>
)

export default IndexPage

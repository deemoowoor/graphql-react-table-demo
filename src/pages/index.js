import React from "react"

import { ApolloProvider } from "@apollo/client"
import { client } from "../apollo/client"

import NavBar from "../components/NavBar"
import "../style/index.css"
import TransactionsTableQuery from "../components/Transactions/TransactionsTableQuery"

const IndexPage = () => (
  <ApolloProvider client={client}>
    <React.Fragment>
      <NavBar />
      <TransactionsTableQuery readonly={true} />
    </React.Fragment>
  </ApolloProvider>
)

export default IndexPage

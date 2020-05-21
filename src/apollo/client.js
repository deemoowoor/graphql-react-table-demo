import fetch from "isomorphic-fetch"
import { ApolloClient, InMemoryCache } from "@apollo/client"
import { makeExecutableSchema } from "graphql-tools"
import { SchemaLink } from "apollo-link-schema"
import { v4 as uuid4 } from "uuid"

const typeDefs = `
  type Query {
    transactions: TransactionList!
  }

  type TransactionList {
    transactions: [Transaction!]
  }

  type Transaction {
    id: ID!
    uuid: ID!
    amount: Float!
    currency: String!
  }

  type CurrencyList {
    currencies: [Currency!]
  }

  type Currency {
    code: String!
    name: String!
  }

  type Mutation {
    addTransaction(uuid: String!, amount: Float!, currency: String!): Transaction
    editTransaction(id: ID!, uuid: ID!, amount: Float!, currency: String!): Transaction
    deleteTransaction(id: ID!): DeleteResponse
  }

  type DeleteResponse {
    ok: Boolean!
  }
`

let transactions = {}

var transactionIdCounter = 0;

const addTransaction = transaction => {
  const id = transactionIdCounter++;
  return transactions[id] = { ...transaction, id }
}
  
addTransaction({ uuid: uuid4(), amount: 1.0, currency: "BTC" })
addTransaction({ uuid: uuid4(), amount: -0.1, currency: "BTC" })
addTransaction({ uuid: uuid4(), amount: -0.2, currency: "EUR" })

const resolvers = {
  Query: {
    transactions: () => transactions,
  },

  Mutation: {
    addTransaction: (_parent, { transaction }) => {
      return addTransaction(transaction)
    },
    
    editTransaction: (_parent, { id, ...transaction }) => {
      if (!transactions[id]) {
        throw new Error("Transaction does not exist")
      }

      transactions[id] = {
        ...transactions[id],
        ...transaction
      }

      return transactions[id]
    },

    deleteTransaction: (_parent, { id }) => {
      const ok = Boolean(transactions[id]);
      delete transactions[id]
      return { ok };
    }
  },
}

const executableSchema = makeExecutableSchema({
  typeDefs,
  resolvers,
  resolverValidationOptions: {
    requireResolversForResolveType: false,
  },
})

const link = new SchemaLink({
  schema: executableSchema,
})

export const client = new ApolloClient({
  link,
  fetch,
  cache: new InMemoryCache(),
})

import fetch from "isomorphic-fetch"
import { ApolloClient, InMemoryCache } from "@apollo/client"
import { makeExecutableSchema } from "graphql-tools"
import { SchemaLink } from "apollo-link-schema"
import { v4 as uuid4 } from "uuid"

const typeDefs = `
  type Query {
    transactionConnection(page: Int!, pageSize: Int!, order: String, orderBy: String): TransactionConnection
    currencies: [Currency]
  }

  type Mutation {
    addTransaction(uuid: String!, amount: Float!, currency: String!): Transaction
    editTransaction(id: ID!, uuid: ID!, amount: Float!, currency: String!): Transaction
    deleteTransaction(id: ID!): DeleteResponse
  }

  type TransactionConnection {
    edges: [TransactionEdge]
    pageInfo: PageInfo!
  }

  type TransactionEdge {
    node: Transaction
    cursor: ID!
  }

  type PageInfo {
    endCursor: ID!
    hasNextPage: Boolean

  }

  type Transaction {
    id: ID!
    uuid: ID!
    amount: Float!
    currency: String!
  }

  type Currency {
    code: String!
    name: String!
  }

  type DeleteResponse {
    ok: Boolean!
  }
`

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1
  }
  if (b[orderBy] > a[orderBy]) {
    return 1
  }
  return 0
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy)
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index])
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0])
    if (order !== 0) return order
    return a[1] - b[1]
  })
  return stabilizedThis.map(el => el[0])
}

let currencies = {}

const addCurrency = currency => (currencies[currency.code] = { ...currency })

addCurrency({ code: "BTC", name: "Bitcoin" })
addCurrency({ code: "USD", name: "US Dollar" })
addCurrency({ code: "EUR", name: "Euro" })

let transactions = {}

var transactionIdCounter = 0

const addTransaction = transaction => {
  const id = transactionIdCounter++
  return (transactions[id] = { ...transaction, id })
}

addTransaction({ uuid: uuid4(), amount: 1.0, currency: "BTC" })
addTransaction({ uuid: uuid4(), amount: -0.1, currency: "BTC" })
addTransaction({ uuid: uuid4(), amount: -0.2, currency: "EUR" })

for (var i = 0; i < 10000; i++) {
  addTransaction({
    uuid: uuid4(),
    amount: ((Math.random() * 1000) % 1000.0) - 500.0,
    currency: Object.values(currencies)[Math.floor((Math.random() * 10) % 3)]
      .code,
  })
}

const resolvers = {
  Query: {
    transactionConnection: (_parent, { page, pageSize, order, orderBy }) => {
      console.log(`transactions query: ${JSON.stringify({ page, pageSize, order, orderBy })}`)
      const transactionList = Object.values(transactions)
      
      let edges = stableSort(transactionList, getComparator(order, orderBy))
        .slice(
          page * pageSize,
          page * pageSize + pageSize
        )
        .map((row, index) => ({
          node: row,
          cursor: index,
        }))

      const response = {
        edges,
        pageInfo: {
          endCursor: transactionList.length,
          hasNextPage: page * pageSize + 1 < transactionList.length,
        },
      }

      return response
    },
    currencies: _parent => {
      return Object.values(currencies)
    },
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
        ...transaction,
      }

      return transactions[id]
    },

    deleteTransaction: (_parent, { id }) => {
      const ok = Boolean(transactions[id])
      delete transactions[id]
      return { ok }
    },
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

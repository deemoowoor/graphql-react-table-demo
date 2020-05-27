import fetch from "isomorphic-fetch"
import { ApolloClient, InMemoryCache } from "@apollo/client"
import { makeExecutableSchema } from "graphql-tools"
import { SchemaLink } from "apollo-link-schema"
import { v4 as uuid4 } from "uuid"

const typeDefs = `
  type Query {
    transactionConnection(page: Int!, pageSize: Int!, order: String, orderBy: String, filter: String): TransactionConnection
    currencies: [Currency]
  }

  type Mutation {
    addTransaction(uuid: ID!, amount: Float!, currency: String!): Transaction
    updateTransaction(id: ID!, uuid: ID!, amount: Float!, currency: String!): Transaction
    deleteTransaction(id: ID!): DeleteResponse
    deleteTransactionsBulk(idList: [ID!]): DeleteBulkResponse
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
    totalCount: Int!
    hasNextPage: Boolean!
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

  type DeleteBulkResponse {
    okCount: Int!
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

for (var i = 0; i < 20000; i++) {
  addTransaction({
    uuid: uuid4(),
    amount: ((Math.random() * 1000) % 1000.0) - 500.0,
    currency: Object.values(currencies)[Math.floor((Math.random() * 10) % 3)]
      .code,
  })
}

console.log(`Added ${transactionIdCounter} transactions`)

const resolvers = {
  Query: {
    transactionConnection: (_parent, q) => {
      const { page, pageSize, order, orderBy, filter } = q
      console.log(`transactions query: ${JSON.stringify(q)}`)
      
      const applyFilter = (filter) => (row) => {
        return (filter === "" || filter === row.currency )
      }

      const transactionList = stableSort(Object.values(transactions), getComparator(order, orderBy))
        .filter(applyFilter(filter));
        
      let edges = transactionList
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
          totalCount: transactionList.length,
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
    addTransaction: (_parent, { uuid, amount, currency }) => {
      console.log("addTransaction", uuid, amount, currency)
      return addTransaction({uuid, amount, currency})
    },

    updateTransaction: (_parent, { id, ...transaction }) => {
      console.log(`updateTransaction ${id} ${JSON.stringify(transaction)}`)
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
      console.log(`deleteTransaction (${id})`)
      const ok = Boolean(transactions[id])
      delete transactions[id]
      return { ok }
    },

    deleteTransactionsBulk: (_parent, { idList }) => {
      console.log(`deleteTransactionsBulk (${idList})`)
      var okCount = 0

      idList.map(id => {
        const ok = Boolean(transactions[id])
        if (ok) {
          delete transactions[id]
          okCount++
        }
        return ok
      })

      return { okCount }
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

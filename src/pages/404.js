import React from "react"
import {
  LinearProgress,
  Card,
  CardHeader,
} from "@material-ui/core"
import ReportIcon from "@material-ui/icons/Report"

import { client } from "../apollo/client"
import { ApolloProvider } from "@apollo/client"

import NavBar from "../components/NavBar"
import "../style/index.css"

const IndexPage = () => (
  <ApolloProvider client={client}>
    <React.Fragment>
      <NavBar />
      <Card className="rotate-div">
        <CardHeader title="404: Not found" avatar={<ReportIcon/>}/>
        <LinearProgress color="primary" />
      </Card>
    </React.Fragment>
  </ApolloProvider>
)

export default IndexPage

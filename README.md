# HUB88 Test Task

## Tech included

 * Apollo GraphQL
 * React.js
 * No Redux or other state management tools

## Requirements

 - Backend graphql server should be mocked
 - Server could be the same for both frontends
 - The task will be to create two separate deployable frontends.
 Components should be reused between projects as much as possible
 - Frontend should look OK

## Frontend 1: Admin panel

Backoffice CRUD for transactions

  * shows the list of transactions
  * add new transaction (ID, UUID, amount, currency["EUR", "USD", "BTC"])
    * currency list is fetched from the backend
  * edit a transaction
  * delete a transaction

## Frontend 2: User panel

Dashboard for end-users

 * shows number of transactions
 * shows a table with transactions with pagination
 * filters transactions by currency, filtering is processed on backend
 * support for fast rendering of 10k+ transactions
 
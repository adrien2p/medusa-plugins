import React, { useEffect, useState } from "react"
import { RouteComponentProps, WindowLocation } from "@reach/router"
import SentryTransactionEvents from "./transactions/events"
import SentryTransactions from "./transactions/"
import { buildMedusaClient } from "./utils"

type Props = {
  baseUrl: string
  organisation: string
  project: string
  location: WindowLocation
  onTransactionRowClick?: (row) => string;
  onTransactionEventRowClick?: (row) => string;
}

const EVENTS_VIEW_KEY = "sentry:transaction:events"
const TRANSACTIONS_VIEW_KEY = "sentry:transactions"

const Sentry = (props: RouteComponentProps & Props) => {
  const { baseUrl, organisation, project, location, onTransactionRowClick, onTransactionEventRowClick } = props

  const [view, setView] = useState(TRANSACTIONS_VIEW_KEY)

  useEffect(() => {
    if (location.search.includes("transaction=")) {
      setView(EVENTS_VIEW_KEY)
    } else {
      setView(TRANSACTIONS_VIEW_KEY)
    }
  }, [location])

  const medusaAdminClient = buildMedusaClient({
    baseUrl,
    organisation,
    project
  })

  const transactionRowClickFn = onTransactionRowClick ?? ((row) => `?statsPeriod=24h&perPage=50&transaction=${(row.original as any).transaction}`);
  const transactionEventRowClickFn = onTransactionEventRowClick ?? (() => ``);

  const CurrentView = () => {
    switch (view) {
      case EVENTS_VIEW_KEY:
        return <SentryTransactionEvents medusaClient={medusaAdminClient} organisation={organisation} project={project} location={location} onRowClick={transactionEventRowClickFn} />
      default:
        return <SentryTransactions medusaClient={medusaAdminClient} organisation={organisation} project={project} location={location} onRowClick={transactionRowClickFn} />
    }
  }

  return (
    <CurrentView></CurrentView>
  )
}

export default Sentry

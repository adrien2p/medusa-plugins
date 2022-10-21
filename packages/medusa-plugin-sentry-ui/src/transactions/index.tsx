import React, { useEffect, useState } from "react"
import { RouteComponentProps, WindowLocation } from "@reach/router"
import SentryTransactionEvents from "./events"
import SentryTransactions from "./sentry-transactions"
import { buildMedusaClient } from "../utils"

type Props = {
  baseUrl: string
  organisation: string
  project: string
  location: WindowLocation
}

const EVENTS_VIEW_KEY = "sentry:transaction:events"
const TRANSACTIONS_VIEW_KEY = "sentry:transactions"

const Sentry = (props: RouteComponentProps & Props) => {
  const { baseUrl, organisation, project, location } = props

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

  const CurrentView = () => {
    switch (view) {
      case EVENTS_VIEW_KEY:
        return <SentryTransactionEvents medusaClient={medusaAdminClient} organisation={organisation} project={project} location={location} />
      default:
        return <SentryTransactions medusaClient={medusaAdminClient} organisation={organisation} project={project} location={location} />
    }
  }

  return (
    <CurrentView></CurrentView>
  )
}

export default Sentry

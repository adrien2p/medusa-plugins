import React, { useEffect, useState } from "react"
import { RouteComponentProps, useLocation } from "@reach/router"
import SentryTransactionEvents from "./events"
import SentryTransactions from "./sentry-transactions"
import { buildMedusaClient } from "../utils"

type Props = {
  baseUrl: string
  organisation: string
  project: string
}

const Sentry = (props: RouteComponentProps & Props) => {
  const location = useLocation()
  const [view, setView] = useState("sentry:transactions")

  useEffect(() => {
    if (location.search.includes("transaction=")) {
      setView("sentry:transaction:events")
    } else {
      setView("sentry:transactions")
    }
  }, [location])

  useEffect(() => {
    location.search = ""
  }, [view])

  const { baseUrl, organisation, project} = props
  const medusaAdminClient = buildMedusaClient({
    baseUrl,
    organisation,
    project
  })

  const CurrentView = () => {
    switch (view) {
      case "sentry:transaction:events":
        return <SentryTransactionEvents medusaClient={medusaAdminClient} organisation={organisation} project={project} />
      default:
        return <SentryTransactions medusaClient={medusaAdminClient} organisation={organisation} project={project} />
    }
  }

  return <CurrentView></CurrentView>
}

export default Sentry

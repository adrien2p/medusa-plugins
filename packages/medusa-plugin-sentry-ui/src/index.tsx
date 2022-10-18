import { Router } from "@reach/router"
import React from "react"
import Sentry from "./transactions"

type Props = {
  baseUrl: string
  organisation: string
  project: string
}

const SentryRoute = (props: Props) => {
  const { baseUrl, organisation, project } = props
  return (
    <Router>
      <Sentry path="/" baseUrl={baseUrl} organisation={organisation} project={project} />
    </Router>
  )
}

export default SentryRoute

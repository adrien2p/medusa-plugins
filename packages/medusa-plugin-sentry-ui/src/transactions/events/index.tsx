import React, { useEffect, useMemo, useState } from "react"
import qs from "qs"
import { isEmpty } from "lodash"
import { usePagination, useTable } from "react-table"
import Table  from "../../components/temp/molecules/table"
import InputField from "../../components/temp/molecules/input"
import Tooltip from "../../components/temp/atoms/tooltip"
import { useSentryTransactionEventsFilters } from "./hooks/use-sentry-transaction-events-filter"
import { TablePagination } from "../../components/table-pagination"
import { SentryTableRow } from "../../components/table-row"
import { AdmincClient, defaultFilterValues } from "../../types"
import { ActionType } from "../../components/temp/molecules/actionables"
import PublishIcon from "../../components/temp/fundamentals/icons/publish-icon"

type Props = {
  medusaClient: AdmincClient
  organisation: string;
  project: string;
  location: Location
  onRowClick?: (row) => string;
}

const useSentryTransactionEventsTableColumn = (transaction: string) => {
  const columns = useMemo(
    () => [
      {
        Header: "Event id",
        accessor: "id",
        Cell: ({ row: { original } }) => {
          return (
            <div className="flex items-center inter-small-semibold">
              {original.id}
            </div>
          )
        },
      },
      {
        Header: "Transaction",
        accessor: "transaction",
        Cell: () => {
          return (
            <div className="flex items-center inter-small-semibold">
              {transaction}
            </div>
          )
        },
      },
      {
        Header: "Timestamp",
        accessor: "timestamp",
        Cell: ({ row: { original } }) => {
          return (
            <div className="flex items-center inter-small-semibold">
              {original.timestamp}
            </div>
          )
        },
      },
      {
        Header: "",
        accessor: "graph",
        Cell: ({ row: { original } }) => {
          const dbTime = Number(original["spans.db"])
          const otherTime = Number(original["transaction.duration"])
          const dbSpanPercent = dbTime / (dbTime + otherTime) * 100
          const otherPercent = (100 - dbSpanPercent)
          return (
            <div className="flex w-full items-center inter-small-semibold pr-4">
              <div className="w-full relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <Tooltip content={dbSpanPercent.toFixed(2) + "% db"}>
                    <span className={"text-violet-60"}>
                      db: {dbTime.toFixed(2) + " ms"}
                    </span>
                  </Tooltip>
                  <Tooltip content={otherPercent.toFixed(2) + "% other"}>
                    <span className={"text-violet-60"}>
                      other: {otherTime.toFixed(2) + " ms"}
                    </span>
                  </Tooltip>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-violet-20">
                  <div style={{ width: (100 - otherPercent) + "%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-violet-60"></div>
                </div>
              </div>
            </div>
          )
        },
      },
    ],
    []
  )

  return [columns] as const
}

const SentryTransactionEvents = (props: Props) => {
  const { medusaClient, organisation, project, location, onRowClick } = props

  const {
    setStatsPeriod,
    setPerPage,
    setQuery,
    setCursor,
    filters,
    queryObject,
    representationObject,
  } = useSentryTransactionEventsFilters(location.search)

  const [events, setEvents] = useState([])
  const [nextCursor, setNextCursor] = useState()
  const [prevCursor, setPrevCursor] = useState()
  const [isLoading, setIsLoading] = useState(false)

  const fetchTransactionEvents = () => {
    setIsLoading(true)
    medusaClient.fetchSentryTransactionEvents({
      ...queryObject,
      cursor: filters.cursor
    }).then(({ data, next_cursor, prev_cursor }) => {
      setEvents(data)
      setNextCursor(next_cursor)
      setPrevCursor(prev_cursor)
    }).finally(() => {
      setIsLoading(false)
    })
  }

  useEffect(() => {
    fetchTransactionEvents()
  }, [filters.cursor])

  useEffect(() => {
    refreshWithFilters()
  }, [representationObject])

  const updateUrlFromFilter = (obj = {}) => {
    const stringifield = qs.stringify(obj)
    window.history.replaceState(`/`, "", `${`?${stringifield}`}`)
  }

  const refreshWithFilters = () => {
    const filterObj = representationObject

    if (isEmpty(filterObj)) {
      updateUrlFromFilter({
        statsPeriod: defaultFilterValues.statsPeriod,
        perPage: defaultFilterValues.perPage,
        cursor: defaultFilterValues.cursor
      })
    } else {
      updateUrlFromFilter(filterObj)
    }
  }

  const handleNext = async () => {
    if (nextCursor) {
      setCursor(nextCursor)
    }
  }

  const handlePrev = async () => {
    if (prevCursor) {
      setCursor(prevCursor)
    }
  }

  const [columns] = useSentryTransactionEventsTableColumn(filters.transaction!)

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable(
    {
      columns,
      data: events ?? [],
      manualPagination: true,
      autoResetPage: false
    } as any,
    usePagination
  )

  const getActions = (row: { original: { id: string; 'project.name': string } }): ActionType[] => [
    {
      label: "Open",
      onClick: () => window.open(
        `https://sentry.io/organizations/${organisation}/performance/${row.original["project.name"]}:${row.original.id}/?project=${project}&query=transaction.duration%3A%3C15m&statsPeriod=${filters.statsPeriod}h&transaction=${filters.transaction}&unselectedSeries=p100%28%29`,
        "_blanks"
      ),
      icon: <PublishIcon size={20} />,
    },
  ]

  return (
    <div className="p-8 rounded-rounded w-full h-full bg-white overflow-y-auto">
      <>
        <Table
          filteringOptions={
            <div className={"flex item-center space-x-4"}>
              <InputField
                label="Period"
                placeholder="24h, 48h..."
                value={filters.statsPeriod}
                onChange={(el) => setStatsPeriod(el.target.value)}
                onBlur={() => fetchTransactionEvents()}
              />
              <InputField
                label="Limit"
                placeholder="10, 20..."
                value={filters.perPage}
                onChange={(el) => setPerPage(el.target.value)}
                onBlur={() => fetchTransactionEvents()}
              />
              <InputField
                label="Query"
                placeholder='!transaction:"GET /admin/sentry-transactions"'
                value={filters.query}
                onChange={(el) => setQuery(el.target.value)}
                onBlur={() => fetchTransactionEvents()}
              />
            </div>
          }
          isLoading={isLoading}
          {...getTableProps()}
        >
          {(
            <>
              <Table.Head>
                {headerGroups?.map((headerGroup) => (
                  <Table.HeadRow {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((col) => (
                      <Table.HeadCell
                        className="min-w-[100px]"
                        {...col.getHeaderProps()}
                      >
                        {col.render("Header")}
                      </Table.HeadCell>
                    ))}
                  </Table.HeadRow>
                ))}
              </Table.Head>

              <Table.Body {...getTableBodyProps()}>
                {
                  rows?.length > 0
                  && rows.map((row: any) => {
                      prepareRow(row)
                      const linkTo = onRowClick && onRowClick(row) || ""
                      return <SentryTableRow row={row} {...row.getRowProps()} linkTo={linkTo} getActions={() => getActions(row)} />
                    })
                }
              </Table.Body>
            </>
          )}
        </Table>

        {!isLoading && !rows.length && <p className="flex justify-center p-4">No data to show</p>}

        <TablePagination
          nextPage={handleNext}
          prevPage={handlePrev}
          hasNext={!!nextCursor}
          hasPrev={!!prevCursor}
        />
      </>
    </div>
  )
}

export default SentryTransactionEvents

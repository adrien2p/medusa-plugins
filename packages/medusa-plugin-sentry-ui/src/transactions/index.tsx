import { useSentryTransactionsFilters } from '../hooks/use-sentry-transactions-filter';
import React, { useEffect, useMemo, useState } from 'react';
import qs from 'qs';
import { isEmpty } from 'lodash';
import {
	AdminClient,
	APDEX_HELP_TEXT,
	defaultFilterValues,
	GetSentryTransactionsParams,
	GetSentryTransactionsStatsParams,
	P50_HELP_TEXT,
	P75_HELP_TEXT,
	P95_HELP_TEXT,
	SentryFetchResult,
	SentryStatsFetchResult,
	TPM_HELP_TEXT,
} from '../types';
import { Row, usePagination, useTable } from 'react-table';
import Table from '../components/temp/molecules/table';
import InputField from '../components/temp/molecules/input';
import { TablePagination } from '../components/table-pagination';
import Tooltip from '../components/temp/atoms/tooltip';
import { SentryTableRow } from '../components/table-row';
import { ActionType } from '../components/temp/molecules/actionables';
import PublishIcon from '../components/temp/fundamentals/icons/publish-icon';
import TransactionStats from '../components/graphs';
import HelpCircleIcon from '../components/temp/fundamentals/icons/help-circle';

type Props = {
	medusaClient: AdminClient;
	organisation: string;
	project: string;
	location: Location;
	onRowClick: (row) => string;
};

const useSentryTransactionsTableColumn = () => {
	const columns = useMemo(
		() => [
			{
				Header: 'Transaction',
				accessor: 'transaction',
				Cell: ({ row: { original } }: { row: Row<SentryFetchResult['data'][number]> }) => {
					return (
						<div
							title={original.transaction}
							style={{ width: 500 }}
							className="block truncate inter-small-semibold"
						>
							{original.transaction}
						</div>
					);
				},
			},
			{
				Header: (
					<div className="flex items-center">
						<span>TPM</span>
						<Tooltip content={TPM_HELP_TEXT}>
							<HelpCircleIcon width={15} className={'ml-1'} />
						</Tooltip>
					</div>
				),
				accessor: 'tpm',
				Cell: ({ row: { original } }: { row: Row<SentryFetchResult['data'][number]> }) => {
					return <div className="flex items-center">{Number(original['tpm()']).toFixed(2)}</div>;
				},
			},
			{
				Header: (
					<div className="flex items-center">
						<span>P50</span>
						<Tooltip content={P50_HELP_TEXT}>
							<HelpCircleIcon width={15} className={'ml-1'} />
						</Tooltip>
					</div>
				),
				accessor: 'p50',
				Cell: ({ row: { original } }: { row: Row<SentryFetchResult['data'][number]> }) => {
					return <div className="flex items-center">{Number(original['p50()']).toFixed(2)} ms</div>;
				},
			},
			{
				Header: (
					<div className="flex items-center">
						<span>P75</span>
						<Tooltip content={P75_HELP_TEXT}>
							<HelpCircleIcon width={15} className={'ml-1'} />
						</Tooltip>
					</div>
				),
				accessor: 'p75',
				Cell: ({ row: { original } }: { row: Row<SentryFetchResult['data'][number]> }) => {
					return <div className="flex items-center">{Number(original['p75()']).toFixed(2)} ms</div>;
				},
			},
			{
				Header: (
					<div className="flex items-center">
						<span>P95</span>
						<Tooltip content={P95_HELP_TEXT}>
							<HelpCircleIcon width={15} className={'ml-1'} />
						</Tooltip>
					</div>
				),
				accessor: 'p95',
				Cell: ({ row: { original } }: { row: Row<SentryFetchResult['data'][number]> }) => {
					return <div className="flex items-center">{Number(original['p95()']).toFixed(2)} ms</div>;
				},
			},
			{
				Header: (
					<div className="flex items-center">
						<span>APDEX</span>
						<Tooltip content={APDEX_HELP_TEXT}>
							<HelpCircleIcon width={15} className={'ml-1'} />
						</Tooltip>
					</div>
				),
				accessor: 'apdex',
				Cell: ({ row: { original } }: { row: Row<SentryFetchResult['data'][number]> }) => {
					return <div className="flex items-center">{Number(original['apdex()']).toFixed(2)}</div>;
				},
			},
		],
		[]
	);

	return [columns] as const;
};

const SentryTransactions = (props: Props) => {
	const { medusaClient, organisation, project, location, onRowClick } = props;

	const { setStatsPeriod, setPerPage, setQuery, setCursor, filters, queryObject, representationObject } =
		useSentryTransactionsFilters(location.search, defaultFilterValues);

	const [transactions, setTransactions] = useState([]);
	const [nextCursor, setNextCursor] = useState<string>();
	const [prevCursor, setPrevCursor] = useState<string>();
	const [localFilters, setLocalFilters] = useState(filters);
	const [graphData, setGraphData] = useState<SentryStatsFetchResult>();
	const [isLoading, setIsLoading] = useState(false);

	const fetchTransactions = () => {
		if (!Object.keys(queryObject).length) return;

		setIsLoading(true);
		Promise.all([
			medusaClient
				.fetchSentryTransactionsStats(queryObject as GetSentryTransactionsStatsParams)
				.then((data) => setGraphData(data)),
			medusaClient
				.fetchSentryTransactions(queryObject as GetSentryTransactionsParams)
				.then(({ data, next_cursor, prev_cursor }) => {
					setTransactions(data);
					setNextCursor(next_cursor);
					setPrevCursor(prev_cursor);
				}),
		]).finally(() => {
			setIsLoading(false);
		});
	};

	useEffect(() => {
		fetchTransactions();
	}, [filters.cursor]);

	useEffect(() => {
		refreshWithFilters();
		fetchTransactions();
	}, [representationObject]);

	const updateUrlFromFilter = (obj = {}) => {
		const stringifield = qs.stringify(obj);
		window.history.replaceState(`/`, '', `${`?${stringifield}`}`);
	};

	const refreshWithFilters = () => {
		const filterObj = representationObject;

		if (isEmpty(filterObj)) {
			updateUrlFromFilter({
				statsPeriod: defaultFilterValues.statsPeriod,
				perPage: defaultFilterValues.perPage,
				cursor: defaultFilterValues.cursor,
			});
		} else {
			updateUrlFromFilter(filterObj);
		}
	};

	const handleNext = async () => {
		if (isLoading) return;

		if (nextCursor) {
			setCursor(nextCursor);
		}
	};

	const handlePrev = async () => {
		if (isLoading) return;

		if (prevCursor) {
			setCursor(prevCursor);
		}
	};

	const [columns] = useSentryTransactionsTableColumn();

	const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
		{
			columns,
			data: transactions ?? [],
		},
		usePagination
	);

	const getActions = (row: Row<SentryFetchResult['data'][number]>): ActionType[] => [
		{
			label: 'Open',
			onClick: () =>
				window.open(
					`https://sentry.io/organizations/${organisation}/performance/summary/?project=${project}&query=transaction.duration%3A%3C15m&statsPeriod=24h&transaction=${row.original.transaction}&unselectedSeries=p100%28%29`,
					'_blank'
				),
			icon: <PublishIcon size={20} />,
		},
	];

	return (
		<>
			<TransactionStats graphData={graphData} />

			<div style={{ boxShadow: '0px 0px 1px rgba(0,0,0,.3)' }} className="p-8 rounded-rounded w-ful bg-white">
				<>
					<Table
						filteringOptions={
							<div className="w-full">
								<div className={'flex item-center space-x-4'}>
									<InputField
										label="Period"
										placeholder="24h, 48h..."
										value={localFilters.statsPeriod}
										onChange={(el) =>
											setLocalFilters({ ...localFilters, statsPeriod: el.target.value })
										}
										onBlur={() => {
											setStatsPeriod(localFilters.statsPeriod);
											fetchTransactions();
										}}
									/>
									<InputField
										label="Limit"
										placeholder="10, 20..."
										value={localFilters.perPage}
										onChange={(el) =>
											setLocalFilters({ ...localFilters, perPage: el.target.value })
										}
										onBlur={() => {
											setPerPage(localFilters.perPage);
											fetchTransactions();
										}}
									/>
									<InputField
										label={'Query'}
										placeholder='!transaction:"GET /admin/sentry-transactions"'
										value={localFilters.query}
										onChange={(el) => setLocalFilters({ ...localFilters, query: el.target.value })}
										onBlur={() => {
											setQuery(localFilters.query);
											fetchTransactions();
										}}
									/>
								</div>
							</div>
						}
						isLoading={isLoading}
						{...getTableProps()}
					>
						{
							<>
								<Table.Head>
									{headerGroups?.map((headerGroup) => (
										<Table.HeadRow {...headerGroup.getHeaderGroupProps()}>
											{headerGroup.headers.map((col) => (
												<Table.HeadCell className="min-w-[100px]" {...col.getHeaderProps()}>
													{col.render('Header')}
												</Table.HeadCell>
											))}
										</Table.HeadRow>
									))}
								</Table.Head>

								<Table.Body {...getTableBodyProps()}>
									{rows?.length > 0 &&
										rows.map((row: Row<SentryFetchResult['data'][number]>) => {
											prepareRow(row);
											const linkTo = (onRowClick && onRowClick(row)) || '';
											return (
												<SentryTableRow
													row={row}
													{...row.getRowProps()}
													linkTo={linkTo}
													getActions={() => getActions(row)}
												/>
											);
										})}
								</Table.Body>
							</>
						}
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
		</>
	);
};

export default SentryTransactions;

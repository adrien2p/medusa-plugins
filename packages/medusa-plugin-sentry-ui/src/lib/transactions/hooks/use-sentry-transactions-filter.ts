import { useEffect, useMemo, useReducer, useState } from 'react';
import { parseQueryString } from '../../utils';
import qs from 'qs';

type SentryTransactionFilters = {
	statsPeriod: string;
	perPage?: number;
	query?: string;
	cursor?: string;
};

interface SentryTransactionsFiltersState {
	statsPeriod: string;
	perPage?: number;
	query?: string;
	cursor?: string;
	transaction?: string;
}

type ProductFilterAction =
	| { type: 'setStatsPeriod'; payload: string }
	| { type: 'setPerPage'; payload: number | undefined }
	| { type: 'setQuery'; payload: string | undefined }
	| { type: 'setCursor'; payload: string | undefined }

export const useSentryTransactionsFilters = (
	existing?: string,
	defaultFilters: SentryTransactionFilters | null = null
) => {
	const [representationObject, setRepresentationObject] = useState({})
	const [queryObject, setQueryObject] = useState({})

	if (existing && existing[0] === '?') {
		existing = existing.substring(1);
	}

	const initial = useMemo(
		() => parseQueryString<SentryTransactionFilters, SentryTransactionsFiltersState>(existing, defaultFilters),
		[existing, defaultFilters]
	);

	const [state, dispatch] = useReducer(reducer, initial);

	const setStatsPeriod = (statsPeriod: string) => {
		dispatch({ type: 'setStatsPeriod', payload: statsPeriod });
	};

	const setPerPage = (perPage?: string | number) => {
		dispatch({ type: 'setPerPage', payload: perPage ? parseInt(perPage as string) : undefined });
	};

	const setQuery = (query?: string) => {
		dispatch({ type: 'setQuery', payload: query });
	};

	const setCursor = (cursor?: string) => {
		dispatch({ type: 'setCursor', payload: cursor });
	};

	const getQueryObject = () => {
		const toQuery: any = { ...state };
		for (const [key, value] of Object.entries(state)) {
			toQuery[key] = value;
		}

		console.log("getQueryObject", toQuery)
		return toQuery;
	};

	const getRepresentationObject = (fromObject?: SentryTransactionsFiltersState) => {
		const objToUse = fromObject ?? state;

		const toQuery: any = {};
		for (const [key, value] of Object.entries(objToUse)) {
			toQuery[key] = value;
		}

		console.log("getRepresentationObject", toQuery)
		return toQuery;
	};

	useEffect(() => {
		setQueryObject(getQueryObject())
		setRepresentationObject(getRepresentationObject())
	}, [state]);

	return {
		...state,
		filters: {
			...state,
		},
		representationObject,
		queryObject,
		setStatsPeriod,
		setPerPage,
		setQuery,
		setCursor,
	};
};

const reducer = (
	state: SentryTransactionsFiltersState,
	action: ProductFilterAction
): SentryTransactionsFiltersState => {
	switch (action.type) {
		case 'setStatsPeriod': {
			return {
				...state,
				statsPeriod: action.payload,
			};
		}
		case 'setPerPage': {
			return {
				...state,
				perPage: action.payload,
			};
		}
		case 'setQuery': {
			return {
				...state,
				query: action.payload,
			};
		}
		case 'setCursor': {
			return {
				...state,
				cursor: action.payload,
			};
		}
		default: {
			return state;
		}
	}
};

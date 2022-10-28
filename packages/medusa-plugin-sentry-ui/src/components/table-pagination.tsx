import clsx from 'clsx';
import ArrowLeftIcon from './temp/fundamentals/icons/arrow-left-icon';
import ArrowRightIcon from './temp/fundamentals/icons/arrow-right-icon';
import React from 'react';

export const TablePagination = ({ nextPage, prevPage, hasNext, hasPrev }) => {
	return (
		<div className={clsx('flex w-full justify-between inter-small-regular text-grey-50 mt-14')}>
			<div className="w-full flex space-x-4">
				<div className="w-full flex space-x-4 items-center justify-end">
					<div
						className={clsx({ ['text-grey-30']: !hasPrev }, { ['cursor-pointer']: hasPrev })}
						onClick={() => prevPage()}
					>
						<ArrowLeftIcon />
					</div>
					<div
						className={clsx({ ['text-grey-30']: !hasNext }, { ['cursor-pointer']: hasNext })}
						onClick={() => nextPage()}
					>
						<ArrowRightIcon />
					</div>
				</div>
			</div>
		</div>
	);
};

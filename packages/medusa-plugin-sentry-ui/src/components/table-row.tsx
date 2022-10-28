import Table from './temp/molecules/table';
import React from 'react';

export const SentryTableRow = ({ row, ...rest }) => {
	return (
		<Table.Row
			color={'inherit'}
			linkTo={rest.linkTo ?? undefined}
			actions={rest?.getActions ? rest.getActions() : []}
			{...rest}
		>
			{row.cells.map((cell, index) => {
				return <Table.Cell {...cell.getCellProps({ width: 500 })}>{cell.render('Cell', { index })}</Table.Cell>;
			})}
		</Table.Row>
	);
};

import React from 'react';
import { VictoryArea, VictoryAxis, VictoryChart, VictoryContainer, VictoryLabel } from 'victory';

type BarChartProps = {
	data: [number, [{ count: number }]][];
};

function BarChart(props: BarChartProps) {
	const data = props.data.map((d) => ({ timestamp: d[0], value: d[1][0].count }));
	console.log({ data });

	return (
		<div>
			<svg style={{ height: 0 }}>
				<defs>
					<linearGradient id="myGradient" x1="100%" y1="100%" x2="100%" y2="0%">
						<stop offset="5%" stopColor="rgba(124, 58, 237, 0.01)" />
						<stop offset="100%" stopColor="#7C3AED" />
					</linearGradient>
				</defs>
			</svg>
			<VictoryChart
				width={320}
				height={160}
				padding={{ top: 12, bottom: 0, right: 12, left: 32 }}
				containerComponent={
					<VictoryContainer
						style={{
							boxShadow: '0px 0px 1px rgba(0,0,0,.3)',
							marginBottom: 24,
							backgroundColor: 'white',
							borderRadius: 12,
						}}
						responsive={false}
					/>
				}
				domain={{ y: [0, 1] }}
				animate={{ duration: 200 }}
			>
				<VictoryArea
					style={{
						data: { fill: 'url(#myGradient)', stroke: 'transparent' },
					}}
					data={data}
					x="timestamp"
					y="value"
					interpolation="natural"
				/>

				<VictoryAxis dependentAxis />
			</VictoryChart>
		</div>
	);
}

function TransactionStats({ graphData }) {
	if (!graphData) {
		return null;
	}

	console.log(graphData);

	graphData['failure_rate()'].data.forEach((d) => (d[1][0].count = Math.random() > 0.9 ? Math.random() : 0));

	return (
		<>
			<BarChart data={graphData['failure_rate()'].data} />
		</>
	);
}

export default TransactionStats;

import React from 'react';
import { VictoryArea, VictoryAxis, VictoryChart, VictoryTooltip, VictoryVoronoiContainer } from 'victory';

type BarChartProps = {
	data: [number, [{ count: number }]][];
	title: string;
	subtitle: string;
};

function BarChart(props: BarChartProps) {
	const data = props.data?.map((d) => ({ timestamp: d[0], value: d[1][0].count }));

	return (
		<div
			style={{
				marginBottom: 32,
				boxShadow: '0px 0px 1px rgba(0,0,0,.3)',
				backgroundColor: 'white',
				borderRadius: 12,
			}}
		>
			<h3 style={{ fontWeight: 'bold', margin: '12px 16px 0 16px' }}>{props.title}</h3>
			<div
				style={{ fontSize: 12, margin: ' 0 16px', color: 'rgba(107, 114, 128)' }}
				className="text-gray font-small mx-16"
			>
				{props.subtitle}
			</div>

			<svg style={{ height: 0 }}>
				<defs>
					<linearGradient id="myGradient" x1="100%" y1="100%" x2="100%" y2="0%">
						<stop offset="5%" stopColor="rgba(124, 58, 237, 0.01)" />
						<stop offset="100%" stopColor="#7C3AED" />
					</linearGradient>
				</defs>
			</svg>

			<div style={{ width: 360, height: 160 }}>
				{data && (
					<VictoryChart
						width={360}
						height={160}
						padding={{ top: 12, bottom: 0, right: 12, left: 32 }}
						containerComponent={
							<VictoryVoronoiContainer
								labels={(d) => {
									console.log(d);
									return 'something';
								}}
							/>
						}
						domain={{ y: [0, 1] }}
						animate={{ duration: 200 }}
					>
						<VictoryArea
							labelComponent={<VictoryTooltip flyoutStyle={{ fill: 'white' }} />}
							style={{
								data: { fill: 'url(#myGradient)', stroke: '#7C3AED' },
							}}
							data={data}
							x="timestamp"
							y="value"
							interpolation="natural"
						/>

						<VictoryAxis
							dependentAxis
							style={{
								axis: { stroke: 'transparent' },
								tickLabels: { fill: 'transparent' },
							}}
						/>
					</VictoryChart>
				)}
			</div>
		</div>
	);
}

function TransactionStats({ graphData }) {
	graphData?.['apdex()']?.data.forEach((d) => (d[1][0].count = Math.random() > 0.9 ? Math.random() : 0));
	graphData?.['failure_rate()']?.data.forEach((d) => (d[1][0].count = Math.random() > 0.9 ? Math.random() : 0));
	graphData?.['tpm()']?.data.forEach((d) => (d[1][0].count = Math.random() > 0.9 ? Math.random() : 0));

	return (
		<div className="flex justify-between">
			<BarChart title="Apdex" subtitle="Long description of the stat" data={graphData?.['apdex()'].data} />
			<BarChart
				title="Faliure rate"
				subtitle="Long description of the stat"
				data={graphData?.['failure_rate()'].data}
			/>
			<BarChart title="TPM" subtitle="Long description of the stat" data={graphData?.['tpm()'].data} />
		</div>
	);
}

export default TransactionStats;

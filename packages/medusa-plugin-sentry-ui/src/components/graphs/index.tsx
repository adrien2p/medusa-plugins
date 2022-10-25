import React from 'react';
import { VictoryArea, VictoryAxis, VictoryChart, VictoryTooltip, VictoryVoronoiContainer } from 'victory';

type BarChartProps = {
	data: [number, [{ count: number }]][];
	title: string;
	subtitle: string;
	gradient: string;
};

function BarChart(props: BarChartProps) {
	const data = props.data?.map((d) => ({ timestamp: d[0], value: d[1][0].count }));

	const stroke = { yellowGradient: '#FFC42A', purpuleGradient: '#7C3AED', blueGradient: '#4155ED' }[props.gradient];

	return (
		<div
			style={{
				marginBottom: 32,
				boxShadow: '0px 0px 1px rgba(0,0,0,.3)',
				backgroundColor: 'white',
				borderRadius: 8,
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
					<linearGradient id="purpleGradient" x1="100%" y1="100%" x2="100%" y2="0%">
						<stop offset="5%" stopColor="rgba(124, 58, 237, 0.01)" />
						<stop offset="100%" stopColor="#7C3AED" />
					</linearGradient>
				</defs>
				<defs>
					<linearGradient id="yellowGradient" x1="100%" y1="100%" x2="100%" y2="0%">
						<stop offset="5%" stopColor="rgba(255, 196, 42, 0.01)" />
						<stop offset="100%" stopColor="#FFC42A" />
					</linearGradient>
				</defs>

				<defs>
					<linearGradient id="blueGradient" x1="100%" y1="100%" x2="100%" y2="0%">
						<stop offset="5%" stopColor="rgba(65, 85, 237, 0.01)" />
						<stop offset="100%" stopColor="#4155ED" />
					</linearGradient>
				</defs>
			</svg>

			<div style={{ width: 360, height: 160, position: 'relative' }}>
				<div
					style={{
						position: 'absolute',
						height: '100%',
						width: 20,
						flexDirection: 'column',
						justifyContent: 'space-between',
						fontSize: 10,
						textAlign: 'right',
						top: 4,
						right: 16,
						color: 'rgba(107, 114, 128)',
						display: !data ? 'none' : 'flex',
					}}
				>
					<span>100%</span>
					<span>0%</span>
				</div>
				{data && (
					<div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
						<VictoryChart
							width={360}
							height={160}
							padding={{ top: 12, bottom: 0, right: 40, left: 16 }}
							containerComponent={
								<VictoryVoronoiContainer
									labels={(d) => {
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
									data: { fill: `url(#${props.gradient})`, stroke },
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
					</div>
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
			<BarChart
				gradient="purpleGradient"
				title="Apdex"
				subtitle="Apdex percentage"
				data={graphData?.['apdex()'].data}
			/>
			<BarChart
				gradient="yellowGradient"
				title="Faliure rate"
				subtitle="Falieure rate percentage"
				data={graphData?.['failure_rate()'].data}
			/>
			<BarChart
				gradient="blueGradient"
				title="TPM"
				subtitle="Transactions per minute percentage"
				data={graphData?.['tpm()'].data}
			/>
		</div>
	);
}

export default TransactionStats;

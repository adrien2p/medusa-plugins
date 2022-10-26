import React from 'react';
import { VictoryArea, VictoryAxis, VictoryChart, VictoryTooltip, VictoryVoronoiContainer } from "victory";
import styled from "styled-components";

type BarChartProps = {
	data: [number, [{ count: number }]][];
	title: string;
	subtitle: string;
	gradient: string;
};

const GraphContainer = styled.div`
.VictoryContainer > svg {
	width: 100%;
	height: 100%;
 	overflow: visible;
}
`;

function BarChart(props: BarChartProps & { yMin: string; yMax: string; }) {
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
					<span>{props.yMax}</span>
					<span>{props.yMin}</span>
				</div>
				{data && (
					<GraphContainer>
						<div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
							<VictoryChart
								width={360}
								height={160}
								padding={{ top: 12, bottom: 0, right: 40, left: 16 }}
								containerComponent={
									<VictoryVoronoiContainer
										labels={({ datum }) =>
											`${new Date(datum.timestamp * 1000).toLocaleString()} \n Value: ${Math.round(datum.value * 100)}`
										}
									/>
								}
								animate={{ duration: 200 }}
							>
								<VictoryArea
									labelComponent={<VictoryTooltip flyoutStyle={{fill: "white"}} />}
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
					</GraphContainer>
				)}
			</div>
		</div>
	);
}

function TransactionStats({ graphData }) {
	const tpmYMax = Math.max(0, ...(graphData?.['tpm()']?.data.map(d => d?.[1]?.[0]?.count ?? 0) ?? []))

	return (
		<div className="flex justify-between">
			<BarChart
				gradient="purpleGradient"
				title="Apdex"
				subtitle="Apdex percentage"
				data={graphData?.['apdex()'].data}
				yMin={"0"}
				yMax={"100"}
			/>
			<BarChart
				gradient="yellowGradient"
				title="Failure rate"
				subtitle="Failure rate percentage"
				data={graphData?.['failure_rate()'].data}
				yMin={"0"}
				yMax={"100"}
			/>
			<BarChart
				gradient="blueGradient"
				title="TPM"
				subtitle="Transactions per minute"
				data={graphData?.['tpm()'].data}
				yMin={"0"}
				yMax={tpmYMax.toFixed(1)}
			/>
		</div>
	);
}

export default React.memo(TransactionStats);

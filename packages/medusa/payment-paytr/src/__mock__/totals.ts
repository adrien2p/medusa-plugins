export const TotalsServiceMock = {
	getTotal: jest.fn().mockReturnValue(Promise.resolve(1000)),
};

const mock = jest.fn().mockImplementation(() => {
	return TotalsServiceMock;
});

export default mock;

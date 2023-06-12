import { AwilixContainer } from 'awilix';
import { eventEmitter } from '../core/event-emitter';

const eventEmitterLoader = async (container: AwilixContainer, options) => {
	await eventEmitter.registerListeners(container);
};

export default eventEmitterLoader;

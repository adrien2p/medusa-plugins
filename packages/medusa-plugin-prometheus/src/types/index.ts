import { OpenAPI } from 'openapi-types';
import { NextFunction } from 'express';

export type SwaggerStats = {
	name?: string;
	version?: string;
	hostname?: string;
	ip?: string;
	timelineBucketDuration?: number;
	swaggerSpec?: string | OpenAPI.Document;
	uriPath: string;
	durationBuckets?: number[];
	requestSizeBuckets?: number[];
	responseSizeBuckets?: number[];
	apdexThreshold?: number;
	onResponseFinish?: (req: Request, res: Response, next: NextFunction) => void | Promise<void>;
	authentication?: boolean;
	sessionMaxAge?: number;
	elasticsearch?: string;
	onAuthenticate?: (req: Request, username: string, password: string) => boolean | Promise<boolean>;
};

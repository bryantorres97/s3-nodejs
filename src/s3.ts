import { S3Client, PutObjectCommand, PutObjectCommandInput, ListObjectsCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';

import { S3_ACCESS_KEY, S3_BUCKET, S3_BUCKET_REGION, S3_SECRET_KEY } from './config';
import fileUpload from 'express-fileupload';

const client = new S3Client({
	region: S3_BUCKET_REGION,
	credentials: {
		accessKeyId: S3_ACCESS_KEY,
		secretAccessKey: S3_SECRET_KEY,
	},
});

export const uploadFile = async (file: fileUpload.UploadedFile) => {
	const stream = fs.createReadStream(file.tempFilePath);
	const uploadParams: PutObjectCommandInput = {
		Bucket: S3_BUCKET,
		Key: file.name,
		Body: stream,
	};

	const command = new PutObjectCommand(uploadParams);
	const response = await client.send(command);
	console.log(response);
	return response;
};

export const getFiles = async () => {
	const params = {
		Bucket: S3_BUCKET,
	};
	const command = new ListObjectsCommand(params);
	const response = await client.send(command);
	return response.Contents;
};

export const getFile = async (key: string) => {
	const params = {
		Bucket: S3_BUCKET,
		Key: key,
	};
	const command = new GetObjectCommand(params);
	const response = await client.send(command);
	return response;
};

export const downloadFile = async (key: string) => {
	const params = {
		Bucket: S3_BUCKET,
		Key: key,
	};
	const command = new GetObjectCommand(params);
	const response = await client.send(command);

	if (!response.Body) {
		throw Error('El archivo no existe');
	}

	const buffer = (await response.Body.transformToByteArray()).buffer;
	const stream = fs.createWriteStream(`./downloads/${key}`);
	stream.on('error', (err) => {
		console.log(err);
	});

	stream.write(Buffer.from(buffer));
	stream.end();

	return stream;

	stream.write(Buffer.from(buffer));
	stream.end();

	return `./downloads/${key}`;
};

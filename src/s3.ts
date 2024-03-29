import { S3Client, PutObjectCommand, PutObjectCommandInput, ListObjectsCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

import { S3_ACCESS_KEY, S3_BUCKET, S3_BUCKET_REGION, S3_SECRET_KEY } from './config';
import fileUpload from 'express-fileupload';

const client = new S3Client({
	region: S3_BUCKET_REGION,
	credentials: {
		accessKeyId: S3_ACCESS_KEY,
		secretAccessKey: S3_SECRET_KEY,
	},
});

/**
 * Carga un archivo en un depósito de S3 mediante AWS SDK para JavaScript.
 * @param file - Representa el archivo cargado y contiene información de este.
 * @returns Se está devolviendo la respuesta de la operación de carga de S3.
 */
export const uploadFile = async (file: fileUpload.UploadedFile) => {
	const stream = fs.createReadStream(file.tempFilePath);
	const fileExtension = file.name.split('.').pop();
	const fileName = uuidv4().concat(`.${fileExtension}`);
	const uploadParams: PutObjectCommandInput = {
		Bucket: S3_BUCKET,
		Key: fileName,
		Body: stream,
		ContentType: file.mimetype,
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

export const getFileUrl = async (key: string) => {
	const params = {
		Bucket: S3_BUCKET,
		Key: key,
	};
	const command = new GetObjectCommand(params);
	const url = await getSignedUrl(client, command, { expiresIn: 3600 });
	return url;
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

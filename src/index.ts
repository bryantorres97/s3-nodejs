import cors from 'cors';
import express from 'express';
import fileUpload from 'express-fileupload';

import { PORT } from './config';
import { downloadFile, getFile, getFiles, uploadFile } from './s3';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
	fileUpload({
		useTempFiles: true,
		tempFileDir: './tmp/',
	})
);

app.get('/', (req, res) => {
	res.json('Servidor corriendo correctamente');
});

app.get('/files', async (req, res) => {
	const files = await getFiles();
	return res.json(files);
});

app.get('/files/:key', async (req, res) => {
	const { key } = req.params;
	const file = await getFile(key);
	console.log(file.Body);
	return res.json(file.$metadata);
});

app.get('/download/:key', async (req, res) => {
	const { key } = req.params;
	const file = await downloadFile(key);
	return res.json({ message: 'Descargado' });
	// res.setHeader('Content-Disposition', `attachment; filename=${key}`);
});

app.post('/uploads', async (req, res) => {
	const { files } = req;
	if (!files || Object.keys(files).length === 0) {
		return res.status(400).json({
			message: 'No files were uploaded.',
		});
	}
	const file: fileUpload.UploadedFile = files['file'] as fileUpload.UploadedFile;
	const result = await uploadFile(file);
	return res.json({
		message: 'Welcome',
		result,
	});
});

app.listen(PORT, () => {
	console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

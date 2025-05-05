import express from 'express';
import path from "path";
import chalk from 'chalk';
import multer from 'multer';
import fs from 'fs';

// Iniciar roteador
const app = express();

// Header global
app.use((req, res, next) => {
    res.setHeader('X-SERVED-BY', 'node');
    next();
});

// Diretório de upload
const uploadDir = path.join('public', 'storage', 'files');

// Garante que a pasta existe
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, uploadDir);
    },
    filename: (req, file, callback) => {
        // 🔧 Corrige encoding do nome do arquivo
        const raw = Buffer.from(file.originalname, 'latin1');
        const fixedName = raw.toString('utf8');
        callback(null, fixedName);
    }
});

const upload = multer({ storage: storage });

// Rota de upload
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('Nenhum arquivo enviado.');
    }
    res.status(200).send('Upload concluído!');
});

const storageDir = path.join('public', 'storage', 'files');

app.get('/storage/files/', (req, res) => {
    fs.readdir(storageDir, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao listar arquivos.' });
        }

        const list = files.map(file => ({
            name: file,
            url: `/storage/files/${encodeURIComponent(file)}`
        }));

        res.json(list);
    });
});

// Servir o frontend
app.use(express.static(path.join('public')));

// Fallback 404
app.use((req, res) => {
    res.status(404).send('Not found');
});

// Iniciar servidor
const port = process.env.PORT || 4444;
app.listen(port, () => {
    console.log(chalk.green(`Servidor rodando na porta ${port}`));
});

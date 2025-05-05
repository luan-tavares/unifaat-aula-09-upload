import fs from 'fs';
import multer from 'multer';
import path from 'path';

export default (function () {

    const storageDir = path.join('aula-09', 'public', 'storage');

    fs.mkdirSync(storageDir, { recursive: true });

    return {

        // Action para fazer upload
        'upload': (req, res) => {

            /** Insira o codigo aqui */

            const storage = multer.diskStorage({
                destination: (req, file, callback) => {
                    callback(null, storageDir)
                },
                filename: (req, file, callback) => {
                    const raw = Buffer.from(file.originalname, 'latin1')
                    const fixedName = raw.toString('utf8')
                    callback(null, fixedName)
                }
            })

            const upload = multer({ storage }).single('file');

            // Executa o middleware do multer aqui mesmo
            upload(req, res, function (err) {
                if (err) {
                    return res.status(500).json({ erro: 'Erro ao fazer upload', detalhe: err.message })
                }

                if (!req.file) {
                    return res.status(400).send('Nenhum arquivo enviado.')
                }

                res.status(200).send('Upload concluído!')
            })
        },

        // Action para trazer os arquivos
        'fetch': (req, res) => {

            /** Insira o codigo aqui */

            fs.readdir(storageDir, (err, files) => {
                if (err) {
                    return res.status(500).json({ error: 'Erro ao listar arquivos.' });
                }

                const list = files
                    // Filtra arquivos ocultos e indesejados
                    .filter(file => !['.gitignore', '.gitkeep'].includes(file))
                    .map(file => ({
                        name: file,
                        url: `/aula-09-public/storage/${encodeURIComponent(file)}`
                    }));

                res.json(list);
            });

        }

    }

})();

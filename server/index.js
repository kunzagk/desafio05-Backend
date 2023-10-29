const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT ?? 3_000;

app.use(cors());
app.use(express.json());
app.use(require('../middleware/informe.js'));

const { obtenerJoyas, obtenerJoyaPorId, filtrarJoyas } = require('../utils/pg');

app.get('/joyas', async (req, res) => {
    try {
        const result = await obtenerJoyas(req.query);
        res.status(result?.code ? 500 : 200).json(result);
    } catch (error) {
        res.status(500).json(error);
    }
});

app.get('/joyas/joya/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await obtenerJoyaPorId(id);
        res.status(result?.code ? 500 : 200).json(result);
    } catch (error) {
        res.status(500).json(error);
    }
});

app.get('/joyas/filtros', async (req, res) => {
    try {
        const result = await filtrarJoyas(req.query);
        res.status(result?.code ? 500 : 200).json(result);
    } catch (error) {
        res.status(500).json(error);
    }
});

app.all('*', (_, res) => res.status(404).json({ code: 404, message: 'Resource not found' }));

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));


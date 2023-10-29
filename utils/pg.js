require('dotenv').config();
const { Pool } = require('pg');
const format = require('pg-format');

const config = {
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    database: process.env.PG_DATABASE,
    allowExistOnIdle: true
};

const pool = new Pool(config);

const genericSqlQuery = (query, values) => pool
    .query(query, values)
    .then(({ rows }) => rows)
    .catch(({ code, message }) => ({ code, message }));

const obtenerJoyaPorId = async (id) => await genericSqlQuery('SELECT * FROM inventario WHERE id = $1;', [id]);

const HATEOAS = (joyas, limits, order_by, page, totalPages) => {
    const results = joyas.map((j) => ({
        nombre: j.nombre,
        href: `/joyas/joya/${j.id}`
    }));
    return {
        total: joyas.length,
        next: page < totalPages ? `/joyas?limits=${limits}&page=${+page + 1}&order_by=${order_by}` : null,
        previous: page > 1 ? `/joyas?limits=${limits}&page=${page - 1}&order_by=${order_by}` : null,
        results
    };
};

const obtenerJoyas = async ({ limits = 10, page = 1, order_by = 'nombre_asc' }) => {
    const offset = (page - 1) * limits;
    const [campo, direccion] =order_by.split('_')
    const query = format('SELECT * FROM inventario ORDER BY %s %s LIMIT %s OFFSET %s ;', campo, direccion, limits, offset);
    console.log(query)
    const joyas = await genericSqlQuery(query, []);
    const totalJoyas = await genericSqlQuery('SELECT COUNT(*) FROM inventario', []);
    const total = totalJoyas[0].count;
    const totalPages = Math.ceil(total / limits);

    return HATEOAS(joyas, limits, order_by, page);
};

const filtrarJoyas = async ({ preciomax, preciomin, categoria, metal }) => {
    const filters = []
    const values = []
    let query = 'SELECT * FROM inventario '
    if (preciomax) filters.push(`precio <= $${values.push(preciomax)}`)
    if (preciomin) filters.push(`precio >= $${values.push(preciomin)}`)
    if (categoria) filters.push(`categoria = $${values.push(categoria)}`)
    if (metal) filters.push(`metal = $${values.push(metal)}`)
    if (filters.length > 0) query += `WHERE ${filters.join(' AND ')};`
    return await genericSqlQuery(query, values)
};

module.exports = {
    obtenerJoyaPorId,
    obtenerJoyas,
    filtrarJoyas
};
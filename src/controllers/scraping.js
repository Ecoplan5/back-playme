const axios = require('axios');
const cheerio = require('cheerio');
const Product = require('../models/scraping'); // Modelo de Sequelize

// Función de scraping
async function scrapeGEF() {
    try {
        const url = 'https://www.gef.co/collections/hombres-accesorios';
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const products = [];

        // Buscar cada producto en la página
        $('.product-card').each((index, element) => {
            const Name = $(element).find('.product-card__title').text().trim();
            const price = $(element).find('.price__sale').text().trim();
            
            // Aquí se encuentra el selector para la imagen
            const image = $(element).find('.pswp__img').attr('src');
            
            // Asegurarse de obtener la URL correcta de la imagen (verifica la estructura HTML)
            const link = $(element).find('a').attr('href');

            // Verifica que los datos existan antes de agregarlos
            if (Name && price && image && link) {
                products.push({
                    Name,
                    Role,
                    image: `https:${image}`, // Asegúrate de agregar "https:" si la URL es relativa
                    link: `https://www.gef.co${link}`,
                });
            }
        });

        return products;
    } catch (error) {
        console.error('Error al hacer scraping:', error);
        throw new Error('No se pudieron obtener los datos de GEF.');
    }
}


// Función para guardar productos en la base de datos
async function saveProducts(req, res) {
    try {
        const products = await scrapeGEF();

        // Guardar productos en la base de datos
        for (const product of products) {
            await Product.findOrCreate({ where: { link: product.link }, defaults: product });
        }

        res.json({ message: 'Productos guardados en la base de datos.', products });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = { saveProducts };

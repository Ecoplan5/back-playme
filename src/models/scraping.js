const { DataTypes } = require('sequelize');

const { sequelize } = require('../../database/config');

const Product = sequelize.define('Product', {
    Name: { type: DataTypes.STRING, allowNull: false },
    Role: { type: DataTypes.STRING, allowNull: false },
    image: { type: DataTypes.STRING, allowNull: false },
    link: { type: DataTypes.STRING, allowNull: false },
});

module.exports = Product;

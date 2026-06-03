import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

/**
 * Products20211024 Model
 * Table: products_20211024
 */
const Products20211024 = sequelize.define('Products20211024', {
  lineType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    primaryKey: true,
    field: 'line_type', // 映射到数据库列名
  },
  lineNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    field: 'line_number', // 映射到数据库列名
  },
  source: {
    type: DataTypes.STRING(50),
    allowNull: false,
    primaryKey: true,
    field: 'source', // 映射到数据库列名
  },
  productName: {
    type: DataTypes.STRING(24),
    allowNull: false,
    primaryKey: true,
    field: 'product_name', // 映射到数据库列名
  },
  productNumber: {
    type: DataTypes.STRING(16),
    allowNull: false,
    field: 'product_number', // 映射到数据库列名
  },
  productType: {
    type: DataTypes.STRING(16),
    allowNull: true,
    field: 'product_type', // 映射到数据库列名
  },
}, {
  tableName: 'products_20211024',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'products_20211024 表',
})

export default Products20211024

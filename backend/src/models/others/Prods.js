import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

/**
 * Prods Model
 * Table: prods
 */
const Prods = sequelize.define('Prods', {
  lineNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    field: 'line_number', // 映射到数据库列名
  },
  lineType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    primaryKey: true,
    field: 'line_type', // 映射到数据库列名
  },
  productName: {
    type: DataTypes.STRING(24),
    allowNull: false,
    primaryKey: true,
    field: 'product_name', // 映射到数据库列名
  },
  source: {
    type: DataTypes.STRING(50),
    allowNull: false,
    primaryKey: true,
    field: 'source', // 映射到数据库列名
  },
  productNumber: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'product_number', // 映射到数据库列名
  },
  productType: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'product_type', // 映射到数据库列名
  },
}, {
  tableName: 'prods',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'prods 表',
})

export default Prods

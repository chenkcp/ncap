import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

/**
 * ProductType Model
 * Table: product_types
 */
const ProductType = sequelize.define('ProductType', {
  productType: {
    type: DataTypes.STRING(16),
    allowNull: false,
    primaryKey: true,
    field: 'product_type', // 映射到数据库列名
  },
}, {
  tableName: 'product_types',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'product_types 表',
})

export default ProductType

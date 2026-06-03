import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

// Foreign key references
// import Products from './Products.js'

/**
 * Specs Model
 * Table: specs
 */
const Specs = sequelize.define('Specs', {
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
  variableName: {
    type: DataTypes.STRING(24),
    allowNull: false,
    primaryKey: true,
    field: 'variable_name', // 映射到数据库列名
  },
  lowerLimit: {
    type: DataTypes.FLOAT,
    allowNull: false,
    field: 'lower_limit', // 映射到数据库列名
  },
  upperLimit: {
    type: DataTypes.FLOAT,
    allowNull: false,
    field: 'upper_limit', // 映射到数据库列名
  },
}, {
  tableName: 'specs',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'specs 表',
})

/**
 * 关联关系定义
 * 在 models/index.js 中配置以下关联:
 */
// Specs.belongsTo(Products, { foreignKey: 'lineType' })
// Specs.belongsTo(Products, { foreignKey: 'lineNumber' })
// Specs.belongsTo(Products, { foreignKey: 'source' })
// Specs.belongsTo(Products, { foreignKey: 'productName' })

export default Specs

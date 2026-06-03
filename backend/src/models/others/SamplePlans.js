import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

// Foreign key references
// import DefectClasses from './DefectClasses.js'
// import Products from './Products.js'

/**
 * SamplePlans Model
 * Table: sample_plans
 */
const SamplePlans = sequelize.define('SamplePlans', {
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
  className: {
    type: DataTypes.STRING(50),
    allowNull: false,
    primaryKey: true,
    field: 'class_name', // 映射到数据库列名
  },
  sampleQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    field: 'sample_quantity', // 映射到数据库列名
  },
  passQuantity: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'pass_quantity', // 映射到数据库列名
  },
  failQuantity: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'fail_quantity', // 映射到数据库列名
  },
  defaultStop: {
    type: DataTypes.SMALLINT,
    allowNull: true,
    field: 'default_stop', // 映射到数据库列名
  },
  itemType: {
    type: DataTypes.STRING(24),
    allowNull: false,
    primaryKey: true,
    field: 'item_type', // 映射到数据库列名
  },
}, {
  tableName: 'sample_plans',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'sample_plans 表',
})

/**
 * 关联关系定义
 * 在 models/index.js 中配置以下关联:
 */
// SamplePlans.belongsTo(DefectClasses, { foreignKey: 'lineType' })
// SamplePlans.belongsTo(DefectClasses, { foreignKey: 'lineNumber' })
// SamplePlans.belongsTo(DefectClasses, { foreignKey: 'source' })
// SamplePlans.belongsTo(DefectClasses, { foreignKey: 'itemType' })
// SamplePlans.belongsTo(DefectClasses, { foreignKey: 'className' })
// SamplePlans.belongsTo(Products, { foreignKey: 'lineType' })
// SamplePlans.belongsTo(Products, { foreignKey: 'lineNumber' })
// SamplePlans.belongsTo(Products, { foreignKey: 'source' })
// SamplePlans.belongsTo(Products, { foreignKey: 'productName' })

export default SamplePlans

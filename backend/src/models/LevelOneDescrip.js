import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

// Foreign key references
// import DefectClasses from './DefectClasses.js'

/**
 * LevelOneDescrip Model
 * Table: level_one_descrip
 */
const LevelOneDescrip = sequelize.define('LevelOneDescrip', {
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
  code1: {
    type: DataTypes.STRING(16),
    allowNull: false,
    primaryKey: true,
    field: 'code1', // 映射到数据库列名
  },
  className: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'class_name', // 映射到数据库列名
  },
  description1: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'description1', // 映射到数据库列名
  },
  itemType: {
    type: DataTypes.STRING(24),
    allowNull: false,
    primaryKey: true,
    field: 'item_type', // 映射到数据库列名
  },
  order1: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'order1', // 映射到数据库列名
  },
  url1: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'url1', // 映射到数据库列名
  },
}, {
  tableName: 'level_one_descrip',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'level_one_descrip 表',
})

/**
 * 关联关系定义
 * 在 models/index.js 中配置以下关联:
 */
// LevelOneDescrip.belongsTo(DefectClasses, { foreignKey: 'lineType' })
// LevelOneDescrip.belongsTo(DefectClasses, { foreignKey: 'lineNumber' })
// LevelOneDescrip.belongsTo(DefectClasses, { foreignKey: 'source' })
// LevelOneDescrip.belongsTo(DefectClasses, { foreignKey: 'itemType' })
// LevelOneDescrip.belongsTo(DefectClasses, { foreignKey: 'className' })

export default LevelOneDescrip

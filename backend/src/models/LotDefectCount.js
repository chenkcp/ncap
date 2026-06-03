import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'
import Lot from './Lot.js'

// Foreign key references
// import Lots from './Lots.js'

/**
 * LotDefectCount Model
 * Table: lot_defect_counts
 */
const LotDefectCount = sequelize.define('LotDefectCount', {
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
  lotId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    primaryKey: true,
    field: 'lot_id', // 映射到数据库列名
  },
  birthday: {
    type: DataTypes.DATE,
    allowNull: false,
    primaryKey: true,
    field: 'birthday', // 映射到数据库列名
  },
  itemType: {
    type: DataTypes.STRING(24),
    allowNull: false,
    primaryKey: true,
    field: 'item_type', // 映射到数据库列名
  },
  className: {
    type: DataTypes.STRING(50),
    allowNull: false,
    primaryKey: true,
    field: 'class_name', // 映射到数据库列名
  },
  count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'count', // 映射到数据库列名
  },
}, {
  tableName: 'lot_defect_counts',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'lot_defect_counts 表',
})

/**
 * 关联关系定义
 * 在 models/index.js 中配置以下关联:
 */
// LotDefectCount.belongsTo(Lots, { foreignKey: 'lineType' })
// LotDefectCount.belongsTo(Lots, { foreignKey: 'lineNumber' })
// LotDefectCount.belongsTo(Lots, { foreignKey: 'source' })
// LotDefectCount.belongsTo(Lot, { foreignKey: 'lotId' })
// LotDefectCount.belongsTo(Lots, { foreignKey: 'birthday' })

export default LotDefectCount

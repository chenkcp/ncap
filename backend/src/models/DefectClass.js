import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

// Foreign key references
// import Colors from './Colors.js'
// import StationItems from './StationItems.js'

/**
 * DefectClass Model
 * Table: defect_classes
 */
const DefectClass = sequelize.define('DefectClass', {
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
  severity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'severity', // 映射到数据库列名
  },
  color: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'color', // 映射到数据库列名
  },
}, {
  tableName: 'defect_classes',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'defect_classes 表',
})

/**
 * 关联关系定义
 * 在 models/index.js 中配置以下关联:
 */
// DefectClass.belongsTo(Colors, { foreignKey: 'color' })
// DefectClass.belongsTo(StationItems, { foreignKey: 'lineType' })
// DefectClass.belongsTo(StationItems, { foreignKey: 'lineNumber' })
// DefectClass.belongsTo(StationItems, { foreignKey: 'source' })
// DefectClass.belongsTo(StationItems, { foreignKey: 'itemType' })

export default DefectClass

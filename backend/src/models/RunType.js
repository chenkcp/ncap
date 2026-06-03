import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

// Foreign key references
// import Stations from './Stations.js'

/**
 * RunType Model
 * Table: run_types
 */
const RunType = sequelize.define('RunType', {
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
  runType: {
    type: DataTypes.STRING(16),
    allowNull: false,
    primaryKey: true,
    field: 'run_type', // 映射到数据库列名
  },
}, {
  tableName: 'run_types',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'run_types 表',
})

/**
 * 关联关系定义
 * 在 models/index.js 中配置以下关联:
 */
// RunType.belongsTo(Stations, { foreignKey: 'lineType' })
// RunType.belongsTo(Stations, { foreignKey: 'lineNumber' })
// RunType.belongsTo(Stations, { foreignKey: 'source' })

export default RunType

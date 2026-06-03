import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

// Foreign key references
// import PhysicalLines from './PhysicalLines.js'

/**
 * Stations Model
 * Table: stations
 */
const Station = sequelize.define('Stations', {
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
}, {
  tableName: 'stations',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'stations 表',
})

/**
 * 关联关系定义
 * 在 models/index.js 中配置以下关联:
 */
// Station.belongsTo(PhysicalLines, { foreignKey: 'lineType' })
// Station.belongsTo(PhysicalLines, { foreignKey: 'lineNumber' })

export default Station

import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

// Foreign key references
// import Stations from './Stations.js'

/**
 * ShiftBoundaries Model
 * Table: shift_boundaries
 */
const ShiftBoundaries = sequelize.define('ShiftBoundaries', {
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
  startOfCycle: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'start_of_cycle', // 映射到数据库列名
  },
  cycleLength: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'cycle_length', // 映射到数据库列名
  },
}, {
  tableName: 'shift_boundaries',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'shift_boundaries 表',
})

/**
 * 关联关系定义
 * 在 models/index.js 中配置以下关联:
 */
// ShiftBoundaries.belongsTo(Stations, { foreignKey: 'lineType' })
// ShiftBoundaries.belongsTo(Stations, { foreignKey: 'lineNumber' })
// ShiftBoundaries.belongsTo(Stations, { foreignKey: 'source' })

export default ShiftBoundaries

import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

// Foreign key references
// import Shifts from './Shifts.js'
// import Stations from './Stations.js'

/**
 * ShiftDefinitions Model
 * Table: shift_definitions
 */
const ShiftDefinitions = sequelize.define('ShiftDefinitions', {
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
  shift: {
    type: DataTypes.STRING(8),
    allowNull: false,
    primaryKey: true,
    field: 'shift', // 映射到数据库列名
  },
  workday: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    field: 'workday', // 映射到数据库列名
  },
  shiftStartTime: {
    type: DataTypes.FLOAT,
    allowNull: false,
    field: 'shift_start_time', // 映射到数据库列名
  },
  lengthOfShift: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'length_of_shift', // 映射到数据库列名
  },
}, {
  tableName: 'shift_definitions',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'shift_definitions 表',
})

/**
 * 关联关系定义
 * 在 models/index.js 中配置以下关联:
 */
// ShiftDefinitions.belongsTo(Shifts, { foreignKey: 'shift' })
// ShiftDefinitions.belongsTo(Stations, { foreignKey: 'lineType' })
// ShiftDefinitions.belongsTo(Stations, { foreignKey: 'lineNumber' })
// ShiftDefinitions.belongsTo(Stations, { foreignKey: 'source' })

export default ShiftDefinitions

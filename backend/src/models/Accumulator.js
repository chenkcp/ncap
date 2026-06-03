import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

// Foreign key references
// import Stations from './Stations.js'

/**
 * Accumulator Model
 * Table: accumulator
 */
const Accumulator = sequelize.define('Accumulator', {
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
  accumulator: {
    type: DataTypes.STRING(16),
    allowNull: false,
    primaryKey: true,
    field: 'accumulator', // 映射到数据库列名
  },
}, {
  tableName: 'accumulators',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'accumulators 表',
})

/**
 * 关联关系定义
 * 在 models/index.js 中配置以下关联:
 */
// Accumulator.belongsTo(Stations, { foreignKey: 'lineType' })
// Accumulator.belongsTo(Stations, { foreignKey: 'lineNumber' })
// Accumulator.belongsTo(Stations, { foreignKey: 'source' })

export default Accumulator

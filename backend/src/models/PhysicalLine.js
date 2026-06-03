import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

// Foreign key references
// import LineTypes from './LineTypes.js'

/**
 * PhysicalLine Model
 * Table: physical_lines
 */
const PhysicalLine = sequelize.define('PhysicalLine', {
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
}, {
  tableName: 'physical_lines',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'physical_lines 表',
})

/**
 * 关联关系定义
 * 在 models/index.js 中配置以下关联:
 */
// PhysicalLine.belongsTo(LineTypes, { foreignKey: 'lineType' })

export default PhysicalLine

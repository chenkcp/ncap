import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

/**
 * LineType Model
 * Table: line_types
 */
const LineType = sequelize.define('LineType', {
  lineType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    primaryKey: true,
    field: 'line_type', // 映射到数据库列名
  },
}, {
  tableName: 'line_types',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'line_types 表',
})

export default LineType

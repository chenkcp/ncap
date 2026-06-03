import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

/**
 * Shift Model
 * Table: shift
 */
const Shift = sequelize.define('Shift', {
  shift: {
    type: DataTypes.STRING(8),
    allowNull: false,
    primaryKey: true,
    field: 'shift', // 映射到数据库列名
  },
}, {
  tableName: 'shifts',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'shift 表',
})

export default Shift

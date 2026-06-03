import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

/**
 * MaterialStatuses Model
 * Table: material_statuses
 */
const MaterialStatuses = sequelize.define('MaterialStatuses', {
  materialStatus: {
    type: DataTypes.STRING(16),
    allowNull: false,
    primaryKey: true,
    field: 'material_status', // 映射到数据库列名
  },
}, {
  tableName: 'material_statuses',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'material_statuses 表',
})

export default MaterialStatuses

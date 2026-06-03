import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

/**
 * CsbStatuses Model
 * Table: csb_statuses
 */
const CsbStatuses = sequelize.define('CsbStatuses', {
  csbStatus: {
    type: DataTypes.STRING(50),
    allowNull: false,
    primaryKey: true,
    field: 'csb_status', // 映射到数据库列名
  },
}, {
  tableName: 'csb_statuses',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'csb_statuses 表',
})

export default CsbStatuses

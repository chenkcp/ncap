import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

/**
 * SyncStates Model
 * Table: sync_states
 */
const SyncStates = sequelize.define('SyncStates', {
  syncState: {
    type: DataTypes.STRING(50),
    allowNull: false,
    primaryKey: true,
    field: 'sync_state', // 映射到数据库列名
  },
}, {
  tableName: 'sync_states',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'sync_states 表',
})

export default SyncStates

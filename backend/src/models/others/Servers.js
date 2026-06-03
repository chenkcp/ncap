import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

/**
 * Servers Model
 * Table: servers
 */
const Servers = sequelize.define('Servers', {
  serverName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    primaryKey: true,
    field: 'server_name', // 映射到数据库列名
  },
}, {
  tableName: 'servers',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'servers 表',
})

export default Servers

import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

/**
 * ClientType Model
 * Table: client_types
 */
const ClientType = sequelize.define('ClientType', {
  clientType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    primaryKey: true,
    field: 'client_type', // 映射到数据库列名
  },
}, {
  tableName: 'client_types',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'client_types 表',
})

export default ClientType

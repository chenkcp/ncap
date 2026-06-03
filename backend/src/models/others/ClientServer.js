import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

// Foreign key references
// import Servers from './Servers.js'
// import ClientTypes from './ClientTypes.js'

/**
 * ClientServers Model
 * Table: client_servers
 */
const ClientServers = sequelize.define('ClientServers', {
  clientName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    primaryKey: true,
    field: 'client_name', // 映射到数据库列名
  },
  serverName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'server_name', // 映射到数据库列名
  },
  clientType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'client_type', // 映射到数据库列名
  },
}, {
  tableName: 'client_servers',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'client_servers 表',
})

/**
 * 关联关系定义
 * 在 models/index.js 中配置以下关联:
 */
// ClientServers.belongsTo(Servers, { foreignKey: 'serverName' })
// ClientServers.belongsTo(ClientTypes, { foreignKey: 'clientType' })

export default ClientServers

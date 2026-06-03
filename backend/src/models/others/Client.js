import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

/**
 * Clients Model
 * Table: clients
 */
const Clients = sequelize.define('Clients', {
  clientName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    primaryKey: true,
    field: 'client_name', // 映射到数据库列名
  },
  lineNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    field: 'line_number', // 映射到数据库列名
  },
  lineType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    primaryKey: true,
    field: 'line_type', // 映射到数据库列名
  },
  source: {
    type: DataTypes.STRING(50),
    allowNull: false,
    primaryKey: true,
    field: 'source', // 映射到数据库列名
  },
}, {
  tableName: 'clients',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'clients 表',
})

export default Clients

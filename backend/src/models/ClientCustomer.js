import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

// Foreign key references
// import ClientServers from './ClientServers.js'
// import Stations from './Stations.js'

/**
 * ClientCustomer Model
 * Table: client_customers
 */
const ClientCustomer = sequelize.define('ClientCustomer', {
  clientName: {
    type: DataTypes.STRING(50),
    primaryKey: true,
    allowNull: false,
    field: 'client_name', // 映射到数据库列名
  },
  lineType: {
    type: DataTypes.STRING(50),
    primaryKey: true,
    allowNull: false,
    field: 'line_type', // 映射到数据库列名
  },
  lineNumber: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    field: 'line_number', // 映射到数据库列名
  },
  source: {
    type: DataTypes.STRING(50),
    primaryKey: true,
    allowNull: false,
    field: 'source', // 映射到数据库列名
  },
}, {
  tableName: 'client_customers',
  timestamps: false, // 启用时间戳
  underscored: false, // 使用下划线命名
  comment: 'client_customers 表',
})

/**
 * 关联关系定义
 * 在 models/index.js 中配置以下关联:
 */
// ClientCustomer.belongsTo(ClientServers, { foreignKey: 'clientName' })
// ClientCustomer.belongsTo(Stations, { foreignKey: 'lineType' })
// ClientCustomer.belongsTo(Stations, { foreignKey: 'lineNumber' })
// ClientCustomer.belongsTo(Stations, { foreignKey: 'source' })

export default ClientCustomer

import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

// Foreign key references
// import Servers from './Servers.js'
// import SystemParameters from './SystemParameters.js'

/**
 * RuntimeValue Model
 * Table: runtime_values
 */
const RuntimeValue = sequelize.define('RuntimeValue', {
  serverName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    primaryKey: true,
    field: 'server_name', // 映射到数据库列名
  },
  parameter: {
    type: DataTypes.STRING(50),
    allowNull: false,
    primaryKey: true,
    field: 'parameter', // 映射到数据库列名
  },
  value: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'value', // 映射到数据库列名
  },
}, {
  tableName: 'runtime_values',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'runtime_values 表',
})

/**
 * 关联关系定义
 * 在 models/index.js 中配置以下关联:
 */
// RuntimeValue.belongsTo(Servers, { foreignKey: 'serverName' })
// RuntimeValue.belongsTo(SystemParameters, { foreignKey: 'parameter' })

export default RuntimeValue

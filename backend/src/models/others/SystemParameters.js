import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

// Foreign key references
// import ParameterTypes from './ParameterTypes.js'

/**
 * SystemParameters Model
 * Table: system_parameters
 */
const SystemParameters = sequelize.define('SystemParameters', {
  parameter: {
    type: DataTypes.STRING(50),
    allowNull: false,
    primaryKey: true,
    field: 'parameter', // 映射到数据库列名
  },
  parameterType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'parameter_type', // 映射到数据库列名
  },
  explanation: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'explanation', // 映射到数据库列名
  },
  required: {
    type: DataTypes.SMALLINT,
    allowNull: false,
    field: 'required', // 映射到数据库列名
  },
  default: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'default', // 映射到数据库列名
  },
}, {
  tableName: 'system_parameters',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'system_parameters 表',
})

/**
 * 关联关系定义
 * 在 models/index.js 中配置以下关联:
 */
// SystemParameters.belongsTo(ParameterTypes, { foreignKey: 'parameterType' })

export default SystemParameters

import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

// Foreign key references
// import SystemParameters from './SystemParameters.js'

/**
 * EnumParameters Model
 * Table: enum_parameters
 */
const EnumParameters = sequelize.define('EnumParameters', {
  parameter: {
    type: DataTypes.STRING(50),
    allowNull: false,
    primaryKey: true,
    field: 'parameter', // 映射到数据库列名
  },
  legalValue: {
    type: DataTypes.STRING(50),
    allowNull: false,
    primaryKey: true,
    field: 'legal_value', // 映射到数据库列名
  },
  parameterExplain: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'parameter_explain', // 映射到数据库列名
  },
}, {
  tableName: 'enum_parameters',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'enum_parameters 表',
})

/**
 * 关联关系定义
 * 在 models/index.js 中配置以下关联:
 */
// EnumParameters.belongsTo(SystemParameters, { foreignKey: 'parameter' })

export default EnumParameters

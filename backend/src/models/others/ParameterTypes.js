import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

/**
 * ParameterTypes Model
 * Table: parameter_types
 */
const ParameterTypes = sequelize.define('ParameterTypes', {
  parameterType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    primaryKey: true,
    field: 'parameter_type', // 映射到数据库列名
  },
}, {
  tableName: 'parameter_types',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'parameter_types 表',
})

export default ParameterTypes

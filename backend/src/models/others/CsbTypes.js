import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

/**
 * CsbTypes Model
 * Table: csb_types
 */
const CsbTypes = sequelize.define('CsbTypes', {
  csbType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    primaryKey: true,
    field: 'csb_type', // 映射到数据库列名
  },
}, {
  tableName: 'csb_types',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'csb_types 表',
})

export default CsbTypes

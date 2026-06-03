import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

/**
 * InkWeight Model
 * Table: ink_weight
 */
const InkWeight = sequelize.define('InkWeight', {
  productChar: {
    type: DataTypes.CHAR(2),
    allowNull: true,
    field: 'product_char', // 映射到数据库列名
  },
  weightLsl: {
    type: DataTypes.FLOAT,
    allowNull: true,
    field: 'weight_lsl', // 映射到数据库列名
  },
  weightUsl: {
    type: DataTypes.FLOAT,
    allowNull: true,
    field: 'weight_usl', // 映射到数据库列名
  },
}, {
  tableName: 'ink_weight',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'ink_weight 表',
})

export default InkWeight

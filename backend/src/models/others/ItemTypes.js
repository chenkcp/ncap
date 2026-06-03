import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

/**
 * ItemTypes Model
 * Table: item_types
 */
const ItemTypes = sequelize.define('ItemTypes', {
  itemType: {
    type: DataTypes.STRING(24),
    allowNull: false,
    primaryKey: true,
    field: 'item_type', // 映射到数据库列名
  },
}, {
  tableName: 'item_types',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'item_types 表',
})

export default ItemTypes

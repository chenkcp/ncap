import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

/**
 * Colors Model
 * Table: colors
 */
const Colors = sequelize.define('Colors', {
  color: {
    type: DataTypes.STRING(50),
    allowNull: false,
    primaryKey: true,
    field: 'color', // 映射到数据库列名
  },
  colorIndex: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'color_index', // 映射到数据库列名
  },
}, {
  tableName: 'colors',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'colors 表',
})

export default Colors

import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

/**
 * MetroLink Model
 * Table: metro_link
 */
const MetroLink = sequelize.define('MetroLink', {
  flexId: {
    type: DataTypes.STRING(12),
    allowNull: false,
    field: 'flex_id', // 映射到数据库列名
  },
  dieId: {
    type: DataTypes.STRING(30),
    allowNull: false,
    field: 'die_id', // 映射到数据库列名
  },
  penId: {
    type: DataTypes.STRING(16),
    allowNull: true,
    field: 'pen_id', // 映射到数据库列名
  },
  flexDm: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'flex_dm', // 映射到数据库列名
  },
  penDm: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'pen_dm', // 映射到数据库列名
  },
  offload: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'offload', // 映射到数据库列名
  },
}, {
  tableName: 'metro_link',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'metro_link 表',
})

export default MetroLink

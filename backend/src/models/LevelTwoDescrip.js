import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

/**
 * LevelTwoDescrip Model
 * Table: level_two_descrip
 */
const LevelTwoDescrip = sequelize.define('LevelTwoDescrip', {
  lineType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    primaryKey: true,
    field: 'line_type', // 映射到数据库列名
  },
  lineNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    field: 'line_number', // 映射到数据库列名
  },
  source: {
    type: DataTypes.STRING(50),
    allowNull: false,
    primaryKey: true,
    field: 'source', // 映射到数据库列名
  },
  itemType: {
    type: DataTypes.STRING(24),
    allowNull: false,
    primaryKey: true,
    field: 'item_type', // 映射到数据库列名
  },
  code1: {
    type: DataTypes.STRING(16),
    allowNull: false,
    primaryKey: true,
    field: 'code1', // 映射到数据库列名
  },
  code2: {
    type: DataTypes.STRING(16),
    allowNull: false,
    primaryKey: true,
    field: 'code2', // 映射到数据库列名
  },
  description2: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'description2', // 映射到数据库列名
  },
  order2: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'order2', // 映射到数据库列名
  },
  url2: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'url2', // 映射到数据库列名
  },
}, {
  tableName: 'level_two_descrip',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'level_two_descrip 表',
})

export default LevelTwoDescrip

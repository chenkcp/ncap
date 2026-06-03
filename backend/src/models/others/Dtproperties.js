import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

/**
 * Dtproperties Model
 * Table: dtproperties
 */
const Dtproperties = sequelize.define('Dtproperties', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
    field: 'id', // 映射到数据库列名
  },
  objectid: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'objectid', // 映射到数据库列名
  },
  property: {
    type: DataTypes.STRING(64),
    allowNull: false,
    primaryKey: true,
    field: 'property', // 映射到数据库列名
  },
  value: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'value', // 映射到数据库列名
  },
  uvalue: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'uvalue', // 映射到数据库列名
  },
  lvalue: {
    type: DataTypes.BLOB,
    allowNull: true,
    field: 'lvalue', // 映射到数据库列名
  },
  version: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'version', // 映射到数据库列名
  },
}, {
  tableName: 'dtproperties',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'dtproperties 表',
})

export default Dtproperties

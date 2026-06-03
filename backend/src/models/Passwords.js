import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

/**
 * Password Model
 * Table: password
 */
const Password = sequelize.define('Password', {
  userName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    primaryKey: true,
    field: 'user_name', // 映射到数据库列名
  },
  encodedPassword: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'encoded_password', // 映射到数据库列名
  },
  configprivlage: {
    type: DataTypes.SMALLINT,
    allowNull: false,
    field: 'configprivlage', // 映射到数据库列名
  },
}, {
  tableName: 'password',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'password 表',
})

export default Password

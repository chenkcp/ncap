import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

/**
 * LotComment Model
 * Table: lot_comments
 */
const LotComment = sequelize.define('LotComment', {
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
  lotId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    primaryKey: true,
    field: 'lot_id', // 映射到数据库列名
  },
  birthday: {
    type: DataTypes.DATE,
    allowNull: false,
    primaryKey: false,
    field: 'birthday', // 映射到数据库列名
  },
  commentDate: {
    type: DataTypes.DATE,
    allowNull: false,
    primaryKey: false,
    field: 'comment_date', // 映射到数据库列名
  },
  user: {
    type: DataTypes.STRING(50),
    allowNull: false,
    primaryKey: false,
    field: 'user', // 映射到数据库列名
  },
  lotComment: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'lot_comment', // 映射到数据库列名
  },
}, {
  tableName: 'lot_comments',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'lot_comments 表',
})

export default LotComment

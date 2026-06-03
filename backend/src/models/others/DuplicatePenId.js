import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

/**
 * Duplicate penId Model
 * Table: duplicate pen_id
 */
const DuplicatePenId = sequelize.define('Duplicate penId', {
  penId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'pen_id', // 映射到数据库列名
  },
}, {
  tableName: 'duplicate pen_id',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'duplicate pen_id 表',
})

export default DuplicatePenId
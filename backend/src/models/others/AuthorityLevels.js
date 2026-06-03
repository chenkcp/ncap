import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

/**
 * AuthorityLevels Model
 * Table: authority_levels
 */
const AuthorityLevels = sequelize.define('AuthorityLevels', {
  authorityLevel: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    field: 'authority_level', // 映射到数据库列名
  },
  levelExplanation: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'level_explanation', // 映射到数据库列名
  },
}, {
  tableName: 'authority_levels',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'authority_levels 表',
})

export default AuthorityLevels

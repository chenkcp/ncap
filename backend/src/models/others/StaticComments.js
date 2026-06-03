import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

// Foreign key references
// import Stations from './Stations.js'

/**
 * StaticComments Model
 * Table: static_comments
 */
const StaticComments = sequelize.define('StaticComments', {
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
  staticComment: {
    type: DataTypes.STRING(50),
    allowNull: false,
    primaryKey: true,
    field: 'static_comment', // 映射到数据库列名
  },
}, {
  tableName: 'static_comments',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'static_comments 表',
})

/**
 * 关联关系定义
 * 在 models/index.js 中配置以下关联:
 */
// StaticComments.belongsTo(Stations, { foreignKey: 'lineType' })
// StaticComments.belongsTo(Stations, { foreignKey: 'lineNumber' })
// StaticComments.belongsTo(Stations, { foreignKey: 'source' })

export default StaticComments

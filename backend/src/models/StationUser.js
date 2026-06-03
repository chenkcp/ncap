import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

// Foreign key references
// import Stations from './Stations.js'
// import AuthorityLevels from './AuthorityLevels.js'
// import Passwords from './Passwords.js'

/**
 * StationUsers Model
 * Table: station_users
 */
const StationUser = sequelize.define('StationUser', {
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
  userName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    primaryKey: true,
    field: 'user_name', // 映射到数据库列名
  },
  authorityLevel: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'authority_level', // 映射到数据库列名
  },
}, {
  tableName: 'station_users',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'station_users 表',
})

/**
 * 关联关系定义
 * 在 models/index.js 中配置以下关联:
 */
// StationUser.belongsTo(Stations, { foreignKey: 'lineType' })
// StationUser.belongsTo(Stations, { foreignKey: 'lineNumber' })
// StationUser.belongsTo(Stations, { foreignKey: 'source' })
// StationUser.belongsTo(AuthorityLevels, { foreignKey: 'authorityLevel' })
// StationUser.belongsTo(Passwords, { foreignKey: 'userName' })

export default StationUser


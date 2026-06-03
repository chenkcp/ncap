import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

// Foreign key references
// import CsbStatuses from './CsbStatuses.js'
// import CsbTypes from './CsbTypes.js'
// import Passwords from './Passwords.js'

/**
 * Csb Model
 * Table: csbs
 */
const Csb = sequelize.define('Csb', {
  csbName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    primaryKey: true,
    field: 'csb_name', // 映射到数据库列名
  },
  version: {
    type: DataTypes.DATE,
    allowNull: false,
    primaryKey: true,
    field: 'version', // 映射到数据库列名
  },
  csbType: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'csb_type', // 映射到数据库列名
  },
  program: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'program', // 映射到数据库列名
  },
  csbStatus: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'csb_status', // 映射到数据库列名
  },
  userName: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'user_name', // 映射到数据库列名
  },
  documentation: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'documentation', // 映射到数据库列名
  },
}, {
  tableName: 'csbs',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'csbs 表',
})

/**
 * 关联关系定义
 * 在 models/index.js 中配置以下关联:
 */
// Csb.belongsTo(CsbStatuses, { foreignKey: 'csbStatus' })
// Csb.belongsTo(CsbTypes, { foreignKey: 'csbType' })
// Csb.belongsTo(Passwords, { foreignKey: 'userName' })

export default Csb

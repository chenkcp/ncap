import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

// Foreign key references
// import TaskTypes from './TaskTypes.js'
// import Csbs from './Csbs.js'
// import Stations from './Stations.js'

/**
 * UserTasks Model
 * Table: user_tasks
 */
const UserTasks = sequelize.define('UserTasks', {
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
  csbName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'csb_name', // 映射到数据库列名
  },
  version: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'version', // 映射到数据库列名
  },
  taskName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    primaryKey: true,
    field: 'task_name', // 映射到数据库列名
  },
  taskType: {
    type: DataTypes.STRING(16),
    allowNull: false,
    field: 'task_type', // 映射到数据库列名
  },
  toolbar: {
    type: DataTypes.SMALLINT,
    allowNull: false,
    field: 'toolbar', // 映射到数据库列名
  },
  icon: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'icon', // 映射到数据库列名
  },
}, {
  tableName: 'user_tasks',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'user_tasks 表',
})

/**
 * 关联关系定义
 * 在 models/index.js 中配置以下关联:
 */
// UserTasks.belongsTo(TaskTypes, { foreignKey: 'taskType' })
// UserTasks.belongsTo(Csbs, { foreignKey: 'csbName' })
// UserTasks.belongsTo(Csbs, { foreignKey: 'version' })
// UserTasks.belongsTo(Stations, { foreignKey: 'lineType' })
// UserTasks.belongsTo(Stations, { foreignKey: 'lineNumber' })
// UserTasks.belongsTo(Stations, { foreignKey: 'source' })

export default UserTasks

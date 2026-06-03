import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

// Foreign key references
// import UserTasks from './UserTasks.js'

/**
 * CycleEvents Model
 * Table: cycle_events
 */
const CycleEvents = sequelize.define('CycleEvents', {
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
  taskName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    primaryKey: true,
    field: 'task_name', // 映射到数据库列名
  },
  eventStartTime: {
    type: DataTypes.DATE,
    allowNull: false,
    primaryKey: true,
    field: 'event_start_time', // 映射到数据库列名
  },
  eventCycle: {
    type: DataTypes.FLOAT,
    allowNull: false,
    field: 'event_cycle', // 映射到数据库列名
  },
  message: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'message', // 映射到数据库列名
  },
  clientName: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'client_name', // 映射到数据库列名
  },
}, {
  tableName: 'cycle_events',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'cycle_events 表',
})

/**
 * 关联关系定义
 * 在 models/index.js 中配置以下关联:
 */
// CycleEvents.belongsTo(UserTasks, { foreignKey: 'lineType' })
// CycleEvents.belongsTo(UserTasks, { foreignKey: 'lineNumber' })
// CycleEvents.belongsTo(UserTasks, { foreignKey: 'source' })
// CycleEvents.belongsTo(UserTasks, { foreignKey: 'taskName' })

export default CycleEvents

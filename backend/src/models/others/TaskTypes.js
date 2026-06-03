import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

/**
 * TaskTypes Model
 * Table: task_types
 */
const TaskTypes = sequelize.define('TaskTypes', {
  taskType: {
    type: DataTypes.STRING(16),
    allowNull: false,
    primaryKey: true,
    field: 'task_type', // 映射到数据库列名
  },
}, {
  tableName: 'task_types',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'task_types 表',
})

export default TaskTypes

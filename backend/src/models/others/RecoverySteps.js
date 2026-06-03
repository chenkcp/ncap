import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

// Foreign key references
// import Stations from './Stations.js'

/**
 * RecoverySteps Model
 * Table: recovery_steps
 */
const RecoverySteps = sequelize.define('RecoverySteps', {
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
  recoveryStep: {
    type: DataTypes.STRING(50),
    allowNull: false,
    primaryKey: true,
    field: 'recovery_step', // 映射到数据库列名
  },
  orderInList: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'order_in_list', // 映射到数据库列名
  },
}, {
  tableName: 'recovery_steps',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'recovery_steps 表',
})

/**
 * 关联关系定义
 * 在 models/index.js 中配置以下关联:
 */
// RecoverySteps.belongsTo(Stations, { foreignKey: 'lineType' })
// RecoverySteps.belongsTo(Stations, { foreignKey: 'lineNumber' })
// RecoverySteps.belongsTo(Stations, { foreignKey: 'source' })

export default RecoverySteps

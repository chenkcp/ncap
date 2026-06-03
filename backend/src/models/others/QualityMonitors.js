import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

// Foreign key references
// import Csbs from './Csbs.js'
// import Stations from './Stations.js'

/**
 * QualityMonitors Model
 * Table: quality_monitors
 */
const QualityMonitors = sequelize.define('QualityMonitors', {
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
}, {
  tableName: 'quality_monitors',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'quality_monitors 表',
})

/**
 * 关联关系定义
 * 在 models/index.js 中配置以下关联:
 */
// QualityMonitors.belongsTo(Csbs, { foreignKey: 'csbName' })
// QualityMonitors.belongsTo(Csbs, { foreignKey: 'version' })
// QualityMonitors.belongsTo(Stations, { foreignKey: 'lineType' })
// QualityMonitors.belongsTo(Stations, { foreignKey: 'lineNumber' })
// QualityMonitors.belongsTo(Stations, { foreignKey: 'source' })

export default QualityMonitors

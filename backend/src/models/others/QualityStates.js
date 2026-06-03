import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

// Foreign key references
// import Csbs from './Csbs.js'
// import Stations from './Stations.js'
// import Colors from './Colors.js'

/**
 * QualityStates Model
 * Table: quality_states
 */
const QualityStates = sequelize.define('QualityStates', {
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
  qualityStatus: {
    type: DataTypes.STRING(24),
    allowNull: false,
    primaryKey: true,
    field: 'quality_status', // 映射到数据库列名
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
  icon: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'icon', // 映射到数据库列名
  },
  message: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'message', // 映射到数据库列名
  },
  sampleRate: {
    type: DataTypes.FLOAT,
    allowNull: false,
    field: 'sample_rate', // 映射到数据库列名
  },
  color: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'color', // 映射到数据库列名
  },
  windowLength: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'window_length', // 映射到数据库列名
  },
  sampleQuantity: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'sample_quantity', // 映射到数据库列名
  },
}, {
  tableName: 'quality_states',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'quality_states 表',
})

/**
 * 关联关系定义
 * 在 models/index.js 中配置以下关联:
 */
// QualityStates.belongsTo(Csbs, { foreignKey: 'csbName' })
// QualityStates.belongsTo(Csbs, { foreignKey: 'version' })
// QualityStates.belongsTo(Stations, { foreignKey: 'lineType' })
// QualityStates.belongsTo(Stations, { foreignKey: 'lineNumber' })
// QualityStates.belongsTo(Stations, { foreignKey: 'source' })
// QualityStates.belongsTo(Colors, { foreignKey: 'color' })

export default QualityStates

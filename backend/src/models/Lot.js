import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

// Foreign key references
// import MaterialStatuses from './MaterialStatuses.js'

/**
 * Lot Model
 * Table: lot
 */
const Lot = sequelize.define('Lot', {
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
  lotId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    primaryKey: true,
    field: 'lot_id', // 映射到数据库列名
  },
  birthday: {
    type: DataTypes.DATE,
    allowNull: false,
    primaryKey: false,
    field: 'birthday', // 映射到数据库列名
  },
  closeday: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'closeday', // 映射到数据库列名
  },
  suspendDay: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'suspend_day', // 映射到数据库列名
  },
  qualityStatus: {
    type: DataTypes.STRING(24),
    allowNull: true,
    field: 'quality_status', // 映射到数据库列名
  },
  materialStatus: {
    type: DataTypes.STRING(16),
    allowNull: true,
    field: 'material_status', // 映射到数据库列名
  },
  pensShipped: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'pens_shipped', // 映射到数据库列名
  },
  pensInLot: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'pens_in_lot', // 映射到数据库列名
  },
  audit100Percent: {
    type: DataTypes.SMALLINT,
    allowNull: true,
    field: 'audit_100_percent', // 映射到数据库列名
  },
}, {
  tableName: 'lots',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'lot 表',
})


/**
 * 关联关系定义
 * 在 models/index.js 中配置以下关联:
 */
// Lot.belongsTo(MaterialStatuses, { foreignKey: 'materialStatus' })

export default Lot

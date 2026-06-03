import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

/**
 * TicapBatch Model
 * Table: ticap_batch
 */
const TicapBatch = sequelize.define('TicapBatch', {
  batchId: {
    type: DataTypes.STRING(22),
    allowNull: false,
    field: 'batch_id', // 映射到数据库列名
  },
  totalTested: {
    type: DataTypes.SMALLINT,
    allowNull: false,
    field: 'total_tested', // 映射到数据库列名
  },
  totalRisk: {
    type: DataTypes.SMALLINT,
    allowNull: false,
    field: 'total_risk', // 映射到数据库列名
  },
  totalCosm: {
    type: DataTypes.SMALLINT,
    allowNull: false,
    field: 'total_cosm', // 映射到数据库列名
  },
  totalFunc: {
    type: DataTypes.SMALLINT,
    allowNull: false,
    field: 'total_func', // 映射到数据库列名
  },
  runType: {
    type: DataTypes.STRING(1),
    allowNull: true,
    field: 'run_type', // 映射到数据库列名
  },
  maxPerBatch: {
    type: DataTypes.SMALLINT,
    allowNull: true,
    field: 'max_per_batch', // 映射到数据库列名
  },
  result: {
    type: DataTypes.STRING(1),
    allowNull: false,
    field: 'result', // 映射到数据库列名
  },
  source: {
    type: DataTypes.STRING(1),
    allowNull: true,
    field: 'source', // 映射到数据库列名
  },
  testDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'test_date', // 映射到数据库列名
  },
  lineId: {
    type: DataTypes.STRING(1),
    allowNull: true,
    field: 'line_id', // 映射到数据库列名
  },
}, {
  tableName: 'ticap_batch',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'ticap_batch 表',
})

export default TicapBatch

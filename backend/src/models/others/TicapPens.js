import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

/**
 * TicapPens Model
 * Table: ticap_pens
 */
const TicapPens = sequelize.define('TicapPens', {
  productFamily: {
    type: DataTypes.STRING(3),
    allowNull: false,
    field: 'product_family', // 映射到数据库列名
  },
  source: {
    type: DataTypes.STRING(1),
    allowNull: false,
    field: 'source', // 映射到数据库列名
  },
  lineId: {
    type: DataTypes.STRING(2),
    allowNull: true,
    field: 'line_id', // 映射到数据库列名
  },
  shiftId: {
    type: DataTypes.STRING(1),
    allowNull: true,
    field: 'shift_id', // 映射到数据库列名
  },
  hpPartnum: {
    type: DataTypes.STRING(16),
    allowNull: true,
    field: 'hp_partnum', // 映射到数据库列名
  },
  apqtstep: {
    type: DataTypes.STRING(8),
    allowNull: true,
    field: 'apqtstep', // 映射到数据库列名
  },
  thastep: {
    type: DataTypes.STRING(8),
    allowNull: true,
    field: 'thastep', // 映射到数据库列名
  },
  batchId: {
    type: DataTypes.STRING(22),
    allowNull: true,
    field: 'batch_id', // 映射到数据库列名
  },
  penId: {
    type: DataTypes.STRING(12),
    allowNull: true,
    field: 'pen_id', // 映射到数据库列名
  },
  testPenid: {
    type: DataTypes.STRING(8),
    allowNull: true,
    field: 'test_penid', // 映射到数据库列名
  },
  lotId: {
    type: DataTypes.STRING(10),
    allowNull: true,
    field: 'lot_id', // 映射到数据库列名
  },
  failureCd: {
    type: DataTypes.STRING(12),
    allowNull: true,
    field: 'failure_cd', // 映射到数据库列名
  },
  causeCd: {
    type: DataTypes.STRING(12),
    allowNull: true,
    field: 'cause_cd', // 映射到数据库列名
  },
  failureNum: {
    type: DataTypes.STRING(4),
    allowNull: true,
    field: 'failure_num', // 映射到数据库列名
  },
  causeNum: {
    type: DataTypes.STRING(4),
    allowNull: true,
    field: 'cause_num', // 映射到数据库列名
  },
  intvLevel: {
    type: DataTypes.STRING(1),
    allowNull: true,
    field: 'intv_level', // 映射到数据库列名
  },
  recovered: {
    type: DataTypes.STRING(1),
    allowNull: true,
    field: 'recovered', // 映射到数据库列名
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'quantity', // 映射到数据库列名
  },
  operatorId: {
    type: DataTypes.STRING(10),
    allowNull: true,
    field: 'operator_id', // 映射到数据库列名
  },
  testDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'test_date', // 映射到数据库列名
  },
  prodDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'prod_date', // 映射到数据库列名
  },
  beginDttm: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'begin_dttm', // 映射到数据库列名
  },
  endDttm: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'end_dttm', // 映射到数据库列名
  },
  comment: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'comment', // 映射到数据库列名
  },
  tfLot: {
    type: DataTypes.STRING(10),
    allowNull: true,
    field: 'tf_lot', // 映射到数据库列名
  },
  expmntId: {
    type: DataTypes.CHAR(4),
    allowNull: true,
    field: 'expmnt_id', // 映射到数据库列名
  },
  testBedNum: {
    type: DataTypes.SMALLINT,
    allowNull: true,
    field: 'test_bed_num', // 映射到数据库列名
  },
  testBedType: {
    type: DataTypes.STRING(10),
    allowNull: true,
    field: 'test_bed_type', // 映射到数据库列名
  },
}, {
  tableName: 'ticap_pens',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'ticap_pens 表',
})

export default TicapPens

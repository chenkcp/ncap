import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

/**
 * CapSummary Model
 * Table: cap_summary
 */
const CapSummary = sequelize.define('CapSummary', {
  productFamilyCd: {
    type: DataTypes.STRING(3),
    allowNull: false,
    field: 'product_family_cd', // 映射到数据库列名
  },
  processAreaCd: {
    type: DataTypes.STRING(3),
    allowNull: false,
    field: 'process_area_cd', // 映射到数据库列名
  },
  lineId: {
    type: DataTypes.STRING(2),
    allowNull: true,
    field: 'line_id', // 映射到数据库列名
  },
  shiftCd: {
    type: DataTypes.STRING(1),
    allowNull: true,
    field: 'shift_cd', // 映射到数据库列名
  },
  moduleId: {
    type: DataTypes.STRING(10),
    allowNull: true,
    field: 'module_id', // 映射到数据库列名
  },
  stationId: {
    type: DataTypes.STRING(10),
    allowNull: true,
    field: 'station_id', // 映射到数据库列名
  },
  hpItemNr: {
    type: DataTypes.STRING(16),
    allowNull: true,
    field: 'hp_item_nr', // 映射到数据库列名
  },
  enteredDt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'entered_dt', // 映射到数据库列名
  },
  lotId: {
    type: DataTypes.STRING(14),
    allowNull: true,
    field: 'lot_id', // 映射到数据库列名
  },
  symptomCd: {
    type: DataTypes.STRING(8),
    allowNull: false,
    field: 'symptom_cd', // 映射到数据库列名
  },
  groupExtCd: {
    type: DataTypes.STRING(4),
    allowNull: true,
    field: 'group_ext_cd', // 映射到数据库列名
  },
  subExtCd: {
    type: DataTypes.STRING(4),
    allowNull: true,
    field: 'sub_ext_cd', // 映射到数据库列名
  },
  dtlExtCd: {
    type: DataTypes.STRING(4),
    allowNull: true,
    field: 'dtl_ext_cd', // 映射到数据库列名
  },
  inspect100Fl: {
    type: DataTypes.STRING(1),
    allowNull: true,
    field: 'inspect_100_fl', // 映射到数据库列名
  },
  recoveredFl: {
    type: DataTypes.STRING(1),
    allowNull: true,
    field: 'recovered_fl', // 映射到数据库列名
  },
  instancesQt: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'instances_qt', // 映射到数据库列名
  },
  runCd: {
    type: DataTypes.STRING(6),
    allowNull: true,
    field: 'run_cd', // 映射到数据库列名
  },
  expId: {
    type: DataTypes.STRING(4),
    allowNull: true,
    field: 'exp_id', // 映射到数据库列名
  },
  tfLotId: {
    type: DataTypes.STRING(14),
    allowNull: true,
    field: 'tf_lot_id', // 映射到数据库列名
  },
}, {
  tableName: 'cap_summary',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'cap_summary 表',
})

export default CapSummary

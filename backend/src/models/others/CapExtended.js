import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

/**
 * CapExtended Model
 * Table: cap_extended
 */
const CapExtended = sequelize.define('CapExtended', {
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
  extKeyCd: {
    type: DataTypes.STRING(8),
    allowNull: false,
    field: 'ext_key_cd', // 映射到数据库列名
  },
  displayOrderCd: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'display_order_cd', // 映射到数据库列名
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
  dtlInputFl: {
    type: DataTypes.STRING(1),
    allowNull: true,
    field: 'dtl_input_fl', // 映射到数据库列名
  },
  extendedDn: {
    type: DataTypes.STRING(30),
    allowNull: true,
    field: 'extended_dn', // 映射到数据库列名
  },
}, {
  tableName: 'cap_extended',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'cap_extended 表',
})

export default CapExtended

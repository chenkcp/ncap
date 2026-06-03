import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

/**
 * CapSymptoms Model
 * Table: cap_symptoms
 */
const CapSymptoms = sequelize.define('CapSymptoms', {
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
  symptomCd: {
    type: DataTypes.STRING(8),
    allowNull: false,
    field: 'symptom_cd', // 映射到数据库列名
  },
  symptomDn: {
    type: DataTypes.STRING(30),
    allowNull: false,
    field: 'symptom_dn', // 映射到数据库列名
  },
  capClassCd: {
    type: DataTypes.STRING(10),
    allowNull: true,
    field: 'cap_class_cd', // 映射到数据库列名
  },
  extendedFl: {
    type: DataTypes.STRING(1),
    allowNull: true,
    field: 'extended_fl', // 映射到数据库列名
  },
  extKeyCd: {
    type: DataTypes.STRING(8),
    allowNull: true,
    field: 'ext_key_cd', // 映射到数据库列名
  },
  displayOrderNr: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'display_order_nr', // 映射到数据库列名
  },
  custPerceivedCd: {
    type: DataTypes.STRING(14),
    allowNull: true,
    field: 'cust_perceived_cd', // 映射到数据库列名
  },
  inspectTypeCd: {
    type: DataTypes.STRING(10),
    allowNull: true,
    field: 'inspect_type_cd', // 映射到数据库列名
  },
  custPerceivedFl: {
    type: DataTypes.STRING(1),
    allowNull: true,
    field: 'cust_perceived_fl', // 映射到数据库列名
  },
}, {
  tableName: 'cap_symptoms',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'cap_symptoms 表',
})

export default CapSymptoms

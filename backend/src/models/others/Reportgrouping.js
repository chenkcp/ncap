import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

/**
 * Reportgrouping Model
 * Table: reportgrouping
 */
const Reportgrouping = sequelize.define('Reportgrouping', {
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
  extendedCd: {
    type: DataTypes.STRING(8),
    allowNull: true,
    field: 'extended_cd', // 映射到数据库列名
  },
  groupingFunc: {
    type: DataTypes.STRING(25),
    allowNull: true,
    field: 'grouping_func', // 映射到数据库列名
  },
  groupingRisk: {
    type: DataTypes.STRING(25),
    allowNull: true,
    field: 'grouping_risk', // 映射到数据库列名
  },
  groupingCosmetic: {
    type: DataTypes.STRING(25),
    allowNull: true,
    field: 'grouping_cosmetic', // 映射到数据库列名
  },
}, {
  tableName: 'reportgrouping',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'reportgrouping 表',
})

export default Reportgrouping

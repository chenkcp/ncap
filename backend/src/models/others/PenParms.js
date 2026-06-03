import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

/**
 * PenParms Model
 * Table: pen_parms
 */
const PenParms = sequelize.define('PenParms', {
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
  penId: {
    type: DataTypes.STRING(16),
    allowNull: true,
    field: 'pen_id', // 映射到数据库列名
  },
  parmTypeCd: {
    type: DataTypes.CHAR(20),
    allowNull: true,
    field: 'parm_type_cd', // 映射到数据库列名
  },
  datum1Nr: {
    type: DataTypes.FLOAT,
    allowNull: true,
    field: 'datum1_nr', // 映射到数据库列名
  },
  datum2Nr: {
    type: DataTypes.FLOAT,
    allowNull: true,
    field: 'datum2_nr', // 映射到数据库列名
  },
  datum3Nr: {
    type: DataTypes.FLOAT,
    allowNull: true,
    field: 'datum3_nr', // 映射到数据库列名
  },
  datum4Nr: {
    type: DataTypes.FLOAT,
    allowNull: true,
    field: 'datum4_nr', // 映射到数据库列名
  },
  loggedDttm: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'logged_dttm', // 映射到数据库列名
  },
}, {
  tableName: 'pen_parms',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'pen_parms 表',
})

export default PenParms

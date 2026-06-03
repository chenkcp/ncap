import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

/**
 * ProductRefLlk Model
 * Table: product_ref_llk
 */
const ProductRefLlk = sequelize.define('ProductRefLlk', {
  invItemLkNr: {
    type: DataTypes.STRING(16),
    allowNull: false,
    primaryKey: true,
    field: 'INV_ITEM_LK_NR', // 映射到数据库列名
  },
  productNm: {
    type: DataTypes.STRING(24),
    allowNull: false,
    field: 'PRODUCT_NM', // 映射到数据库列名
  },
  picaCd: {
    type: DataTypes.STRING(3),
    allowNull: false,
    field: 'PICA_CD', // 映射到数据库列名
  },
  regionCd: {
    type: DataTypes.STRING(1),
    allowNull: false,
    field: 'REGION_CD', // 映射到数据库列名
  },
  idFetProduct: {
    type: DataTypes.STRING(5),
    allowNull: false,
    field: 'ID_FET_PRODUCT', // 映射到数据库列名
  },
  idFetMarketing: {
    type: DataTypes.STRING(5),
    allowNull: false,
    field: 'ID_FET_MARKETING', // 映射到数据库列名
  },
  midCd: {
    type: DataTypes.STRING(20),
    allowNull: false,
    field: 'MID_CD', // 映射到数据库列名
  },
  lotidCd: {
    type: DataTypes.STRING(2),
    allowNull: false,
    field: 'LOTID_CD', // 映射到数据库列名
  },
  selectabilityNr: {
    type: DataTypes.STRING(10),
    allowNull: true,
    field: 'SELECTABILITY_NR', // 映射到数据库列名
  },
  prodGenCd: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'PROD_GEN_CD', // 映射到数据库列名
  },
  updateDm: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'UPDATE_DM', // 映射到数据库列名
  },
  updateUserId: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'UPDATE_USER_ID', // 映射到数据库列名
  },
  insertDttm: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'INSERT_DTTM', // 映射到数据库列名
  },
  updateDttm: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'UPDATE_DTTM', // 映射到数据库列名
  },
  weightLsl: {
    type: DataTypes.FLOAT,
    allowNull: true,
    field: 'WEIGHT_LSL', // 映射到数据库列名
  },
  weightUsl: {
    type: DataTypes.FLOAT,
    allowNull: true,
    field: 'WEIGHT_USL', // 映射到数据库列名
  },
}, {
  tableName: 'product_ref_llk',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'product_ref_llk 表',
})

export default ProductRefLlk

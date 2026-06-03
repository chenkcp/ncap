import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

/**
 * PenParametric20230417 Model
 * Table: pen_parametric20230417
 */
const PenParametric20230417 = sequelize.define('PenParametric20230417', {
  pnId: {
    type: DataTypes.STRING(16),
    allowNull: true,
    field: 'pn_id', // 映射到数据库列名
  },
  paramlkKy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'paramlk_ky', // 映射到数据库列名
  },
  pnReclaimCt: {
    type: DataTypes.SMALLINT,
    allowNull: true,
    field: 'pn_reclaim_ct', // 映射到数据库列名
  },
  equiplkKy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'equiplk_ky', // 映射到数据库列名
  },
  vcharParamVl: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'vchar_param_vl', // 映射到数据库列名
  },
  intParamVl: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'int_param_vl', // 映射到数据库列名
  },
  dblParamVl: {
    type: DataTypes.FLOAT,
    allowNull: true,
    field: 'dbl_param_vl', // 映射到数据库列名
  },
  partDm: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'part_dm', // 映射到数据库列名
  },
  insertDm: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'insert_dm', // 映射到数据库列名
  },
  pouchId: {
    type: DataTypes.STRING(5),
    allowNull: true,
    field: 'pouch_id', // 映射到数据库列名
  },
}, {
  tableName: 'pen_parametric20230417',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'pen_parametric20230417 表',
})

export default PenParametric20230417

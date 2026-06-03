import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

/**
 * PenLotStatistic Model
 * Table: pen_lot_statistic
 */
const PenLotStatistic = sequelize.define('PenLotStatistic', {
  siteNm: {
    type: DataTypes.STRING(5),
    allowNull: false,
    primaryKey: true,
    field: 'site_nm', // 映射到数据库列名
  },
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
    primaryKey: true,
    field: 'birthday', // 映射到数据库列名
  },
  penId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    primaryKey: true,
    field: 'pen_id', // 映射到数据库列名
  },
}, {
  tableName: 'pen_lot_statistic',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'pen_lot_statistic 表',
})

export default PenLotStatistic

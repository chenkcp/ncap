import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

/**
 * PicaLkp Model
 * Table: pica_lkp
 */
const PicaLkp = sequelize.define('PicaLkp', {
  picaCd: {
    type: DataTypes.STRING(3),
    allowNull: false,
    primaryKey: true,
    field: 'pica_cd', // 映射到数据库列名
  },
  mid: {
    type: DataTypes.STRING(2),
    allowNull: false,
    primaryKey: true,
    field: 'mid', // 映射到数据库列名
  },
}, {
  tableName: 'pica_lkp',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'pica_lkp 表',
})

export default PicaLkp

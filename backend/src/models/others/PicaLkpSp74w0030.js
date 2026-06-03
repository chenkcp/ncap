import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

/**
 * PicaLkpSp74w0030 Model
 * Table: pica_lkp_sp74w0030
 */
const PicaLkpSp74w0030 = sequelize.define('PicaLkpSp74w0030', {
  picaCd: {
    type: DataTypes.STRING(3),
    allowNull: false,
    field: 'PICA_CD', // 映射到数据库列名
  },
  mid: {
    type: DataTypes.STRING(2),
    allowNull: false,
    field: 'MID', // 映射到数据库列名
  },
}, {
  tableName: 'pica_lkp_sp74w0030',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'pica_lkp_sp74w0030 表',
})

export default PicaLkpSp74w0030

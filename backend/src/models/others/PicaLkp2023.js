import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

/**
 * PicaLkp2023 Model
 * Table: pica_lkp2023
 */
const PicaLkp2023 = sequelize.define('PicaLkp2023', {
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
  tableName: 'pica_lkp2023',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'pica_lkp2023 表',
})

export default PicaLkp2023

import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

/**
 * Holdkey Model
 * Table: holdkey
 */
const Holdkey = sequelize.define('Holdkey', {
  penId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'pen_id', // 映射到数据库列名
  },
  source: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'source', // 映射到数据库列名
  },
  lineType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'line_type', // 映射到数据库列名
  },
  lineNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'line_number', // 映射到数据库列名
  },
  lotId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'lot_id', // 映射到数据库列名
  },
  birthday: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'birthday', // 映射到数据库列名
  },
  inspectionDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'inspection_date', // 映射到数据库列名
  },
  defectNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'defect_number', // 映射到数据库列名
  },
  counter: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'counter', // 映射到数据库列名
  },
}, {
  tableName: 'holdkey',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'holdkey 表',
})

export default Holdkey

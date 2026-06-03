import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

// Foreign key references
// import Pens from './Pens.js'

/**
 * PenDefect Model
 * Table: pen_defects
 */
const PenDefect = sequelize.define('PenDefect', {
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
  inspectionDate: {
    type: DataTypes.DATE,
    allowNull: false,
    primaryKey: true,
    field: 'inspection_date', // 映射到数据库列名
  },
  defectNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    field: 'defect_number', // 映射到数据库列名
  },
  className: {
    type: DataTypes.STRING(24),
    allowNull: false,
    field: 'class_name', // 映射到数据库列名
  },
  primaryDefect: {
    type: DataTypes.SMALLINT,
    allowNull: false,
    field: 'primary_defect', // 映射到数据库列名
  },
  defectComment: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'defect_comment', // 映射到数据库列名
  },
  numericComment: {
    type: DataTypes.FLOAT,
    allowNull: true,
    field: 'numeric_comment', // 映射到数据库列名
  },
  code1: {
    type: DataTypes.STRING(16),
    allowNull: false,
    field: 'code1', // 映射到数据库列名
  },
  code2: {
    type: DataTypes.STRING(16),
    allowNull: true,
    field: 'code2', // 映射到数据库列名
  },
  cause1: {
    type: DataTypes.STRING(16),
    allowNull: true,
    field: 'cause1', // 映射到数据库列名
  },
  cause2: {
    type: DataTypes.STRING(16),
    allowNull: true,
    field: 'cause2', // 映射到数据库列名
  },
}, {
  tableName: 'pen_defects',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'pen_defects 表',
})

/**
 * 关联关系定义
 * 在 models/index.js 中配置以下关联:
 */
// PenDefect.belongsTo(Pens, { foreignKey: 'lineType' })
// PenDefect.belongsTo(Pens, { foreignKey: 'lineNumber' })
// PenDefect.belongsTo(Pens, { foreignKey: 'source' })
// PenDefect.belongsTo(Pens, { foreignKey: 'lotId' })
// PenDefect.belongsTo(Pens, { foreignKey: 'birthday' })
// PenDefect.belongsTo(Pens, { foreignKey: 'penId' })
// PenDefect.belongsTo(Pens, { foreignKey: 'inspectionDate' })

export default PenDefect

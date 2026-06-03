import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

/**
 * PenDefectsAudit Model
 * Table: pen_defects_audit
 */
const PenDefectsAudit = sequelize.define('PenDefectsAudit', {
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
  source: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'source', // 映射到数据库列名
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
  penId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'pen_id', // 映射到数据库列名
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
  tableName: 'pen_defects_audit',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'pen_defects_audit 表',
})

export default PenDefectsAudit

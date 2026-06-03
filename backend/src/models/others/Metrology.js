import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

// Foreign key references
// import Pens from './Pens.js'

/**
 * Metrology Model
 * Table: metrology
 */
const Metrology = sequelize.define('Metrology', {
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
  variableName: {
    type: DataTypes.STRING(24),
    allowNull: false,
    primaryKey: true,
    field: 'variable_name', // 映射到数据库列名
  },
  value: {
    type: DataTypes.STRING(32),
    allowNull: false,
    field: 'value', // 映射到数据库列名
  },
  inSpec: {
    type: DataTypes.STRING(3),
    allowNull: false,
    field: 'in_spec', // 映射到数据库列名
  },
}, {
  tableName: 'metrology',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'metrology 表',
})

/**
 * 关联关系定义
 * 在 models/index.js 中配置以下关联:
 */
// Metrology.belongsTo(Pens, { foreignKey: 'lineType' })
// Metrology.belongsTo(Pens, { foreignKey: 'lineNumber' })
// Metrology.belongsTo(Pens, { foreignKey: 'source' })
// Metrology.belongsTo(Pens, { foreignKey: 'lotId' })
// Metrology.belongsTo(Pens, { foreignKey: 'birthday' })
// Metrology.belongsTo(Pens, { foreignKey: 'penId' })
// Metrology.belongsTo(Pens, { foreignKey: 'inspectionDate' })

export default Metrology

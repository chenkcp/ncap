import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

/**
 * Pens1 Model
 * Table: pens1
 */
const Pens1 = sequelize.define('Pens1', {
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
  numberOfPens: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'number_of_pens', // 映射到数据库列名
  },
  userName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'user_name', // 映射到数据库列名
  },
  shift: {
    type: DataTypes.STRING(8),
    allowNull: false,
    field: 'shift', // 映射到数据库列名
  },
  disposition: {
    type: DataTypes.STRING(16),
    allowNull: false,
    field: 'disposition', // 映射到数据库列名
  },
  testbed: {
    type: DataTypes.STRING(16),
    allowNull: true,
    field: 'testbed', // 映射到数据库列名
  },
  penNotShipped: {
    type: DataTypes.SMALLINT,
    allowNull: false,
    field: 'pen_not_shipped', // 映射到数据库列名
  },
  recoveryStep: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'recovery_step', // 映射到数据库列名
  },
  runType: {
    type: DataTypes.STRING(16),
    allowNull: false,
    field: 'run_type', // 映射到数据库列名
  },
  experimentId: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'experiment_id', // 映射到数据库列名
  },
  productName: {
    type: DataTypes.STRING(24),
    allowNull: false,
    field: 'product_name', // 映射到数据库列名
  },
  productNumber: {
    type: DataTypes.STRING(16),
    allowNull: false,
    field: 'product_number', // 映射到数据库列名
  },
  productType: {
    type: DataTypes.STRING(16),
    allowNull: false,
    field: 'product_type', // 映射到数据库列名
  },
  thinFilmLotId: {
    type: DataTypes.STRING(32),
    allowNull: true,
    field: 'thin_film_lot_id', // 映射到数据库列名
  },
}, {
  tableName: 'pens1',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'pens1 表',
})

export default Pens1

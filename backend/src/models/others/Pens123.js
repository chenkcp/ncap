import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

/**
 * Pens123 Model
 * Table: Pens123
 */
const Pens123 = sequelize.define('Pens123', {
  linetype: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'LineType', // 映射到数据库列名
  },
  linenumber: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'LineNumber', // 映射到数据库列名
  },
  source: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'Source', // 映射到数据库列名
  },
  lotid: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'LotId', // 映射到数据库列名
  },
  birthday: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'Birthday', // 映射到数据库列名
  },
  penid: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'PenId', // 映射到数据库列名
  },
  inspectiondate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'InspectionDate', // 映射到数据库列名
  },
  numberofpens: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'NumberOfPens', // 映射到数据库列名
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'UserName', // 映射到数据库列名
  },
  shift: {
    type: DataTypes.STRING(8),
    allowNull: true,
    field: 'Shift', // 映射到数据库列名
  },
  disposition: {
    type: DataTypes.STRING(16),
    allowNull: true,
    field: 'Disposition', // 映射到数据库列名
  },
  testbed: {
    type: DataTypes.STRING(16),
    allowNull: true,
    field: 'Testbed', // 映射到数据库列名
  },
  pennotshipped: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    field: 'PenNotShipped', // 映射到数据库列名
  },
  recoverystep: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'RecoveryStep', // 映射到数据库列名
  },
  runtype: {
    type: DataTypes.STRING(16),
    allowNull: true,
    field: 'RunType', // 映射到数据库列名
  },
  experimentid: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'ExperimentId', // 映射到数据库列名
  },
  productname: {
    type: DataTypes.STRING(24),
    allowNull: true,
    field: 'ProductName', // 映射到数据库列名
  },
  productnumber: {
    type: DataTypes.STRING(16),
    allowNull: true,
    field: 'ProductNumber', // 映射到数据库列名
  },
  producttype: {
    type: DataTypes.STRING(16),
    allowNull: true,
    field: 'ProductType', // 映射到数据库列名
  },
  thinfilmlotid: {
    type: DataTypes.STRING(32),
    allowNull: true,
    field: 'ThinFilmLotId', // 映射到数据库列名
  },
  syncstate: {
    type: DataTypes.STRING(16),
    allowNull: true,
    field: 'SyncState', // 映射到数据库列名
  },
  lotqualitystate: {
    type: DataTypes.STRING(24),
    allowNull: true,
    field: 'LotQualityState', // 映射到数据库列名
  },
}, {
  tableName: 'Pens123',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'Pens123 表',
})

export default Pens123

import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

/**
 * NextcapSourceQueueBackup Model
 * Table: NEXTCAP_SOURCE_QUEUE_BACKUP
 */
const NextcapSourceQueueBackup = sequelize.define('NextcapSourceQueueBackup', {
  queuePositionNr: {
    type: DataTypes.DECIMAL,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
    field: 'QUEUE_POSITION_NR', // 映射到数据库列名
  },
  sidNm: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'SID_NM', // 映射到数据库列名
  },
  ownerNm: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'OWNER_NM', // 映射到数据库列名
  },
  tableNm: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'TABLE_NM', // 映射到数据库列名
  },
  insertDm: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'INSERT_DM', // 映射到数据库列名
  },
  transactionCd: {
    type: DataTypes.CHAR(1),
    allowNull: true,
    field: 'TRANSACTION_CD', // 映射到数据库列名
  },
  columnNameLi: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'COLUMN_NAME_LI', // 映射到数据库列名
  },
  columnTypeLi: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'COLUMN_TYPE_LI', // 映射到数据库列名
  },
  columnValueLi: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'COLUMN_VALUE_LI', // 映射到数据库列名
  },
  prevColumnNameLi: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'PREV_COLUMN_NAME_LI', // 映射到数据库列名
  },
  prevColumnTypeLi: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'PREV_COLUMN_TYPE_LI', // 映射到数据库列名
  },
  prevColumnValueLi: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'PREV_COLUMN_VALUE_LI', // 映射到数据库列名
  },
}, {
  tableName: 'NEXTCAP_SOURCE_QUEUE_BACKUP',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'NEXTCAP_SOURCE_QUEUE_BACKUP 表',
})

export default NextcapSourceQueueBackup

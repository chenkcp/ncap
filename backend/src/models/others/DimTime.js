import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

/**
 * DimTime Model
 * Table: dim_time
 */
const DimTime = sequelize.define('DimTime', {
  calendarDt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'calendar_dt', // 映射到数据库列名
  },
  calendarYrMthCd: {
    type: DataTypes.CHAR(7),
    allowNull: true,
    field: 'calendar_yr_mth_cd', // 映射到数据库列名
  },
  monthCd: {
    type: DataTypes.CHAR(3),
    allowNull: true,
    field: 'month_cd', // 映射到数据库列名
  },
  monthNm: {
    type: DataTypes.CHAR(9),
    allowNull: true,
    field: 'month_nm', // 映射到数据库列名
  },
  calendarYearNr: {
    type: DataTypes.SMALLINT,
    allowNull: true,
    field: 'calendar_year_nr', // 映射到数据库列名
  },
  calendarYrQtrCd: {
    type: DataTypes.CHAR(6),
    allowNull: true,
    field: 'calendar_yr_qtr_cd', // 映射到数据库列名
  },
  calendarYrHlfCd: {
    type: DataTypes.CHAR(6),
    allowNull: true,
    field: 'calendar_yr_hlf_cd', // 映射到数据库列名
  },
  dayOfWeekNr: {
    type: DataTypes.SMALLINT,
    allowNull: true,
    field: 'day_of_week_nr', // 映射到数据库列名
  },
  dayOfWeekCd: {
    type: DataTypes.CHAR(3),
    allowNull: true,
    field: 'day_of_week_cd', // 映射到数据库列名
  },
  dayOfWeekNm: {
    type: DataTypes.CHAR(9),
    allowNull: true,
    field: 'day_of_week_nm', // 映射到数据库列名
  },
  fiscalYrMthNr: {
    type: DataTypes.CHAR(7),
    allowNull: true,
    field: 'fiscal_yr_mth_nr', // 映射到数据库列名
  },
  fiscalYrQtrCd: {
    type: DataTypes.CHAR(6),
    allowNull: true,
    field: 'fiscal_yr_qtr_cd', // 映射到数据库列名
  },
  fiscalYrHlfCd: {
    type: DataTypes.CHAR(6),
    allowNull: true,
    field: 'fiscal_yr_hlf_cd', // 映射到数据库列名
  },
  fiscalYr: {
    type: DataTypes.SMALLINT,
    allowNull: true,
    field: 'fiscal_yr', // 映射到数据库列名
  },
  mfgWeekCd: {
    type: DataTypes.CHAR(7),
    allowNull: true,
    field: 'mfg_week_cd', // 映射到数据库列名
  },
}, {
  tableName: 'dim_time',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'dim_time 表',
})

export default DimTime

import { Sequelize } from 'sequelize'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import env from '../config/env.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 创建 Sequelize 实例
const sequelize = new Sequelize(
  env.db.database,
  env.db.username,
  env.db.password,
  {
    host: env.db.host,
    port: env.db.port,
    dialect: env.db.dialect,
    dialectOptions: env.db.dialectOptions,
    pool: env.db.pool,
    logging: false, // 关闭 SQL 日志
  }
)

// 导出所有表结构
async function exportSchema() {
  try {
    console.log('🔌 Connecting to database...')
    await sequelize.authenticate()
    console.log('✅ Database connection established successfully.')

    // 获取所有表名
    const [tables] = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE' 
      AND TABLE_CATALOG = '${env.db.database}'
      ORDER BY TABLE_NAME
    `)

    console.log(`📊 Found ${tables.length} tables`)

    let schemaSQL = `-- Database: ${env.db.database}\n`
    schemaSQL += `-- Exported at: ${new Date().toISOString()}\n`
    schemaSQL += `-- Total tables: ${tables.length}\n\n`

    // 遍历每个表，获取创建语句
    for (const table of tables) {
      const tableName = table.TABLE_NAME
      console.log(`  📋 Exporting table: ${tableName}`)

      // 获取表的列信息
      const [columns] = await sequelize.query(`
        SELECT 
          COLUMN_NAME,
          DATA_TYPE,
          CHARACTER_MAXIMUM_LENGTH,
          IS_NULLABLE,
          COLUMN_DEFAULT,
          COLUMNPROPERTY(OBJECT_ID(TABLE_SCHEMA + '.' + TABLE_NAME), COLUMN_NAME, 'IsIdentity') as IS_IDENTITY
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = '${tableName}'
        ORDER BY ORDINAL_POSITION
      `)

      // 获取主键信息
      const [primaryKeys] = await sequelize.query(`
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE OBJECTPROPERTY(OBJECT_ID(CONSTRAINT_SCHEMA + '.' + CONSTRAINT_NAME), 'IsPrimaryKey') = 1
        AND TABLE_NAME = '${tableName}'
        ORDER BY ORDINAL_POSITION
      `)

      // 获取外键信息
      const [foreignKeys] = await sequelize.query(`
        SELECT 
          fk.name AS FK_NAME,
          OBJECT_NAME(fk.parent_object_id) AS TABLE_NAME,
          COL_NAME(fc.parent_object_id, fc.parent_column_id) AS COLUMN_NAME,
          OBJECT_NAME(fk.referenced_object_id) AS REFERENCED_TABLE_NAME,
          COL_NAME(fc.referenced_object_id, fc.referenced_column_id) AS REFERENCED_COLUMN_NAME
        FROM sys.foreign_keys AS fk
        INNER JOIN sys.foreign_key_columns AS fc ON fk.object_id = fc.constraint_object_id
        WHERE OBJECT_NAME(fk.parent_object_id) = '${tableName}'
      `)

      // 获取索引信息
      const [indexes] = await sequelize.query(`
        SELECT 
          i.name AS INDEX_NAME,
          i.is_unique AS IS_UNIQUE,
          COL_NAME(ic.object_id, ic.column_id) AS COLUMN_NAME
        FROM sys.indexes i
        INNER JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
        WHERE i.object_id = OBJECT_ID('${tableName}')
        AND i.is_primary_key = 0
        AND i.type_desc != 'HEAP'
        ORDER BY i.name, ic.key_ordinal
      `)

      // 构建 CREATE TABLE 语句
      schemaSQL += `-- ============================================\n`
      schemaSQL += `-- Table: ${tableName}\n`
      schemaSQL += `-- ============================================\n`
      schemaSQL += `CREATE TABLE [${tableName}] (\n`

      // 添加列定义
      const columnDefinitions = columns.map((col, index) => {
        let def = `  [${col.COLUMN_NAME}] ${col.DATA_TYPE}`

        // 添加长度
        if (col.CHARACTER_MAXIMUM_LENGTH && col.CHARACTER_MAXIMUM_LENGTH > 0) {
          if (col.CHARACTER_MAXIMUM_LENGTH === -1) {
            def += '(MAX)'
          } else {
            def += `(${col.CHARACTER_MAXIMUM_LENGTH})`
          }
        }

        // 添加 IDENTITY
        if (col.IS_IDENTITY === 1) {
          def += ' IDENTITY(1,1)'
        }

        // 添加 NULL/NOT NULL
        def += col.IS_NULLABLE === 'NO' ? ' NOT NULL' : ' NULL'

        // 添加默认值
        if (col.COLUMN_DEFAULT) {
          def += ` DEFAULT ${col.COLUMN_DEFAULT}`
        }

        return def
      })

      schemaSQL += columnDefinitions.join(',\n')

      // 添加主键约束
      if (primaryKeys.length > 0) {
        const pkColumns = primaryKeys.map(pk => `[${pk.COLUMN_NAME}]`).join(', ')
        schemaSQL += `,\n  CONSTRAINT [PK_${tableName}] PRIMARY KEY CLUSTERED (${pkColumns})`
      }

      schemaSQL += `\n);\n\n`

      // 添加外键约束
      if (foreignKeys.length > 0) {
        const fkMap = new Map()
        foreignKeys.forEach(fk => {
          if (!fkMap.has(fk.FK_NAME)) {
            fkMap.set(fk.FK_NAME, {
              columns: [],
              refTable: fk.REFERENCED_TABLE_NAME,
              refColumns: [],
            })
          }
          fkMap.get(fk.FK_NAME).columns.push(fk.COLUMN_NAME)
          fkMap.get(fk.FK_NAME).refColumns.push(fk.REFERENCED_COLUMN_NAME)
        })

        fkMap.forEach((fkInfo, fkName) => {
          const columns = fkInfo.columns.map(c => `[${c}]`).join(', ')
          const refColumns = fkInfo.refColumns.map(c => `[${c}]`).join(', ')
          schemaSQL += `ALTER TABLE [${tableName}] ADD CONSTRAINT [${fkName}] `
          schemaSQL += `FOREIGN KEY (${columns}) REFERENCES [${fkInfo.refTable}] (${refColumns});\n`
        })
        schemaSQL += '\n'
      }

      // 添加索引
      if (indexes.length > 0) {
        const indexMap = new Map()
        indexes.forEach(idx => {
          if (!indexMap.has(idx.INDEX_NAME)) {
            indexMap.set(idx.INDEX_NAME, {
              isUnique: idx.IS_UNIQUE,
              columns: [],
            })
          }
          indexMap.get(idx.INDEX_NAME).columns.push(idx.COLUMN_NAME)
        })

        indexMap.forEach((idxInfo, idxName) => {
          const uniqueStr = idxInfo.isUnique ? 'UNIQUE ' : ''
          const columns = idxInfo.columns.map(c => `[${c}]`).join(', ')
          schemaSQL += `CREATE ${uniqueStr}INDEX [${idxName}] ON [${tableName}] (${columns});\n`
        })
        schemaSQL += '\n'
      }

      schemaSQL += '\n'
    }

    // 保存到文件
    const schemaPath = path.join(__dirname, 'schema.sql')
    fs.writeFileSync(schemaPath, schemaSQL, 'utf8')

    console.log(`\n✅ Schema exported successfully!`)
    console.log(`📁 File: ${schemaPath}`)
    console.log(`📊 Total tables: ${tables.length}`)

    await sequelize.close()
  } catch (error) {
    console.error('❌ Error exporting schema:', error)
    process.exit(1)
  }
}

// 执行导出
exportSchema()

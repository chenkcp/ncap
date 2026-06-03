import { Sequelize, DataTypes } from 'sequelize'
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
    logging: false,
  }
)

// SQL Server 类型映射到 Sequelize DataTypes
const typeMapping = {
  'int': 'DataTypes.INTEGER',
  'bigint': 'DataTypes.BIGINT',
  'smallint': 'DataTypes.SMALLINT',
  'tinyint': 'DataTypes.TINYINT',
  'bit': 'DataTypes.BOOLEAN',
  'decimal': 'DataTypes.DECIMAL',
  'numeric': 'DataTypes.DECIMAL',
  'money': 'DataTypes.DECIMAL(19, 4)',
  'smallmoney': 'DataTypes.DECIMAL(10, 4)',
  'float': 'DataTypes.FLOAT',
  'real': 'DataTypes.REAL',
  'datetime': 'DataTypes.DATE',
  'datetime2': 'DataTypes.DATE',
  'smalldatetime': 'DataTypes.DATE',
  'date': 'DataTypes.DATEONLY',
  'time': 'DataTypes.TIME',
  'char': 'DataTypes.CHAR',
  'varchar': 'DataTypes.STRING',
  'text': 'DataTypes.TEXT',
  'nchar': 'DataTypes.CHAR',
  'nvarchar': 'DataTypes.STRING',
  'ntext': 'DataTypes.TEXT',
  'binary': 'DataTypes.BLOB',
  'varbinary': 'DataTypes.BLOB',
  'image': 'DataTypes.BLOB',
  'uniqueidentifier': 'DataTypes.UUID',
  'xml': 'DataTypes.TEXT',
}

// 将表名转换为 PascalCase (首字母大写驼峰)
function toPascalCase(str) {
  return str
    .split(/[_-]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
}

// 将列名转换为 camelCase
function toCamelCase(str) {
  const pascal = toPascalCase(str)
  return pascal.charAt(0).toLowerCase() + pascal.slice(1)
}

// 获取 Sequelize 数据类型
function getSequelizeType(sqlType, maxLength) {
  const baseType = sqlType.toLowerCase()
  let seqType = typeMapping[baseType] || 'DataTypes.STRING'

  // 处理带长度的类型
  if ((baseType === 'varchar' || baseType === 'nvarchar' || baseType === 'char' || baseType === 'nchar') && maxLength) {
    if (maxLength === -1) {
      seqType = 'DataTypes.TEXT'
    } else {
      seqType = `${seqType}(${maxLength})`
    }
  }

  return seqType
}

// 格式化默认值
function formatDefaultValue(defaultValue, dataType) {
  if (!defaultValue) return null

  // 移除括号
  let value = defaultValue.replace(/^\(+|\)+$/g, '')

  // 处理字符串默认值
  if (value.startsWith("'") && value.endsWith("'")) {
    return value
  }

  // 处理函数
  if (value.toLowerCase().includes('getdate') || value.toLowerCase().includes('getutcdate')) {
    return 'DataTypes.NOW'
  }

  if (value.toLowerCase().includes('newid')) {
    return 'DataTypes.UUIDV4'
  }

  // 处理数字
  if (!isNaN(value)) {
    return value
  }

  // 处理布尔值
  if (value === '0' || value === '1') {
    return value
  }

  return `'${value}'`
}

// 生成 Model 文件内容
function generateModelFile(tableName, columns, primaryKeys, foreignKeys) {
  const modelName = toPascalCase(tableName)
  const camelTableName = toCamelCase(tableName)

  let content = `import { DataTypes } from 'sequelize'\n`
  content += `import { sequelize } from './index.js'\n\n`

  // 添加外键引用的模型导入
  const referencedModels = new Set()
  foreignKeys.forEach(fk => {
    if (fk.REFERENCED_TABLE_NAME !== tableName) {
      referencedModels.add(fk.REFERENCED_TABLE_NAME)
    }
  })

  if (referencedModels.size > 0) {
    content += `// Foreign key references\n`
    referencedModels.forEach(refTable => {
      const refModelName = toPascalCase(refTable)
      content += `// import ${refModelName} from './${refModelName}.js'\n`
    })
    content += `\n`
  }

  content += `/**\n`
  content += ` * ${modelName} Model\n`
  content += ` * Table: ${tableName}\n`
  content += ` */\n`
  content += `const ${modelName} = sequelize.define('${modelName}', {\n`

  // 生成列定义
  columns.forEach((col, index) => {
    const columnName = toCamelCase(col.COLUMN_NAME)
    const seqType = getSequelizeType(col.DATA_TYPE, col.CHARACTER_MAXIMUM_LENGTH)
    const isPrimaryKey = primaryKeys.some(pk => pk.COLUMN_NAME === col.COLUMN_NAME)
    const isIdentity = col.IS_IDENTITY === 1

    content += `  ${columnName}: {\n`
    content += `    type: ${seqType},\n`
    content += `    allowNull: ${col.IS_NULLABLE === 'YES'},\n`

    if (isPrimaryKey) {
      content += `    primaryKey: true,\n`
    }

    if (isIdentity) {
      content += `    autoIncrement: true,\n`
    }

    // 添加默认值
    const defaultValue = formatDefaultValue(col.COLUMN_DEFAULT, col.DATA_TYPE)
    if (defaultValue) {
      content += `    defaultValue: ${defaultValue},\n`
    }

    // 字段注释
    content += `    field: '${col.COLUMN_NAME}', // 映射到数据库列名\n`

    content += `  },\n`
  })

  content += `}, {\n`
  content += `  tableName: '${tableName}',\n`
  content += `  timestamps: true, // 启用时间戳\n`
  content += `  underscored: true, // 使用下划线命名\n`
  content += `  comment: '${tableName} 表',\n`
  content += `})\n\n`

  // 添加关联关系注释
  if (foreignKeys.length > 0) {
    content += `/**\n`
    content += ` * 关联关系定义\n`
    content += ` * 在 models/index.js 中配置以下关联:\n`
    content += ` */\n`

    const fkMap = new Map()
    foreignKeys.forEach(fk => {
      const key = `${fk.COLUMN_NAME}->${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`
      if (!fkMap.has(key)) {
        const refModelName = toPascalCase(fk.REFERENCED_TABLE_NAME)
        const columnName = toCamelCase(fk.COLUMN_NAME)
        content += `// ${modelName}.belongsTo(${refModelName}, { foreignKey: '${columnName}' })\n`
        fkMap.set(key, true)
      }
    })
    content += `\n`
  }

  content += `export default ${modelName}\n`

  return content
}

// 主函数
async function generateModels() {
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

    console.log(`📊 Found ${tables.length} tables\n`)

    // 创建 models 目录
    const modelsDir = path.join(__dirname, '../models')
    if (!fs.existsSync(modelsDir)) {
      fs.mkdirSync(modelsDir, { recursive: true })
    }

    const modelNames = []

    // 遍历每个表，生成 Model
    for (const table of tables) {
      const tableName = table.TABLE_NAME
      const modelName = toPascalCase(tableName)
      modelNames.push({ tableName, modelName })

      console.log(`  📝 Generating model: ${modelName}.js`)

      // 获取列信息
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

      // 获取主键
      const [primaryKeys] = await sequelize.query(`
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE OBJECTPROPERTY(OBJECT_ID(CONSTRAINT_SCHEMA + '.' + CONSTRAINT_NAME), 'IsPrimaryKey') = 1
        AND TABLE_NAME = '${tableName}'
      `)

      // 获取外键
      const [foreignKeys] = await sequelize.query(`
        SELECT 
          COL_NAME(fc.parent_object_id, fc.parent_column_id) AS COLUMN_NAME,
          OBJECT_NAME(fk.referenced_object_id) AS REFERENCED_TABLE_NAME,
          COL_NAME(fc.referenced_object_id, fc.referenced_column_id) AS REFERENCED_COLUMN_NAME
        FROM sys.foreign_keys AS fk
        INNER JOIN sys.foreign_key_columns AS fc ON fk.object_id = fc.constraint_object_id
        WHERE OBJECT_NAME(fk.parent_object_id) = '${tableName}'
      `)

      // 生成 Model 文件
      const modelContent = generateModelFile(tableName, columns, primaryKeys, foreignKeys)
      const modelPath = path.join(modelsDir, `${modelName}.js`)
      fs.writeFileSync(modelPath, modelContent, 'utf8')
    }

    // 生成 models/index.js
    console.log(`\n  📝 Generating models/index.js`)
    let indexContent = `import { Sequelize } from 'sequelize'\n`
    indexContent += `import env from '../config/env.js'\n\n`

    indexContent += `// 创建 Sequelize 实例\n`
    indexContent += `const sequelize = new Sequelize(\n`
    indexContent += `  env.db.database,\n`
    indexContent += `  env.db.username,\n`
    indexContent += `  env.db.password,\n`
    indexContent += `  {\n`
    indexContent += `    host: env.db.host,\n`
    indexContent += `    port: env.db.port,\n`
    indexContent += `    dialect: env.db.dialect,\n`
    indexContent += `    dialectOptions: env.db.dialectOptions,\n`
    indexContent += `    pool: env.db.pool,\n`
    indexContent += `    logging: env.db.logging,\n`
    indexContent += `    define: {\n`
    indexContent += `      timestamps: true,\n`
    indexContent += `      underscored: true,\n`
    indexContent += `      freezeTableName: true,\n`
    indexContent += `    },\n`
    indexContent += `  }\n`
    indexContent += `)\n\n`

    indexContent += `// 测试数据库连接\n`
    indexContent += `const testConnection = async () => {\n`
    indexContent += `  try {\n`
    indexContent += `    await sequelize.authenticate()\n`
    indexContent += `    console.log('✅ Database connection established successfully.')\n`
    indexContent += `  } catch (error) {\n`
    indexContent += `    console.error('❌ Unable to connect to the database:', error.message)\n`
    indexContent += `    throw error\n`
    indexContent += `  }\n`
    indexContent += `}\n\n`

    indexContent += `// 导入所有模型\n`
    modelNames.forEach(({ modelName }) => {
      indexContent += `import ${modelName} from './${modelName}.js'\n`
    })

    indexContent += `\n// 定义模型关联关系\n`
    indexContent += `// TODO: 在这里添加模型之间的关联关系\n`
    indexContent += `// 例如:\n`
    indexContent += `// User.hasMany(Post, { foreignKey: 'userId' })\n`
    indexContent += `// Post.belongsTo(User, { foreignKey: 'userId' })\n\n`

    indexContent += `// 导出\n`
    indexContent += `export {\n`
    indexContent += `  sequelize,\n`
    indexContent += `  testConnection,\n`
    modelNames.forEach(({ modelName }) => {
      indexContent += `  ${modelName},\n`
    })
    indexContent += `}\n`

    const indexPath = path.join(modelsDir, 'index.js')
    fs.writeFileSync(indexPath, indexContent, 'utf8')

    console.log(`\n✅ Models generated successfully!`)
    console.log(`📁 Directory: ${modelsDir}`)
    console.log(`📊 Total models: ${modelNames.length}`)
    console.log(`\n📋 Generated models:`)
    modelNames.forEach(({ modelName, tableName }) => {
      console.log(`   - ${modelName}.js (${tableName})`)
    })

    await sequelize.close()
  } catch (error) {
    console.error('❌ Error generating models:', error)
    process.exit(1)
  }
}

// 执行生成
generateModels()

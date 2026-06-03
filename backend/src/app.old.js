import 'dotenv/config'
import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import cors from 'koa-cors'
import router from './routes/index.js'
import { errorHandler } from './middlewares/index.js'
import { sequelize, testConnection } from './models/index.js'
import { appConfig } from './config/index.js'

const app = new Koa()

// 中间件
app.use(errorHandler)
app.use(cors())
app.use(bodyParser())

// 路由
app.use(router.routes())
app.use(router.allowedMethods())

// 启动服务
const start = async () => {
  // 测试数据库连接
  try {
    await testConnection()
    
    // 同步模型到数据库 (开发环境)
    if (appConfig.env === 'development') {
      await sequelize.sync({ alter: false })
      console.log('📦 Database models synchronized.')
    }
  } catch (error) {
    console.error('⚠️ Database connection failed, server will start without database.')
  }

  app.listen(appConfig.port, () => {
    console.log(`🚀 Server running on http://localhost:${appConfig.port}`)
    console.log(`📌 Environment: ${appConfig.env}`)
  })
}

start().catch((error) => {
  console.error('Failed to start server:', error)
  process.exit(1)
})

export default app

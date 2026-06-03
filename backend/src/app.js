import Koa from 'koa';
import cors from '@koa/cors';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import koaLogger from 'koa-logger';
import env from './config/env.js';
import sequelize from './config/databases.js';
import LotController from './controllers/LotController.js';
import HomeController from './controllers/HomeController.js';
import models from './models/index.js'

// console.log(111111111111111)

// models.Lot.findAll({
//   include: [
//     {
//       model: models.LotDefectCount,
//       as: 'defectCount',
//       required: false
//     }
//   ]
// }).then((data) => {
//   console.log("Fetched lots with defect counts:", data);
// })

global.Nextcap = null;

class NextCapRuntime {
  constructor() {
    console.log('NextCapRuntime instance created');
    this.app = new Koa();
    this.env = env;
    this.router = new Router();
    this.db = null;
    this.models = models;
  }

  setMiddleware() {
    this.app.use(cors());
    this.app.use(bodyParser());
    this.app.use(koaLogger());

    this.app.use(this.router.routes());
    this.app.use(this.router.allowedMethods());
    // for custom middleware
    // this.app.use(async (ctx, next) => {
    //     console.log(`Request Method: ${ctx.method}, Request URL: ${ctx.url}`);
    //     await next();
    // });
  }

  setRouter() {
    this.router.get("/home/getData", async (ctx, next) => {
      const controller = new HomeController(ctx, next);
      await controller.getData();
    });

    this.router.get("/lots", async (ctx, next) => {
      console.log("111111")
      const controller = new LotController(ctx, next);
      await controller.getLots();
    });

    this.app.use(this.router.routes()).use(this.router.allowedMethods());
  }

  setDb(){
    // const dbConfig = this.env.db
    // this.db = new Sequelize(this.env.database, this.env.username, this.env.password, dbConfig);
    this.db = sequelize;
  }

  // setModels() {
  //   // this.models = models;
  //   this.db = this.models.sequelize;
  // }

  async testDb(){
    // console.log("Testing database connection...", this.db);
    try {
      await this.db.authenticate();
      return true;
    } catch (error) {
      return false;
    }
  }

  globalModels(){
    global.Accumulator = this.models.Accumulator;
    global.ClientCustomer = this.models.ClientCustomer;
    global.ClientType = this.models.ClientType;
    global.DefectClass = this.models.DefectClass;
    global.LevelOneDescrip = this.models.LevelOneDescrip;
    global.LevelTwoDescrip = this.models.LevelTwoDescrip;
    global.LineType = this.models.LineType;
    global.Lot = this.models.Lot;
    global.LotDefectCount = this.models.LotDefectCount;
    global.LotComment = this.models.LotComment;
    global.Pen = this.models.Pen;
    global.PenDefect = this.models.PenDefect;
    global.PhysicalLine = this.models.PhysicalLine;
    global.Product = this.models.Product;
    global.ProductType = this.models.ProductType;
    global.RunType = this.models.RunType;
    global.Shift = this.models.Shift;
    global.Station = this.models.Station;
    global.StationUser = this.models.StationUser;
    global.RuntimeValue = this.models.RuntimeValue;
    // global.Csb = this.models.Csb;
    global.ProductRefLlk = this.models.ProductRefLlk;
    global.PenParametric = this.models.PenParametric;
  }

  start() {
    // response
    // this.app.use(ctx => {
    //   console.log(`Request Method: ${ctx.method}, Request URL: ${ctx.url}, Request: ${JSON.stringify(ctx.request)}`);
    //   ctx.body = 'Hello Koa';
    // });

    this.app.listen(this.env.port, () => {
      console.log(`Server is running on http://localhost:${this.env.port}`);
    });
  }

  static async run() {
    if (!global.Nextcap) {
      global.Nextcap = new NextCapRuntime();
    }
    // global.Nextcap.setModels();
    global.Nextcap.setDb();
    const result = await global.Nextcap.testDb();
    if (result) {
      console.log('Database connection established successfully');
    } else {
      console.error('Database connection failed');
      process.exit(1);
      return;
    }

    global.Nextcap.setMiddleware();
    global.Nextcap.setRouter();
    global.Nextcap.globalModels();
    global.Nextcap.start();
    console.log('NextCapRuntime is running...');
  }
}

NextCapRuntime.run().then(() => {
  console.log("NextCapRuntime has started successfully");
}).catch((error) => {
  console.error("Error starting NextCapRuntime:", error);
});




import { Op } from 'sequelize';
import LevelOneDescrip from '../models/LevelOneDescrip.js';
import BaseController from './_BaseController.js'
// import RuntimeValue from '../models/RuntimeValue.js';
// import Pen from '../models/Pen.js'
// import PenDefect from '../models/PenDefect.js'

class HomeController extends BaseController {
    async getData() {
        let resp = await this.checkClient();
        if (!resp) return;
        const {clientName, lineType, lineNumber, source} = this.clientCustomer;
        const clientCustomers = await ClientCustomer.findAll({
            where: { clientName: clientName }
        });
        console.log("info:", lineType, lineNumber, source)
        // join lotDefectCount 使用 lotId 对应 lotId
        const lots = await Lot.findAll({
            where: { lineType, lineNumber, source },
            order: [['birthday', 'ASC']],
            limit: 15
        });

        const lotIds = lots.map(lot => lot.lotId);

        const lotDefectCounts = await LotDefectCount.findAll({
            where: {lineType, lineNumber, source, lotId: lotIds}

        });

        const lotComments = await LotComment.findAll({
            where: {lineType, lineNumber, source, lotId: lotIds}
        });

        const pens = await Pen.findAll({
            where: { lineType, lineNumber, source, lotId: lotIds}
        });

        const penIds = pens.map(pen => pen.penId);

        const lineTypes = await LineType.findAll({
            attributes: ['lineType']
        });

        const penDefects = await PenDefect.findAll({
            where: {lineType, lineNumber, source, penId: penIds}
        });

        const defectClasses = await DefectClass.findAll({
            where: {lineType, lineNumber, source},
            attributes: ['itemType', 'className']
        });

        const products = await Product.findAll({
            where: {lineType, lineNumber, source}, 
            attributes: ['productName','productNumber', 'productType']
        });

        const productionTypes = await ProductType.findAll({
            attributes: ['productType']
        });

        const shifts = await Shift.findAll({
            attributes: ['shift']
        });

        const runTypes = await RunType.findAll({
            where: {lineType, lineNumber, source}, 
            attributes: ['runType']
        });

        const accumulators = await Accumulator.findAll({
            where: {lineType, lineNumber, source},
            attributes: ['accumulator']
        });

        const levelOneDescriptions = await LevelOneDescrip.findAll({
            where: {lineType, lineNumber, source},
            attributes: ['code1','className','description1'],
            order: [['order1','DESC']]
        });
        const descCode1s = levelOneDescriptions.map(desc => desc.code1);
        const levelTwoDescriptions = await LevelTwoDescrip.findAll({
            where: {lineType, lineNumber, source, code1: descCode1s},
            attributes: ['code1','code2','description2'],
            order: [['order2','DESC']]
        });
        const stations = await Station.findAll({
            where: {lineType, lineNumber},
            attributes: ['source']
        })
        const stationUsers = await StationUser.findAll({
            where: {lineType, lineNumber, source}
        });
        const physicalLines = await PhysicalLine.findAll({
            where: {lineType},
            attributes: ['lineNumber']
        });
        const runtimeValues = await RuntimeValue.findAll({
            where: {serverName: clientName}
        });

        // find all csbs csbType in ["CreateLot", "PreCreateLot", "VerifyPenid", "ProductMonitor"]
        // const csbs = await Csb.findAll({
        //     where: {csbType: ["CreateLot", "PreCreateLot", "VerifyPenid", "ProductMonitor"]}
        // });

        const productRefLlks = await ProductRefLlk.findAll({
            attributes: ["invItemLkNr", "productNm", "lotidCd","midCd", "lotidCd", "picaCd", "prodGenCd", "weightLsl", "weightUsl"]
        });

        let penParametrics = [];
        try {
            penParametrics = await PenParametric.findAll({where: {pnId: penIds}});
        } catch (error) {
            console.error("Error fetching pen parametrics:", error);
        }

        this.renderJson({
            clientCustomers,
            lots, 
            lotDefectCounts, 
            lotComments, 
            stations,
            stationUsers,
            pens,
            penDefects,
            lineTypes,
            defectClasses, 
            products, 
            productionTypes, 
            shifts,
            runTypes, 
            accumulators, 
            levelOneDescriptions, 
            levelTwoDescriptions,
            physicalLines,
            runtimeValues,
            // csbs,
            productRefLlks,
            penParametrics
        });
    }
}

export default HomeController;
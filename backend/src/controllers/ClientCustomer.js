import BaseController from './_BaseController.js'

class ClientCustomer extends BaseController {
    // Step1: check the client with below params
    // Match: Machine Name + Site + Line Type + Line Number + Source in DB
    // if dont exist then return 
    async checkClient() {
        const {clientName, lineType, lineNumber, source} = this.query;
        const lots = await Lots.findAll({clientName})
        // console.log("Retrieved lots:", lots[0].lineType)
        // Handle GET /lots request
        this.ctx.body = { message: `List of lots ${lots[0].lineType}` };
        return this.next();
    }
}

export default ClientCustomer;
// import ClientCustomer from '../models/ClientCustomer.js';
// import Lot from '../models/Lot.js'

class BaseController {
    constructor(ctx, next) {
        this.ctx = ctx;
        this.params = ctx.params
        this.query = ctx.query
        this.body = ctx.body
        this.headers = ctx.headers
        this.next = next;
    }

    // Common method to handle errors
    handleError(errorMessage) {
        this.ctx.status = 200;
        this.ctx.body = { resp: "error", message: errorMessage };
        return this.next();
    }

    // Common method to handle successful responses
    renderJson(data) {
        this.ctx.status = 200;
        this.ctx.body = { resp: "success", data: data };
        return this.next();
    }

    // check if the client exists
    async checkClient() {
        const credentials = this.headers['x-client-credentials'];
        if (!credentials) {
            this.handleError("Missing client credentials");
            return false;
        }
        const credentialsArr = credentials.split("|")
        let clientName, lineType, lineNumber, source;
        if (credentials.length < 4) {
            clientName = credentialsArr[0];
        } else {
            [clientName, lineType, lineNumber, source] = credentialsArr;
        }
        if (!clientName) {
            this.handleError("Missing clientName");
            return false;
        }
        if (lineType && lineNumber && source) {
            const clientCustomer = await ClientCustomer.findOne({ where: { clientName, lineType, lineNumber, source } });
            if (!clientCustomer){
                const clientCustomers = await ClientCustomer.findAll({ where: { clientName: clientName } });
                if (clientCustomers && clientCustomers.length > 0) {
                    this.renderJson({clientCustomers: clientCustomers, needToSelectClientCustomers: true});
                    return false
                } else {
                    this.handleError("No client Customers found");
                    return false
                }
            }
             this.clientCustomer = clientCustomer;
            return true
        } else {
            const clientCustomers = await ClientCustomer.findAll({ where: { clientName: clientName } });
            if (clientCustomers && clientCustomers.length > 0) {
                this.renderJson({clientCustomers: clientCustomers, needToSelectClientCustomers: true});
                return false
            } else {
                this.handleError("No client Customers found");
                return false
            }
        }
    }
}

export default BaseController
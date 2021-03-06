"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const http = __importStar(require("http"));
const ws_1 = __importDefault(require("ws"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const vscode = __importStar(require("vscode"));
const utils_1 = require("../utils/utils");
class Server {
    constructor(extension) {
        this.extension = extension;
        this.httpServer = http.createServer((request, response) => this.handler(request, response));
        const configuration = vscode.workspace.getConfiguration('latex-workshop');
        const viewerPort = 19191;
        this.httpServer.listen(viewerPort, '0.0.0.0', undefined, () => {
            const { address, port } = this.httpServer.address();
            this.port = port;
            if (address.includes(':')) {
                // the colon is reserved in URL to separate IPv4 address from port number. IPv6 address needs to be enclosed in square brackets when used in URL
                this.address = `[${address}]:${port}`;
            }
            else {
                this.address = `${address}:${port}`;
            }
            this.extension.logger.addLogMessage(`Server created on ${this.address}`);
        });
        this.httpServer.on('error', (err) => {
            this.extension.logger.addLogMessage(`Error creating LaTeX Workshop http server: ${err}.`);
        });
        this.wsServer = new ws_1.default.Server({ server: this.httpServer });
        this.wsServer.on('connection', (websocket) => {
            websocket.on('message', (msg) => this.extension.viewer.handler(websocket, msg));
            websocket.on('error', () => this.extension.logger.addLogMessage('Error on WebSocket connection.'));
        });
        this.extension.logger.addLogMessage('Creating LaTeX Workshop http and websocket server.');
    }
    handler(request, response) {
        if (!request.url) {
            return;
        }
        if (request.url.includes(utils_1.pdfFilePrefix) && !request.url.includes('viewer.html')) {
            const s = request.url.replace('/', '');
            const fileName = utils_1.decodePathWithPrefix(s);
            if (this.extension.viewer.getClients(fileName) === undefined) {
                this.extension.logger.addLogMessage(`Invalid PDF request: ${fileName}`);
                return;
            }
            try {
                const pdfSize = fs.statSync(fileName).size;
                response.writeHead(200, { 'Content-Type': 'application/pdf', 'Content-Length': pdfSize });
                fs.createReadStream(fileName).pipe(response);
                this.extension.logger.addLogMessage(`Preview PDF file: ${fileName}`);
            }
            catch (e) {
                this.extension.logger.addLogMessage(`Error reading PDF file: ${fileName}`);
                if (e instanceof Error) {
                    this.extension.logger.logError(e);
                }
                response.writeHead(404);
                response.end();
            }
            return;
        }
        else {
            let root;
            if (request.url.startsWith('/build/') || request.url.startsWith('/cmaps/')) {
                root = path.resolve(`${this.extension.extensionRoot}/node_modules/pdfjs-dist`);
            }
            else if (request.url.startsWith('/out/viewer/') || request.url.startsWith('/viewer/')) {
                // For requests to /out/viewer/*.js and requests to /viewer/*.ts.
                // The latter is for debugging with sourcemap.
                root = path.resolve(this.extension.extensionRoot);
            }
            else {
                root = path.resolve(`${this.extension.extensionRoot}/viewer`);
            }
            const reqFileName = path.posix.resolve('/', request.url.split('?')[0]);
            const fileName = path.resolve(root, '.' + reqFileName);
            let contentType = 'text/html';
            switch (path.extname(fileName)) {
                case '.js':
                    contentType = 'text/javascript';
                    break;
                case '.css':
                    contentType = 'text/css';
                    break;
                case '.json':
                    contentType = 'application/json';
                    break;
                case '.png':
                    contentType = 'image/png';
                    break;
                case '.jpg':
                    contentType = 'image/jpg';
                    break;
                case '.svg':
                    contentType = 'image/svg+xml';
                    break;
                case '.ico':
                    contentType = 'image/x-icon';
                    break;
                default:
                    break;
            }
            fs.readFile(fileName, (err, content) => {
                if (err) {
                    if (err.code === 'ENOENT') {
                        response.writeHead(404);
                    }
                    else {
                        response.writeHead(500);
                    }
                    response.end();
                }
                else {
                    response.writeHead(200, { 'Content-Type': contentType });
                    response.end(content, 'utf-8');
                }
            });
        }
    }
}
exports.Server = Server;
//# sourceMappingURL=server.js.map
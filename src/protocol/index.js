const { randomUUID } = require('crypto');
const { defer } = require('./defer');

const FORMAT_REQUEST = 'FORMAT_REQUEST';
const FORMAT_RESPONSE = 'FORMAT_RESPONSE';

function buildProtocol(process) {
    const handlersByMessageType = {};
    const deferredById = {};

    const builder = {
        sendFormatRequest(fileName, code) {
            const id = randomUUID();
            const deferred = defer();

            deferredById[id] = deferred;
            process.send([FORMAT_REQUEST, id, fileName, code]);

            return deferred.promise;
        },
        sendFormatResponse(id, formattedCode) {
            process.send([FORMAT_RESPONSE, id, formattedCode]);
        },
        onFormatRequest(handler) {
            handlersByMessageType[FORMAT_REQUEST] = handler;
            return builder;
        },
        onFormatResponse(handler) {
            handlersByMessageType[FORMAT_RESPONSE] = handler;
            return builder;
        },
        subscribe() {
            process.on('message', message => {
                const [type, id, ...payload] = message;
                const handler = handlersByMessageType[type];

                if (handler) {
                    handler([id, ...payload]);
                }

                const deferred = deferredById[id];

                if (deferred) {
                    deferred.resolve(payload);
                    delete deferredById[id];
                }
            });

            return builder;
        }
    };

    return builder;
}

module.exports = { buildProtocol };
import { ChildProcess } from 'child_process';
import { randomUUID } from 'crypto';
import { defer, Deferred } from './defer';

enum MessageType {
    FORMAT_REQUEST = 'FORMAT_REQUEST',
    FORMAT_RESPONSE = 'FORMAT_RESPONSE',
    ERROR = 'ERROR'
}

export type Args<T extends number, U extends string[] = []> = U['length'] extends T
    ? U
    : Args<T, [...U, string]>;

type ArgsByMessageType = {
    [MessageType.FORMAT_REQUEST]: Args<3>;
    [MessageType.FORMAT_RESPONSE]: Args<2>;
    [MessageType.ERROR]: Args<2>;
};

type Handler<T extends MessageType> = (args: ArgsByMessageType[T]) => void;

export function buildProtocol(process: NodeJS.Process | ChildProcess) {
    const handlersByMessageType: Record<string, Function> = {};
    const deferredById: Record<string, Deferred<string[]>> = {};

    function send<T extends MessageType>(message: [type: T, ...payload: ArgsByMessageType[T]]) {
        process.send?.(message);
    }

    const builder = {
        sendFormatRequest(fileName: string, code: string) {
            const id = randomUUID();
            const deferred = defer<string[]>();

            deferredById[id] = deferred;
            send([MessageType.FORMAT_REQUEST, id, fileName, code]);

            return deferred.promise as Promise<[string]>;
        },
        sendFormatResponse(id: string, formattedCode: string) {
            send([MessageType.FORMAT_RESPONSE, id, formattedCode]);
        },
        sendError(error: Error) {
            const payload = error.stack || JSON.stringify(error, Object.getOwnPropertyNames(error));
            send([MessageType.ERROR, randomUUID(), payload]);
        },
        onFormatRequest(handler: Handler<MessageType.FORMAT_REQUEST>) {
            handlersByMessageType[MessageType.FORMAT_REQUEST] = handler;
            return builder;
        },
        onFormatResponse(handler: Handler<MessageType.FORMAT_RESPONSE>) {
            handlersByMessageType[MessageType.FORMAT_RESPONSE] = handler;
            return builder;
        },
        onError(handler: Handler<MessageType.ERROR>) {
            handlersByMessageType[MessageType.ERROR] = handler;
            return builder;
        },
        runAsync<T>(callback: () => Promise<T>) {
            return callback()
                .catch((error: Error) => {
                    this.sendError(error);
                    return Promise.reject(error);
                });
        },
        subscribe() {
            process.on('message', (message: string[]) => {
                const [type, id, ...payload] = message;

                if (!type || !id) {
                    throw new Error(`Type and id are required in every protocol message!`);
                }

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
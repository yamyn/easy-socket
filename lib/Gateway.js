const CommonEmiteds = require('./Common.emiteds');
const Validator = require('./Validator');

class Gateway {
    static _instances = {};

    constructor(name) {
        if (Gateway._instances[name]) return Gateway._instances[name];

        this._name = name;
        this._listeners = {};
        this._uploadListeners = {};

        Gateway._instances[name] = this;
    }

    addListener(event, listener) {
        this._listeners[event] = listener;

        const helpOpt = {
            validate: schema => {
                const oldListener = this._listeners[event];
                this._listeners[event] = async (ctx, data) => {
                    const validatedData = await Validator.validate(
                        schema,
                        data,
                    );

                    return oldListener(ctx, validatedData);
                };

                return helpOpt;
            },

            addMiddleware: middleware => {
                const oldListener = this._listeners[event];

                this._listeners[event] = async (ctx, data) => {
                    const transformedData = await middleware(ctx, data, event);

                    return oldListener(ctx, transformedData);
                };

                return helpOpt;
            },
        };

        return helpOpt;
    }

    addFileListener(type, listener) {
        this._uploadListeners[type] = listener;
    }

    initListeners(ctx, socketConfig, options = {}) {
        const { socket, isAuthenticated, uploader, authError } = ctx;

        if (options.protected && !isAuthenticated) {
            return CommonEmiteds.sendAuthError(socket, authError);
        }

        const uplListenersTypes = Object.keys(this._uploadListeners);

        if (uploader) {
            uploader.on('saved', event => {
                const { type } = event.file.meta;
                const uploadListenerType = uplListenersTypes.find(
                    listenerType => listenerType === type,
                );

                if (uploadListenerType) {
                    this._uploadListeners[uploadListenerType](ctx, event.file);
                }
            });
        }

        Object.keys(this._listeners).forEach(event => {
            socket.on(this.getEventName(event), async (data, callback) => {
                try {
                    const res = await this._listeners[event](ctx, data);

                    callback({ data: res });
                } catch (error) {
                    socketConfig.interceptor(error);
                }
            });
        });
    }

    getEventName(event) {
        return `${this._name}/${event}`;
    }
}

module.exports = Gateway;

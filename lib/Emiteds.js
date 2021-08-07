class Emiteds {
    constructor(name) {
        this._name = name;
    }

    addPrefix(event) {
        return `${this._name}/${event}`;
    }

    getEmit(event, message) {
        return emitter => this.emit(emitter, event, message);
    }

    emit(emitter, event, message) {
        return emitter.emit(`${this._name}/${event}`, message);
    }
}
module.exports = Emiteds;

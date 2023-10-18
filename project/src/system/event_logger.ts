import { GameEvent, type MessageBus } from "./event";

class EventLogger {
    private messageBus: MessageBus;

    constructor(messageBus: MessageBus) {
        this.messageBus = messageBus;
        this.messageBus.on(GameEvent.ToLife, () => {
            console.log("ToLife");
        });
    }

};

enum ResultType {
    PASS,
    STOP,
    ROLLBACK,
}

interface PassResult {
    type: ResultType.PASS;
    name?: string;
}

interface AbortResult {
    type: ResultType.STOP | ResultType.ROLLBACK;
}

type EventResult = PassResult | AbortResult;

type LichAction<T> = (owner: T) => Promise<void>;

interface LichEvent<Params, Owner> {
    params: Params;
    owner: Owner;
    addAction: (action: LichAction<Owner>) => void;
    pass: (name?: string) => PassResult;
    stop: () => AbortResult;
    rollback: () => AbortResult;
}

interface LichGuildEvent<Params, Owner> extends LichEvent<Params, Owner> {
    actionList: LichAction<Owner>[];
}

type LichEventCallback<Params, Owner> = (
    event: LichEvent<Params, Owner>
) => EventResult;

class Lich<Params, EventOwner> {
    constructor(
        readonly name: string,
        readonly execute: LichEventCallback<Params, EventOwner>
    ) {}

    previous: Lich<Params, EventOwner> | undefined;
    following = new Map<string, Lich<Params, EventOwner>>();
    firstFollowing: Lich<Params, EventOwner> | undefined;

    parent: Lich<Params, EventOwner> | undefined;
    children = new Map<string, Lich<Params, EventOwner>>();
    firstChild: Lich<Params, EventOwner> | undefined;

    onEvent(event: LichGuildEvent<Params, EventOwner>): EventResult {
        let result = this.firstChild?.onEvent(event) ?? event.pass();
        if (result.type === ResultType.PASS) {
            result = this.execute(event);
        }

        if (result.type === ResultType.PASS) {
            if (result.name) {
                result =
                    this.following.get(result.name)?.onEvent(event) ??
                    event.pass();
            } else {
                result = this.firstFollowing?.onEvent(event) ?? event.pass();
            }
        }
        return result;
    }
}

type LichParams<Params, Owner> = {
    name: string;
    execute: LichEventCallback<Params, Owner>;
};

export class LichGuild<Params, EventOwner> {
    private liches = new Map<string, Lich<Params, EventOwner>>();
    readonly rootLich: Lich<Params, EventOwner>;

    constructor(rootLich: LichParams<Params, EventOwner>) {
        this.rootLich = new Lich(rootLich.name, rootLich.execute);
        this.liches.set(rootLich.name, this.rootLich);
    }

    addFollowing(lichName: string, following: LichParams<Params, EventOwner>) {
        const lich = this.liches.get(lichName);
        if (!lich) {
            throw new Error(`lich ${lichName} not found`);
        }

        const followingLich = new Lich(following.name, following.execute);

        lich.following.set(following.name, followingLich);
        lich.firstFollowing ??= followingLich;
        followingLich.previous = lich;
        followingLich.parent = lich.parent;
        lich.parent?.children.set(following.name, followingLich);
    }

    addChild(lichName: string, child: LichParams<Params, EventOwner>) {
        const lich = this.liches.get(lichName);
        if (!lich) {
            throw new Error(`lich ${lichName} not found`);
        }

        const childLich = new Lich(child.name, child.execute);

        lich.children.set(child.name, childLich);
        if (lich.firstChild) {
            lich.firstChild.previous = childLich;
            childLich.following.set(lich.firstChild.name, lich.firstChild);
            childLich.firstFollowing ??= lich.firstChild;
        }
        lich.firstChild = childLich;
        childLich.parent = lich;
    }

    async onEvent(params: Params, eventOwner: EventOwner) {
        const actionList: LichAction<EventOwner>[] = [];
        const result = this.rootLich.onEvent({
            params,
            owner: eventOwner,
            actionList,
            addAction: (action) => actionList.push(action),
            pass: (name) => ({ type: ResultType.PASS, name }),
            stop: () => ({ type: ResultType.STOP }),
            rollback: () => ({ type: ResultType.ROLLBACK }),
        });
        if (result.type != ResultType.ROLLBACK) {
            for (const action of actionList) {
                await action(eventOwner);
            }
        }
    }
}

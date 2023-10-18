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

interface LichEvent<P, O> {
    params: P;
    owner: O;
    addAction: (action: LichAction<O>) => void;
    pass: (name?: string) => PassResult;
    stop: () => AbortResult;
    rollback: () => AbortResult;
}

interface LichGuildEvent<P, O> extends LichEvent<P, O> {
    actionList: LichAction<O>[];
}

type LichEventCallback<P, O> = (event: LichEvent<P, O>) => EventResult;

const IsLich = Symbol('IsLich');

type LichParams<Params, Owner> = {
    name: string;
    execute: LichEventCallback<Params, Owner>;
    [IsLich]?: undefined;
};

class Lich<P, O> {
    constructor(
        readonly name: string,
        readonly execute: LichEventCallback<P, O>
    ) {}

    [IsLich] = true;

    previous: Lich<P, O> | undefined;
    following = new Map<string, Lich<P, O>>();
    firstFollowing: Lich<P, O> | undefined;

    parent: Lich<P, O> | undefined;
    children = new Map<string, Lich<P, O>>();
    firstChild: Lich<P, O> | undefined;

    onEvent(event: LichGuildEvent<P, O>): EventResult {
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

    addFollowing(lich: LichParams<P, O>) {
        const followingLich = new Lich(lich.name, lich.execute);

        this.following.set(lich.name, followingLich);
        this.firstFollowing ??= followingLich;
        followingLich.previous = this;
        followingLich.parent = this.parent;
        this.parent?.children.set(lich.name, followingLich);

        return followingLich;
    }

    addChild(lich: LichParams<P, O>) {
        const childLich = new Lich(lich.name, lich.execute);

        this.children.set(lich.name, childLich);
        if (this.firstChild) {
            this.firstChild.previous = childLich;
            childLich.following.set(this.firstChild.name, this.firstChild);
            childLich.firstFollowing ??= this.firstChild;
        }
        this.firstChild = childLich;
        childLich.parent = this;

        return childLich;
    }
}

/**
 * LichGuild类 - 死灵法师协会
 *
 * 死灵法师协会负责管理所有死灵法师，以及把事件传递给死灵大法师(rootLich)。
 * 死灵法师协会中，死灵大法师首先接收到事件，然后先把事件传给自己的每个子节点，再执行自己的事件处理函数，最后把事件传给自己的后继（如果有的话）。
 * 创建死灵法师协会时，需要传入死灵大法师。
 * 注意，和死灵法师协会有关的方法中，传入的死灵法师都不是Lich对象，而是LichParams对象。这防止一个Lich递归调用自己。
 *
 * 注意addChild函数的特殊行为：它把新的死灵法师插入到子节点列表的最前面，而不是最后面。
 * TODO: 在Entity中，定义发送事件的方法，它调用LichGuild的onEvent方法。
 */
export class LichGuild<P, O> {
    private liches = new Map<string, Lich<P, O>>();
    readonly rootLich: Lich<P, O>;

    constructor(rootLich: LichParams<P, O>) {
        this.rootLich = new Lich(rootLich.name, rootLich.execute);
        this.liches.set(rootLich.name, this.rootLich);
    }

    addFollowing(lichName: string, following: LichParams<P, O>): Lich<P, O>;
    addFollowing(following: LichParams<P, O>): Lich<P, O>;

    addFollowing(p1: string | LichParams<P, O>, p2?: LichParams<P, O>) {
        let lich: Lich<P, O>, following: Lich<P, O>;
        if (typeof p1 === 'string') {
            lich = this.liches.get(p1)!;
            if (!lich) {
                throw new Error(`lich ${p1} not found`);
            }
            following = new Lich(p2!.name, p2!.execute);
        } else {
            lich = this.rootLich;
            following = new Lich(p1.name, p1.execute);
        }

        lich.following.set(following.name, following);
        lich.firstFollowing ??= following;
        following.previous = lich;
        following.parent = lich.parent;
        lich.parent?.children.set(following.name, following);

        return following;
    }

    addChild(lichName: string, child: LichParams<P, O>): Lich<P, O>;
    addChild(child: LichParams<P, O>): Lich<P, O>;

    addChild(p1: string | LichParams<P, O>, p2?: LichParams<P, O>) {
        let lich: Lich<P, O>, child: Lich<P, O>;
        if (typeof p1 === 'string') {
            lich = this.liches.get(p1)!;
            if (!lich) {
                throw new Error(`lich ${p1} not found`);
            }
            child = new Lich(p2!.name, p2!.execute);
        } else {
            lich = this.rootLich;
            child = new Lich(p1.name, p1.execute);
        }

        lich.children.set(child.name, child);
        if (lich.firstChild) {
            lich.firstChild.previous = child;
            child.following.set(lich.firstChild.name, lich.firstChild);
            child.firstFollowing ??= lich.firstChild;
        }
        lich.firstChild = child;
        child.parent = lich;

        return child;
    }

    async onEvent(params: P, eventOwner: O) {
        const actionList: LichAction<O>[] = [];
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
        return result.type;
    }
}

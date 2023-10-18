type LichEvent = any;

// `Lich`
//
//   TriggerLich following....
//      children following....
//
// 1, TriggerLich passes event to the first children
// 2. after the last child executed, Trigger Lich is executed.
// 3. Continue -> execute following with specific parameter
class Lich {
    constructor(readonly name: string) {}

    previous: Lich | undefined;
    readonly following = new Map<string, Lich>();
    readonly children = new Map<string, Lich>();
    firstChild: Lich | undefined;
    parent: Lich | undefined;

    execute(event: LichEvent, )
}

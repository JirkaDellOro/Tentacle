declare namespace Script {
}
declare namespace Script {
    import ƒ = FudgeCore;
    class Segment extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        constructor();
        hndEvent: (_event: Event) => void;
        grow(_nSegments: number, _graph: ƒ.Graph): Promise<void>;
        twist(_rotZ: number): void;
    }
}

declare namespace Script {
}
declare namespace Script {
    import ƒ = FudgeCore;
    class Segment extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        protected iSegment: number;
        constructor();
        hndEvent: (_event: Event) => void;
        grow(_nSegments: number, _graph: ƒ.Graph, _iSegment?: number): Promise<void>;
        twist(_rotZ: number, _startSegment?: number): void;
    }
}

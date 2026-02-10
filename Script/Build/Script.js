"use strict";
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Debug.info("Main Program Template running!");
    let viewport;
    document.addEventListener("interactiveViewportStarted", start);
    let tentacle;
    let rotCurrent = 0;
    let rotTarget = 0;
    async function start(_event) {
        viewport = _event.detail;
        let segment = await ƒ.Project.getResourcesByName("Segment")[0];
        tentacle = await ƒ.Project.createGraphInstance(segment);
        tentacle.getComponent(Script.Segment).grow(16, segment);
        viewport.getBranch().addChild(tentacle);
        ƒ.Loop.addEventListener("loopFrame" /* ƒ.EVENT.LOOP_FRAME */, update);
        ƒ.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
    }
    function update(_event) {
        // ƒ.Physics.simulate();  // if physics is included and used
        let rot = (rotTarget - rotCurrent) / 10;
        rotCurrent += rot;
        if (Math.abs(rotTarget - rotCurrent) < 1)
            rotTarget = ƒ.random.getRange(-40, 40);
        tentacle.getComponent(Script.Segment).twist(rotCurrent);
        viewport.draw();
        ƒ.AudioManager.default.update();
    }
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    class Segment extends ƒ.ComponentScript {
        // Register the script as component for use in the editor via drag&drop
        static { this.iSubclass = ƒ.Component.registerSubclass(Segment); }
        constructor() {
            super();
            // Activate the functions of this component as response to events
            this.hndEvent = (_event) => {
                switch (_event.type) {
                    case "componentAdd" /* ƒ.EVENT.COMPONENT_ADD */:
                        break;
                    case "componentRemove" /* ƒ.EVENT.COMPONENT_REMOVE */:
                        this.removeEventListener("componentAdd" /* ƒ.EVENT.COMPONENT_ADD */, this.hndEvent);
                        this.removeEventListener("componentRemove" /* ƒ.EVENT.COMPONENT_REMOVE */, this.hndEvent);
                        break;
                    case "nodeDeserialized" /* ƒ.EVENT.NODE_DESERIALIZED */:
                        // if deserialized the node is now fully reconstructed and access to all its components and children is possible
                        break;
                }
            };
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            // Listen to this component being added to or removed from a node
            this.addEventListener("componentAdd" /* ƒ.EVENT.COMPONENT_ADD */, this.hndEvent);
            this.addEventListener("componentRemove" /* ƒ.EVENT.COMPONENT_REMOVE */, this.hndEvent);
            this.addEventListener("nodeDeserialized" /* ƒ.EVENT.NODE_DESERIALIZED */, this.hndEvent);
        }
        async grow(_nSegments, _graph) {
            let next = await ƒ.Project.createGraphInstance(_graph);
            // console.log(next);
            this.node.getChildByName("Cap").addChild(next);
            next.mtxLocal.scale(ƒ.Vector3.ONE(1));
            next.mtxLocal.rotateZ(0);
            _nSegments--;
            if (_nSegments < 1)
                return;
            next.getComponent(Segment).grow(_nSegments, _graph);
        }
        twist(_rotZ) {
            this.node.mtxLocal.rotation = ƒ.Vector3.Z(_rotZ);
            let next = this.node.getChildByName("Cap").getChild(0);
            if (next)
                next.getComponent(Segment).twist(_rotZ);
        }
    }
    Script.Segment = Segment;
})(Script || (Script = {}));
//# sourceMappingURL=Script.js.map
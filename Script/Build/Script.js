"use strict";
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    let viewport;
    document.addEventListener("interactiveViewportStarted", start);
    let inverseTip;
    let forwardBase;
    const twists = [{ current: 0, target: 0 }, { current: 0, target: 0 }, { current: 0, target: 0 }];
    const segments = 15;
    let partition = 5;
    async function start(_event) {
        viewport = _event.detail;
        viewport.camera.mtxPivot.translateZ(15);
        viewport.camera.mtxPivot.translateY(3);
        viewport.camera.mtxPivot.translateX(-1);
        viewport.camera.mtxPivot.rotateY(180);
        // setup inverse kinematic
        let phySegment = ƒ.Project.getResourcesByName("Physegment")[0];
        let prev;
        let scale = 1;
        let anchorLength = 1 / 0.9;
        let yPos = 0;
        for (let i = 0; i < 17; i++) {
            let segment = await ƒ.Project.createGraphInstance(phySegment);
            let body = segment.getComponent(ƒ.ComponentRigidbody);
            segment.mtxLocal.translateX(-2);
            segment.mtxLocal.translateY(yPos);
            segment.mtxLocal.scale(ƒ.Vector3.ONE(scale));
            for (let child of segment.getChildren())
                child.getComponent(ƒ.ComponentMaterial).activate(true);
            ƒ.Physics.adjustTransforms(segment);
            if (prev) {
                let joint = prev.getComponent(ƒ.JointRevolute);
                console.log(joint);
                joint.anchor = ƒ.Vector3.Y(anchorLength); //*yOffset);
                joint.bodyAnchor = prev.getComponent(ƒ.ComponentRigidbody);
                joint.bodyTied = body;
            }
            else
                body.typeBody = ƒ.BODY_TYPE.KINEMATIC;
            viewport.getBranch().addChild(segment);
            yPos += scale;
            scale *= 0.9;
            anchorLength *= 0.9;
            prev = segment;
        }
        inverseTip = prev;
        // viewport.physicsDebugMode = ƒ.PHYSICS_DEBUGMODE.JOINTS_AND_COLLIDER; 
        // setup forward kinematic
        let segment = ƒ.Project.getResourcesByName("Segment")[0];
        forwardBase = await ƒ.Project.createGraphInstance(segment);
        forwardBase.getComponent(Script.Segment).grow(16, segment);
        viewport.getBranch().addChild(forwardBase);
        viewport.canvas.addEventListener("mousemove", hndMouse);
        viewport.canvas.addEventListener("wheel", hndMouse);
        ƒ.Loop.addEventListener("loopFrame" /* ƒ.EVENT.LOOP_FRAME */, update);
        ƒ.Loop.start();
    }
    function hndMouse(_event) {
        switch (_event.type) {
            case "mousemove":
                if (_event.ctrlKey) {
                    let ray = viewport.getRayFromClient(new ƒ.Vector2(_event.clientX, _event.clientY));
                    let force = ray.intersectPlane(ƒ.Vector3.ZERO(), ƒ.Vector3.Z());
                    force = force.subtract(inverseTip.mtxLocal.translation);
                    let posForce = ƒ.Vector3.Y().transform(inverseTip.mtxWorld);
                    inverseTip.getComponent(ƒ.ComponentRigidbody).applyForceAtPoint(force.scale(50), posForce);
                    return;
                }
                if (_event.buttons == 0)
                    return;
                twists[3 - _event.buttons].target =
                    Math.max(-50, Math.min(50, twists[3 - _event.buttons].target - _event.movementX));
                break;
            case "wheel":
                let movePartition = -Math.sign(_event.deltaY);
                partition = Math.max(1, Math.min(segments + 1, partition + movePartition));
                break;
        }
    }
    function update(_event) {
        ƒ.Physics.simulate();
        for (let twist of twists) {
            let rot = (twist.target - twist.current) / 20;
            twist.current += rot;
            forwardBase.getComponent(Script.Segment).twist(twists[1].current, 0);
            forwardBase.getComponent(Script.Segment).twist(twists[2].current, partition);
            forwardBase.mtxLocal.rotation = ƒ.Vector3.Z(twists[0].current /*  + 270 */);
            viewport.draw();
        }
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
            this.iSegment = 0;
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
        async grow(_nSegments, _graph, _iSegment = 0) {
            this.iSegment = _iSegment;
            if (_nSegments < 1)
                return;
            let next = await ƒ.Project.createGraphInstance(_graph);
            this.node.getChildByName("Cap").addChild(next);
            next.mtxLocal.scale(ƒ.Vector3.ONE(1));
            next.mtxLocal.rotateZ(0);
            next.getComponent(Segment).grow(--_nSegments, _graph, ++_iSegment);
        }
        twist(_rotZ, _startSegment = 0) {
            if (this.iSegment >= _startSegment)
                this.node.mtxLocal.rotation = ƒ.Vector3.Z(_rotZ);
            let next = this.node.getChildByName("Cap").getChild(0);
            if (next)
                next.getComponent(Segment).twist(_rotZ, _startSegment);
        }
    }
    Script.Segment = Segment;
})(Script || (Script = {}));
//# sourceMappingURL=Script.js.map
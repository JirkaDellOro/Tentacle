namespace Script {
  import ƒ = FudgeCore;

  type Twist = { current: number, target: number };

  let viewport: ƒ.Viewport;
  document.addEventListener("interactiveViewportStarted", <EventListener><unknown>start);

  let inverseTip: ƒ.GraphInstance;
  let forwardBase: ƒ.GraphInstance;
  const twists: Twist[] = [{ current: 0, target: 0 }, { current: 0, target: 0 }, { current: 0, target: 0 }];
  const segments: number = 15;
  let partition: number = 5;

  async function start(_event: CustomEvent): Promise<void> {
    viewport = _event.detail;
    viewport.camera.mtxPivot.translateZ(15);
    viewport.camera.mtxPivot.translateY(3);
    viewport.camera.mtxPivot.translateX(-1);
    viewport.camera.mtxPivot.rotateY(180);

    // setup inverse kinematic
    let phySegment: ƒ.Graph = <ƒ.Graph>ƒ.Project.getResourcesByName("Physegment")[0];

    let prev: ƒ.GraphInstance;
    let scale: number = 1;
    let anchorLength: number = 1 / 0.9;
    let yPos: number = 0;
    for (let i: number = 0; i < 17; i++) {
      let segment: ƒ.GraphInstance = await ƒ.Project.createGraphInstance(phySegment);
      let body: ƒ.ComponentRigidbody = segment.getComponent(ƒ.ComponentRigidbody);

      segment.mtxLocal.translateX(-2);
      segment.mtxLocal.translateY(yPos);
      segment.mtxLocal.scale(ƒ.Vector3.ONE(scale));
      for (let child of segment.getChildren())
        child.getComponent(ƒ.ComponentMaterial).activate(true);
      ƒ.Physics.adjustTransforms(segment);

      if (prev) {
        let joint: ƒ.JointRevolute = prev.getComponent(ƒ.JointRevolute);
        console.log(joint);
        joint.anchor = ƒ.Vector3.Y(anchorLength);//*yOffset);
        joint.bodyAnchor = prev.getComponent(ƒ.ComponentRigidbody);
        joint.bodyTied = body;
      } else
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
    let segment: ƒ.Graph = <ƒ.Graph>ƒ.Project.getResourcesByName("Segment")[0];
    forwardBase = await ƒ.Project.createGraphInstance(segment);
    forwardBase.getComponent(Segment).grow(16, segment);
    viewport.getBranch().addChild(forwardBase);

    viewport.canvas.addEventListener("mousemove", hndMouse);
    viewport.canvas.addEventListener("wheel", hndMouse);

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start();
  }


  function hndMouse(_event: MouseEvent | WheelEvent): void {
    switch (_event.type) {
      case "mousemove":
        if (_event.ctrlKey) {
          let ray: ƒ.Ray = viewport.getRayFromClient(new ƒ.Vector2(_event.clientX, _event.clientY));
          let force: ƒ.Vector3 = ray.intersectPlane(ƒ.Vector3.ZERO(), ƒ.Vector3.Z());
          force = force.subtract(inverseTip.mtxLocal.translation);
          let posForce: ƒ.Vector3 = ƒ.Vector3.Y().transform(inverseTip.mtxWorld);
          inverseTip.getComponent(ƒ.ComponentRigidbody).applyForceAtPoint(force.scale(50), posForce);
          return;
        }

        if (_event.buttons == 0)
          return;

        twists[3 - _event.buttons].target =
          Math.max(-50, Math.min(50, twists[3 - _event.buttons].target - _event.movementX));

        break;

      case "wheel":
        let movePartition = - Math.sign((<WheelEvent>_event).deltaY);
        partition = Math.max(1, Math.min(segments + 1, partition + movePartition));
        break;
    }
  }

  function update(_event: Event): void {
    ƒ.Physics.simulate();

    for (let twist of twists) {
      let rot: number = (twist.target - twist.current) / 20;
      twist.current += rot;

      forwardBase.getComponent(Segment).twist(twists[1].current, 0);
      forwardBase.getComponent(Segment).twist(twists[2].current, partition);
      forwardBase.mtxLocal.rotation = ƒ.Vector3.Z(twists[0].current /*  + 270 */);

      viewport.draw();
    }
  }
}
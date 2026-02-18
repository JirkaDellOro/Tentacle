namespace Script {
  import ƒ = FudgeCore;
  ƒ.Debug.info("Main Program Template running!");

  type Twist = { current: number, target: number };

  let viewport: ƒ.Viewport;
  document.addEventListener("interactiveViewportStarted", <EventListener><unknown>start);

  let tentacle: ƒ.GraphInstance;
  let physTacle: ƒ.GraphInstance;
  let physTip: ƒ.GraphInstance;

  const twists: Twist[] = [{ current: 0, target: 0 }, { current: 0, target: 0 }, { current: 0, target: 0 }];
  const segments: number = 15;
  let partition: number = 5;

  async function start(_event: CustomEvent): Promise<void> {
    viewport = _event.detail;
    viewport.camera.mtxPivot.translateZ(15);
    viewport.camera.mtxPivot.translateY(3);
    viewport.camera.mtxPivot.rotateY(180);

    viewport.physicsDebugMode = ƒ.PHYSICS_DEBUGMODE.JOINTS_AND_COLLIDER;
    let phySegment: ƒ.Graph = <ƒ.Graph>ƒ.Project.getResourcesByName("Physegment")[0];

    let prev: ƒ.GraphInstance;
    let scale: number = 1;
    let anchorLength: number = 1/0.9;
    let yPos: number = 5;
    for (let i: number = 0; i < 16; i++) {
      let segment: ƒ.GraphInstance = await ƒ.Project.createGraphInstance(phySegment);
      let body: ƒ.ComponentRigidbody = segment.getComponent(ƒ.ComponentRigidbody);

      segment.mtxLocal.translateX(-2);
      segment.mtxLocal.translateY(yPos);
      segment.mtxLocal.scale(ƒ.Vector3.ONE(scale));
      for (let child of segment.getChildren())
        child.getComponent(ƒ.ComponentMaterial).activate(false);
      ƒ.Physics.adjustTransforms(segment);

      if (prev) {
        let joint: ƒ.JointRevolute = prev.getComponent(ƒ.JointRevolute);
        console.log(joint);
        joint.anchor = ƒ.Vector3.Y(anchorLength);//*yOffset);
        joint.bodyAnchor = prev.getComponent(ƒ.ComponentRigidbody);
        joint.bodyTied = body;
      } else {
        physTacle = segment;
        body.typeBody = ƒ.BODY_TYPE.KINEMATIC;
        // body.setPosition(new ƒ.Vector3(-2.1, yPos,0));
      }

      viewport.getBranch().addChild(segment);

      yPos += scale;
      scale *= 0.9;
      anchorLength *= 0.9;
      prev = segment;
    }
    physTip = prev;



    let segment: ƒ.Graph = <ƒ.Graph>ƒ.Project.getResourcesByName("Segment")[0];
    tentacle = await ƒ.Project.createGraphInstance(segment);
    tentacle.getComponent(Segment).grow(16, segment);
    viewport.getBranch().addChild(tentacle);

    viewport.canvas.addEventListener("mousemove", hndMouse);
    viewport.canvas.addEventListener("wheel", hndMouse);

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start();  // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
  }

  function hndMouse(_event: MouseEvent | WheelEvent): void {
    _event.preventDefault();
    switch (_event.type) {
      case "mousemove":
        let force: ƒ.Vector3 = new ƒ.Vector3(_event.movementX, -_event.movementY, 0);
        physTip.getComponent(ƒ.ComponentRigidbody).applyForce(force.scale(10));

        if (_event.buttons == 0)
          return

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
    // let body: ƒ.ComponentRigidbody = physTacle.getComponent(ƒ.ComponentRigidbody);
    // let diff: ƒ.Vector3 = ƒ.Vector3.DIFFERENCE(new ƒ.Vector3(-2,8,0), body.getPosition());
    // diff.x = ƒ.random.getRange(-0.01,0.01);
    // body.applyForce(diff.scale(500));
    ƒ.Physics.simulate();  // if physics is included and used

    for (let twist of twists) {
      let rot: number = (twist.target - twist.current) / 20;
      twist.current += rot;

      // if (Math.abs(twist.target - twist.current) < 1)
      //   twist.target = ƒ.random.getRange(-40, 40);
    }

    tentacle.getComponent(Segment).twist(twists[1].current, 0);
    tentacle.getComponent(Segment).twist(twists[2].current, partition);
    tentacle.mtxLocal.rotation = ƒ.Vector3.Z(twists[0].current /*  + 270 */);

    viewport.draw();
    // ƒ.AudioManager.default.update();
  }
}
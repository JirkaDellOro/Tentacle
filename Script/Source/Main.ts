namespace Script {
  import ƒ = FudgeCore;
  ƒ.Debug.info("Main Program Template running!");

  type Twist = { current: number, target: number };

  let viewport: ƒ.Viewport;
  document.addEventListener("interactiveViewportStarted", <EventListener><unknown>start);
  let tentacle: ƒ.GraphInstance
  const twists: Twist[] = [{ current: 0, target: 0 }, { current: 0, target: 0 }, { current: 0, target: 0 }];

  async function start(_event: CustomEvent): Promise<void> {
    viewport = _event.detail;

    let segment: ƒ.Graph = <ƒ.Graph>await ƒ.Project.getResourcesByName("Segment")[0];
    tentacle = await ƒ.Project.createGraphInstance(segment);
    tentacle.getComponent(Segment).grow(16, segment);

    viewport.getBranch().addChild(tentacle);

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start();  // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
  }

  function update(_event: Event): void {
    // ƒ.Physics.simulate();  // if physics is included and used

    for (let twist of twists) {
      let rot: number = (twist.target - twist.current) / 20;
      twist.current += rot;

      if (Math.abs(twist.target - twist.current) < 1)
        twist.target = ƒ.random.getRange(-40, 40);
    }

    tentacle.getComponent(Segment).twist(twists[1].current, 0);
    tentacle.getComponent(Segment).twist(twists[2].current, 6);
    tentacle.mtxLocal.rotation = ƒ.Vector3.Z(twists[0].current + 270);

    viewport.draw();
    ƒ.AudioManager.default.update();
  }
}
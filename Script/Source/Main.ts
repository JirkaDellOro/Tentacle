namespace Script {
  import ƒ = FudgeCore;
  ƒ.Debug.info("Main Program Template running!");

  let viewport: ƒ.Viewport;
  document.addEventListener("interactiveViewportStarted", <EventListener><unknown>start);
  let tentacle: ƒ.GraphInstance
  let rotCurrent: number = 0;
  let rotTarget: number = 0;

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

    let rot: number = (rotTarget - rotCurrent) / 10;
    rotCurrent += rot;

    if (Math.abs(rotTarget - rotCurrent) < 1)
      rotTarget = ƒ.random.getRange(-40, 40);

    tentacle.getComponent(Segment).twist(rotCurrent);
    viewport.draw();
    ƒ.AudioManager.default.update();
  }
}
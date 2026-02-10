namespace Script {
  import ƒ = FudgeCore;
  ƒ.Project.registerScriptNamespace(Script);  // Register the namespace to FUDGE for serialization

  export class Segment extends ƒ.ComponentScript {
    // Register the script as component for use in the editor via drag&drop
    public static readonly iSubclass: number = ƒ.Component.registerSubclass(Segment);


    constructor() {
      super();

      // Don't start when running in editor
      if (ƒ.Project.mode == ƒ.MODE.EDITOR)
        return;

      // Listen to this component being added to or removed from a node
      this.addEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndEvent);
      this.addEventListener(ƒ.EVENT.COMPONENT_REMOVE, this.hndEvent);
      this.addEventListener(ƒ.EVENT.NODE_DESERIALIZED, this.hndEvent);
    }

    // Activate the functions of this component as response to events
    public hndEvent = (_event: Event): void => {
      switch (_event.type) {
        case ƒ.EVENT.COMPONENT_ADD:
          break;
        case ƒ.EVENT.COMPONENT_REMOVE:
          this.removeEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndEvent);
          this.removeEventListener(ƒ.EVENT.COMPONENT_REMOVE, this.hndEvent);
          break;
        case ƒ.EVENT.NODE_DESERIALIZED:
          // if deserialized the node is now fully reconstructed and access to all its components and children is possible
          break;
      }
    }

    public async grow(_nSegments: number, _graph: ƒ.Graph): Promise<void> {
          let next: ƒ.GraphInstance = await ƒ.Project.createGraphInstance(_graph);
          // console.log(next);

          this.node.getChildByName("Cap").addChild(next);
          next.mtxLocal.scale(ƒ.Vector3.ONE(1));
          next.mtxLocal.rotateZ(0);
          _nSegments--;
          if (_nSegments < 1)
            return;
          next.getComponent(Segment).grow(_nSegments, _graph);
    }

    public twist(_rotZ: number): void {
      this.node.mtxLocal.rotation = ƒ.Vector3.Z(_rotZ);
      let next: ƒ.Node = this.node.getChildByName("Cap").getChild(0);
      if (next)
        next.getComponent(Segment).twist(_rotZ);
    }



    // protected reduceMutator(_mutator: ƒ.Mutator): void {
    //   // delete properties that should not be mutated
    //   // undefined properties and private fields (#) will not be included by default
    // }
  }
}
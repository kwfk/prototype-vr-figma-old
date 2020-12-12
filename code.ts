// This plugin creates 5 rectangles on the screen.
const numberOfRectangles = 5;

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs such as the network by creating a UI which contains
// a full browser environment (see documentation).

const page = figma.currentPage;
const startingFrame = page.prototypeStartNode;
console.log(startingFrame.name);

function traverse(node: BaseNode) {
  console.log(node);
  if ("reactions" in node) console.log(node.reactions);
  if ("children" in node) {
    if (node.type !== "INSTANCE") {
      for (const child of node.children) {
        traverse(child);
      }
    }
  }
}
// traverse(figma.root);

type Hotspot = {
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  transition: {
    eventType: string;
    actionType: string;
    parameters?: { destination: string };
  };
};

type Frame = {
  id: string;
  name: string;
  width: number;
  height: number;
  hotspots: Hotspot[];
};

type ExportJSONType = {
  startingFrame: string;
  frames: Frame[];
};

function findReactionNodes(node: BaseNode): Hotspot[] {
  let ret = [];
  if ("reactions" in node && node.reactions.length > 0) {
    console.log(node.name, node, node.visible, node.opacity);
    ret = [
      {
        name: node.name,
        x: node.x,
        y: node.y,
        w: node.width,
        h: node.height,
        visible: node.opacity !== 0,
        transition: {
          eventType: node.reactions[0].trigger.type,
          actionType: node.reactions[0].action.type,
          parameters: [
            node.reactions[0].action.type === "NODE"
              ? node.reactions[0].action.destinationId
              : undefined,
          ],
        },
        // node.reactions.map((r) => ({
        //   eventType: r.trigger.type,
        //   actionType: r.action.type,
        //   parameters: [
        //     r.action.type === "NODE" ? r.action.destinationId : undefined,
        //   ],
        // })),
      },
    ];
  }
  if ("children" in node) {
    if (node.type !== "INSTANCE") {
      for (const child of node.children) {
        ret = [...ret, ...findReactionNodes(child)];
      }
    }
  }
  return ret;
}

const allFrames: Frame[] = page.children.map((node) => {
  if (node.type === "FRAME") {
    const { id, name, width, height } = node;

    return {
      id,
      name,
      width,
      height,
      hotspots: findReactionNodes(node),
    };
  }
});

let exportJSON: ExportJSONType = {
  startingFrame: startingFrame.name,
  frames: allFrames,
};
console.log(JSON.stringify(exportJSON, null, 2));

// alert(JSON.stringify(exportJSON));

// const n = figma.currentPage.findAll((node) => node.type === "FRAME");
// const t = n[0] as FrameNode;
// console.log(t);
// console.log(t.reactions);
// t.reactions.map((r) => {
//   if (r.trigger.type === "ON_CLICK" && r.action.type === "NODE") {
//     const { destinationId } = r.action;
//     exportJSON = {
//       ...exportJSON,
//       [t.id]: [...exportJSON.id, { destinationId }],
//     };
//   }
// });

// console.log(figma.root.children[0].prototypeStartNode);
// const pages: ReadonlyArray<PageNode> = figma.root.children;
// for (const page of pages) {
//   traverse(page.prototypeStartNode);
//   console.log(page.findOne((node) => node.id === "18:0"));
//   console.log(figma.getNodeById("18:0"));
// }

// const nodes: SceneNode[] = [];
// for (let i = 0; i < numberOfRectangles; i++) {
//   const rect = figma.createRectangle();
//   rect.x = i * 150;
//   rect.fills = [{ type: "SOLID", color: { r: 1, g: 0.5, b: 0 } }];
//   figma.currentPage.appendChild(rect);
//   nodes.push(rect);
// }
// figma.currentPage.selection = nodes;
// figma.viewport.scrollAndZoomIntoView(nodes);

// Make sure to close the plugin when you're done. Otherwise the plugin will
// keep running, which shows the cancel button at the bottom of the screen.
figma.closePlugin();

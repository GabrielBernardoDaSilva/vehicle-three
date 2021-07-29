import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  BoxGeometry,
  MeshBasicMaterial,
  Mesh,
  EdgesGeometry,
  LineSegments,
  LineBasicMaterial,
  CylinderGeometry,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { axleInPos, baysInTruck, baysTypes } from "./data/data";

const App = () => {
  const select = document.getElementById("baysTypes");
  const divRender = document.getElementById("render");
  const add = document.getElementById("btnAdd");
  const remove = document.getElementById("btnRemove");
  const addAxle = document.getElementById("btnAddAxle");
  const removeAxle = document.getElementById("btnRemoveAxle");
  const divMove = document.getElementById("moveAxle");

  //let baysInTruck = [];
  let bayType = baysTypes[0];
  let bayIndex = 0;
  let axleIndex = 0;
  let axlesInTruck3d = [...axleInPos];

  select.onchange = (e) => {
    bayType = baysTypes.find((x) => x.BayTypeId === e.target.value);
  };

  const loadBays = (baysTypes) => {
    baysTypes.forEach((item) => {
      const option = document.createElement("option");
      option.value = item.BayTypeId;
      option.innerText = item.BayTypeDescription;
      select.appendChild(option);
    });
  };
  loadBays(baysTypes);

  const location = (size, sizeSon) => {
    const locatio = size / 2;
    const son = sizeSon / 2;
    return locatio - son;
  };

  let chest = {
    x: 0,
    y: 0,
    z: 0,
  };
  let posX = 0;

  const scene = new Scene();
  const camera = new PerspectiveCamera(75, 1280 / 800, 0.1, 1000);
  const renderer = new WebGLRenderer({ antialias: true });
  renderer.setSize(1280, 800);
  divRender.appendChild(renderer.domElement);
  const controls = new OrbitControls(camera, renderer.domElement);
  camera.position.z = 5;

  const geometryPivo = new BoxGeometry(1, 1, 1);
  const materialPivo = new MeshBasicMaterial({
    color: 0xff00ff,
    opacity: 0.0,
    transparent: true,
  });
  const cubePivo = new Mesh(geometryPivo, materialPivo);
  scene.add(cubePivo);

  const generateBays = (bayType) => {
    chest = {
      x: chest.x + bayType.BayWidth,
      y: chest.y > bayType.BayHeight ? chest.y : bayType.BayHeight,
      z: chest.z > bayType.BayLength ? chest.z : bayType.BayLength * 2,
    };
    const geometry1 = new BoxGeometry(
      bayType.BayWidth,
      bayType.BayHeight,
      bayType.BayLength
    );
    const material1 = new MeshBasicMaterial({ color: 0x00ff00 });
    const bay1 = new Mesh(geometry1, material1);

    const edges1 = new EdgesGeometry(geometry1);
    const line1 = new LineSegments(
      edges1,
      new LineBasicMaterial({ color: 0xff0000 })
    );

    const geometry2 = new BoxGeometry(
      bayType.BayWidth,
      bayType.BayHeight,
      bayType.BayLength
    );

    const edges2 = new EdgesGeometry(geometry2);
    const line2 = new LineSegments(
      edges2,
      new LineBasicMaterial({ color: 0xff0000 })
    );

    const material2 = new MeshBasicMaterial({ color: 0x00ff00 });
    const bay2 = new Mesh(geometry2, material2);

    bay1.parent = cubePivo;
    bay2.parent = cubePivo;

    bay1.position.set(
      location(1, bayType.BayWidth) - posX,
      location(1, bayType.BayHeight),
      location(1, bayType.BayLength)
    );
    line1.position.set(bay1.position.x, bay1.position.y, bay1.position.z);
    bay2.position.set(
      location(1, bayType.BayWidth) - posX,
      location(1, bayType.BayHeight),
      location(1, bayType.BayLength) + bayType.BayLength
    );
    line2.position.set(bay2.position.x, bay2.position.y, bay2.position.z);

    baysInTruck.push({
      VehicleTypeId: "06Alta",
      BayTypeId: bayType.BayTypeId,
      BayId: bayIndex++,
      BayX: Math.round((posX + Number.EPSILON) * 100) / 100,
      BayY: 0,
      BayZ: 0,
      BayLayer: 1,
      BayLabel: "0",
      BaySequence: bayIndex,
      ExteriorAccess: true,
    });
    bay1.name = `bay_${bayIndex}`;
    line1.name = `line_${bayIndex}`;

    baysInTruck.push({
      VehicleTypeId: "06Alta",
      BayTypeId: bayType.BayTypeId,
      BayId: bayIndex++,
      BayX: Math.round((posX + Number.EPSILON) * 100) / 100,
      BayY: 0,
      BayZ: -bayType.BayLength,
      BayLayer: 1,
      BayLabel: "0",
      BaySequence: bayIndex,
      ExteriorAccess: true,
    });
    bay2.name = `bay_${bayIndex}`;
    line2.name = `line_${bayIndex}`;
    posX += bayType.BayWidth;
    scene.add(bay1);
    scene.add(line1);
    scene.add(bay2);
    scene.add(line2);
  };

  const clearThree = (obj) => {
    while (obj.children.length > 0) {
      clearThree(obj.children[0]);
      obj.remove(obj.children[0]);
    }
    if (obj.geometry) obj.geometry.dispose();

    if (obj.material) {
      Object.keys(obj.material).forEach((prop) => {
        if (!obj.material[prop]) return;
        if (
          obj.material[prop] !== null &&
          typeof obj.material[prop].dispose === "function"
        )
          obj.material[prop].dispose();
      });
    }
  };

  const load3d = (bayInTruck) => {
    const bayType = baysTypes.find((x) => x.BayTypeId === bayInTruck.BayTypeId);
    const geometry1 = new BoxGeometry(
      bayType.BayWidth,
      bayType.BayHeight,
      bayType.BayLength
    );
    const material1 = new MeshBasicMaterial({ color: 0x00ff00 });
    const bay1 = new Mesh(geometry1, material1);

    const edges1 = new EdgesGeometry(geometry1);
    const line1 = new LineSegments(
      edges1,
      new LineBasicMaterial({ color: 0xff0000 })
    );
    bay1.parent = cubePivo;

    bay1.position.set(
      location(1, bayType.BayWidth) - bayInTruck.BayX,
      location(1, bayType.BayHeight),
      location(1, bayType.BayLength) + Math.abs(bayInTruck.BayZ)
    );
    line1.position.set(bay1.position.x, bay1.position.y, bay1.position.z);

    bay1.name = `bay_${bayInTruck.BayId}`;
    line1.name = `line_${bayInTruck.BayId}`;

    scene.add(bay1);
    scene.add(line1);
    posX += bayType.BayWidth;
  };

  const load3dFromArr = (baysInTruck) => {
    baysInTruck.forEach((item) => {
      const bayTypeItem = baysTypes.find((x) => x.BayTypeId === item.BayTypeId);
      load3d(item);
      chest = {
        x: chest.x + bayTypeItem.BayWidth,
        y: chest.y > bayTypeItem.BayHeight ? chest.y : bayTypeItem.BayHeight,
        z:
          chest.z > bayTypeItem.BayLength ? chest.z : bayTypeItem.BayLength * 2,
      };
    });
    posX = chest.x;
    posX /= 2;
    bayIndex = baysInTruck[baysInTruck.length - 1].BayId;
  };

  const removBay = () => {
    const bayTypeDelete = baysTypes.find(
      (x) => x.BayTypeId === baysInTruck[baysInTruck.length - 1].BayTypeId
    );
    posX -= bayTypeDelete.BayWidth;
    const axle = axlesInTruck3d.find(x => x.BayLayer === baysInTruck.length - 1);
    if (axle !== undefined)
      removeAxle3d()
    const mesh1 = scene.children.find((x) => x.name === `bay_${bayIndex}`);
    const line1 = scene.children.find((x) => x.name === `line_${bayIndex}`);
    baysInTruck.pop();
    console.log(bayIndex);
    bayIndex--;
    const mesh2 = scene.children.find((x) => x.name === `bay_${bayIndex}`);
    const line2 = scene.children.find((x) => x.name === `line_${bayIndex}`);
    baysInTruck.pop();
    console.log(bayIndex);
    bayIndex--;

    console.log(mesh1);
    console.log(mesh2);

    scene.remove(mesh1);
    scene.remove(line1);
    scene.remove(mesh2);
    scene.remove(line2);

    console.log(scene);
  };

  const loadCabin = () => {
    const loader = new GLTFLoader();
    loader.load(
      "assets/3d/cabinNewGltf.glb",
      (gltf) => {
        const object = gltf.scene;
        object.name = "truck_cabin";
        object.traverse((child) => {
          child.position.set(cubePivo.position.x - 1.5, -1.75, 0.5);
          child.scale.set(0.32, 0.32, 0.32);
          child.rotateY((Math.PI / 180) * 180);
          if (child instanceof Mesh) {
            if (
              child.name === "adtruck_2" ||
              child.name === "adtruck_3" ||
              child.name === "adtruck_4" ||
              child.name === "adtruck_6"
            )
              child.material = new MeshBasicMaterial({ color: 0x030303 });
            else if (child.name === "adtruck_5")
              child.material = new MeshBasicMaterial({ color: 0xeeffee });
            else if (child.name === "adtruck_7")
              child.material = new MeshBasicMaterial({ color: 0xff5500 });
            else if (child.name === "adtruck_8")
              child.material = new MeshBasicMaterial({ color: 0x010101 });
            else if (child.name === "adtruck_9")
              child.material = new MeshBasicMaterial({ color: 0xeeeeee });
            else if (child.name === "adtruck_10")
              child.material = new MeshBasicMaterial({ color: 0xff0000 });
            else if (child.name === "adtruck_11")
              child.material = new MeshBasicMaterial({ color: 0xff0000 });
            else if (child.name === "adtruck_12")
              child.material = new MeshBasicMaterial({ color: 0x444444 });
          }
        });

        // const geometry = new CylinderGeometry(0.3, 0.3, 0.1, 86, 86);
        // const material = new MeshBasicMaterial();
        // const wheel = new Mesh(geometry, material);
        // wheel.rotateX((Math.PI / 180) * 90);
        // wheel.position.set(cubePivo.position.x + 1.7, -1.75, -0.55);

        // const wheel2 = new Mesh(geometry, material);
        // wheel2.rotateX((Math.PI / 180) * 90);
        // wheel2.position.set(cubePivo.position.x + 1.7, -1.75, 1.55);

        scene.add(object);
        getOriginalPos();
      },
      undefined,
      (error) => console.log(error)
    );
  };

  const loadAxle = (posX = 0, posY = 0, index) => {
    const loader = new GLTFLoader();
    loader.load("assets/3d/axle.glb", (gltf) => {
      const object = gltf.scene;
      object.parent = cubePivo;
      object.name = `axle_${index}`;
      object.traverse((child) => {
        child.parent = cubePivo;
        child.position.set(-1.4 - posX, -2.2 - posY, 0.5);
        child.scale.set(0.029, 0.029, 0.029);
        child.rotateX((Math.PI / 180) * 90);
        if (child instanceof Mesh) {
          if (child.name === "adtruck_2")
            child.material = new MeshBasicMaterial({ color: 0x000000 });
          else if (child.name === "adtruck_3")
            child.material = new MeshBasicMaterial({ color: 0xc606ac });
        }
      });

      scene.add(object);
    });
  };

  const loadAxle3dArr = (loadAxleArr) => {
    loadAxleArr.forEach((item) => {
      loadAxle(item.BayX, item.BayY, item.BayId * -1);
      button(item.BayId * -1);
      axleIndex++;
    });
  };

  const addAxle3d = () => {
    const bayRelative = baysInTruck[baysInTruck.length - 1];
    const indexOfRelativeBay = baysInTruck.length - 1;
    let posAxleX = bayRelative.BayX;

    let posAxleY = 0;
    baysInTruck.forEach((item) => {
      posAxleY = item.BayY > posAxleY ? item.BayY : posAxleY;
    });
    posAxleY -= bayRelative.BayY;
    if (
      axlesInTruck3d.length > 0 &&
      axlesInTruck3d.filter((x) => x.BayLayer === indexOfRelativeBay).length > 0
    )
      return;
    loadAxle(posAxleX, posAxleY, axleIndex);
    axlesInTruck3d.push({
      VehicleTypeId: "06Alta",
      BayTypeId: "-1",
      BayId: -axleIndex,
      BayX: posAxleX,
      BayY: posAxleY,
      BayZ: 0,
      //mark each bays the axle is relative
      BayLayer: baysInTruck.length - 1,
      BayLabel: "",
      BaySequence: 0,
      ExteriorAccess: true,
    });
    button(axleIndex);
    axleIndex++;
    moveAxleYCabin();
  };
  const button = (axleId) => {
    const divHolder = document.createElement("div");
    const buttonLeft = document.createElement("button");
    const buttonRight = document.createElement("button");

    buttonLeft.innerText = "<-";
    buttonLeft.onclick = () => {
      moveLeft(axleId);
    };
    buttonRight.innerText = "->";
    buttonRight.onclick = () => {
      moveRigth(axleId);
    };

    divHolder.id = `div_axle_${axleId}`;
    divHolder.appendChild(buttonLeft);
    divHolder.appendChild(buttonRight);

    divMove.appendChild(divHolder);
  };

  const moveLeft = (axleId) => {
    const axle = axlesInTruck3d[axleId];
    const axle3d = scene.children.find((x) => x.name === `axle_${axleId}`);
    const indexOfActualBayRelative = axle.BayLayer;
    const indexOfNewBayRelative = axle.BayLayer + 2;
    if (
      axlesInTruck3d.filter((x) => x.BayLayer === indexOfNewBayRelative)
        .length > 0 ||
      indexOfNewBayRelative > baysInTruck.length
    )
      return;
    const oldBay = baysInTruck[indexOfActualBayRelative];
    const bay = baysInTruck[indexOfNewBayRelative];
    const posY =
      oldBay.BayY > bay.BayY
        ? oldBay.BayY - bay.BayY
        : (bay.BayY - oldBay.BayY) * -1;
    axle3d.traverse((item) => {
      item.translateX((bay.BayX - oldBay.BayX) * -1);
      item.translateZ(posY);
    });
    axle.BayX += bay.BayX - oldBay.BayX;
    axle.BayY += posY;
    axle.BayLayer = indexOfNewBayRelative;
    moveAxleYCabin();
  };
  const moveRigth = (axleId) => {
    const axle = axlesInTruck3d[axleId];
    const axle3d = scene.children.find((x) => x.name === `axle_${axleId}`);
    const indexOfActualBayRelative = axle.BayLayer;
    const indexOfNewBayRelative = axle.BayLayer - 2;
    if (
      axlesInTruck3d.filter((x) => x.BayLayer === indexOfNewBayRelative)
        .length > 0 ||
      indexOfNewBayRelative < 1
    )
      return;
    const oldBay = baysInTruck[indexOfActualBayRelative];
    const bay = baysInTruck[indexOfNewBayRelative];
    const posY =
      oldBay.BayY > bay.BayY
        ? oldBay.BayY - bay.BayY
        : (bay.BayY - oldBay.BayY) * -1;
    axle3d.traverse((item) => {
      item.translateX(oldBay.BayX - bay.BayX);
      item.translateZ(posY);
    });
    axle.BayX += bay.BayX - oldBay.BayX;
    axle.BayY += posY;
    axle.BayLayer = indexOfNewBayRelative;
    moveAxleYCabin();
  };

  const removeAxle3d = () => {
    if (axleIndex !== 0) axleIndex--;
    const removeDiv = document.getElementById(`div_axle_${axleIndex}`);
    if (divMove.children.length > 0) divMove.removeChild(removeDiv);
    const mesh = scene.children.find((x) => x.name === `axle_${axleIndex}`);
    axlesInTruck3d.pop();
    scene.remove(mesh);
  };
  let originalCabinePosY = 0;
  let originalCabinePosZ = 0;

  const moveAxleYCabin = () => {
    console.log(originalCabinePosZ);
    const cabin = scene.children.find((x) => x.name === "truck_cabin");
    let maxPosAxleY = 0;
    axlesInTruck3d.forEach((item) => {
      maxPosAxleY = item.BayY > maxPosAxleY ? item.BayY : maxPosAxleY;
    });
    cabin.traverse((item) => {
      item.position.y = originalCabinePosY;
      item.position.z = originalCabinePosZ;
    });
    cabin.traverse((item) => {
      item.translateY(maxPosAxleY * -1);
      item.translateZ(maxPosAxleY / 2);
    });
  };

  add.onclick = () => {
    generateBays(bayType);
    baysInTruck.forEach((item) => {
      const bayTypeItem = baysTypes.find((x) => x.BayTypeId === item.BayTypeId);
      item.BayY =
        Math.round((chest.y - bayTypeItem.BayHeight + Number.EPSILON) * 100) /
        100;
    });
  };

  remove.onclick = () => {
    removBay();
  };
  addAxle.onclick = () => {
    addAxle3d();
  };
  removeAxle.onclick = () => {
    removeAxle3d();
  };

  const getOriginalPos = () => {
    const cabin = scene.children.find((x) => x.name === "truck_cabin");
    originalCabinePosY = cabin.position.y;
    originalCabinePosZ = cabin.position.z;
  };

  loadCabin();
  load3dFromArr(baysInTruck);
  loadAxle3dArr(axlesInTruck3d);

  const animate = () => {
    controls.update();
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  };
  animate();
};

App();

// {
//   "x": 4.2,
//   "y": 1.83,
//   "z": 2.34
// }

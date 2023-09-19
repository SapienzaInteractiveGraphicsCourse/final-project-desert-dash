class Game {

  PLANE_LENGTH = 100;

  // *** OBSTACLES ***
  // number of cars spawned per plane
  OBSTACLE_CAR = 10;

  // Possible x coordinate values ​​for obstacles
  obstacleCarPosX = [-4.6, -2.3, 0, 2.3, 4.6];

  constructor(scene, camera) {

    this.scene = scene;
    this.camera = camera;
    this.running = false;
    
    this.initializedFloor = false;
    this.initializedObstacles = false;
    this.initializedCar = false;
    this.initializedSideWalkers = false;

    this.animationInProgress = false;

    this.lastScore = 0;

    this.divHealth = document.getElementById('heart-container');
    this.distance = document.getElementById('distance-value');

    this.divGameOverPanel = document.getElementById('game-over-panel');
    this.divGameOverDistance = document.getElementById('game-over-distance');


    // event handlers
    document.getElementById('start-button').onclick = () => {
      this.running = true;
      document.getElementById('intro-panel').style.display = 'none';
    };
    document.getElementById('try-again-button').onclick = () => {
      this.running = true;
      document.getElementById('game-over-panel').style.display = 'none';
    };

    this._reset(false);

    document.addEventListener("keydown", this._keydown.bind(this));
  }

  update() {
    if(!this.running) return;
    if(this.initializedCar && this.initializedFloor && this.initializedObstacles && this.initializedSideWalkers){
      this._updateScene();
      this._checkCollisions();
      this._updateInfoPanel();
      TWEEN.update();
    }
  }

  _reset(retry) {

    this.speedZ = 0.25;

    this.health = 3;
    this.boost = false;
    this.vulnerable = true;

    var img1 = document.createElement("img");
    img1.id = "h1";
    img1.className = "heart-image";
    img1.src = "./src/images/hp.png";
    img1.alt = "heart";

    var img2 = document.createElement("img");
    img2.id = "h2";
    img2.className = "heart-image";
    img2.src = "./src/images/hp.png";
    img2.alt = "heart";

    var img3 = document.createElement("img");
    img3.id = "h3";
    img3.className = "heart-image";
    img3.src = "./src/images/hp.png";
    img3.alt = "heart";

    this.divHealth.appendChild(img1);
    this.divHealth.appendChild(img2);
    this.divHealth.appendChild(img3);

    this._initializeScene(this.scene, this.camera, retry);
  }

  _keydown(event) {

    if (this.animationInProgress) {
      return;
    }

    switch (event.key) {
      case 'ArrowLeft':
        this._startCarRotation("left");
        break;
      case 'ArrowRight':
        this._startCarRotation("right");
        break;
      default:
        return;
    }
  }

  _startCarRotation(direction) {
    if (this.animationInProgress) {
      return;
    }

    this.animationInProgress = true;
    this._carRotation(direction);
  }

  _carRotation(dir) {
    let addX;
    let rotY;

    if(dir === "left"){
      addX = -2.3;
      rotY = Math.PI / 16;
    }
    else {
      addX = 2.3;
      rotY = - Math.PI / 16;
    }

    const initialRotation = this.mainCar.rotation.y;
    const initialPosition = this.mainCar.position.x;

    if(initialPosition === -4.1 && dir === 'left'){
      addX = 0;
      rotY = 0;
    }
    else if(initialPosition === 5.1 && dir === 'right'){
      addX = 0;
      rotY = 0;
    }
    
    const tween1 = new TWEEN.Tween({
      car: initialRotation,
      posX: initialPosition
    })
      .to({
        car: initialRotation + rotY,
        posX: initialPosition + addX
      }, 250)
      .onUpdate((element) => {
        this.mainCar.rotation.y = element.car;
        this.mainCar.position.x = element.posX;
      })
      .easing(TWEEN.Easing.Linear.None)
      .start()
      .onComplete(() => {
        const tween2 = new TWEEN.Tween({
          car: this.mainCar.rotation.y,
        })
          .to({
            car: initialRotation,
          }, 250)
          .onUpdate((element) => {
            this.mainCar.rotation.y = element.car;
          })
          .easing(TWEEN.Easing.Elastic.Out)
          .start()
          .onComplete(() => {
            this.animationInProgress = false;
          });
      });
  }

  _wheelsRotation() {

    //*** Main car wheels movement ***
    this.LBWheel.rotation.x += 0.05;
    this.RBWheel.rotation.x += 0.05;
    this.LFWheel.rotation.x += 0.05;
    this.RFWheel.rotation.x += 0.05;

    //*** Obstacles wheels movement ***

    this.obstaclesGroup.children.forEach(car =>{
      if(car.getObjectByName('FLWheel')){
        car.getObjectByName('FLWheel').rotation.x -= 0.05;
      }
      if(car.getObjectByName('RLWheel')){
        car.getObjectByName('RLWheel').rotation.x -= 0.05;
      }
      if(car.getObjectByName('FRWheel')){
        car.getObjectByName('FRWheel').rotation.x -= 0.05;
      }
      if(car.getObjectByName('RRWheel')){
        car.getObjectByName('RRWheel').rotation.x -= 0.05;
      }
    })
  }

  // update road
  _updateRoad() {
    // road movement
    this.floor.position.z += this.speedZ;
    this.floorClone_1.position.z += this.speedZ;
    this.floorClone_2.position.z += this.speedZ;
    this.floorClone_3.position.z += this.speedZ;
    // terrain (left and right) movement
    this.terrainLeft.position.z += this.speedZ; 
    this.terrainRight.position.z += this.speedZ; 
    this.terrainLeftCopy1.position.z += this.speedZ; 
    this.terrainRightCopy1.position.z += this.speedZ;
    this.terrainLeftCopy2.position.z += this.speedZ;
    this.terrainRightCopy2.position.z += this.speedZ;
    this.terrainLeftCopy3.position.z += this.speedZ;
    this.terrainRightCopy3.position.z += this.speedZ;



    if (this.floor.position.z >= this.PLANE_LENGTH) {
      this.floor.position.z = - 3*this.PLANE_LENGTH + this.speedZ;
      this.terrainLeft.position.z = - 3*this.PLANE_LENGTH + this.speedZ;
      this.terrainRight.position.z = - 3*this.PLANE_LENGTH + this.speedZ;
    }

    if (this.floorClone_1.position.z >= this.PLANE_LENGTH) {
        this.floorClone_1.position.z = - 3*this.PLANE_LENGTH + this.speedZ;
        this.terrainLeftCopy1.position.z =- 3*this.PLANE_LENGTH + this.speedZ;
        this.terrainRightCopy1.position.z =- 3*this.PLANE_LENGTH + this.speedZ;
    }

    if (this.floorClone_2.position.z >= this.PLANE_LENGTH) {
      this.floorClone_2.position.z = - 3*this.PLANE_LENGTH + this.speedZ;
      this.terrainLeftCopy2.position.z =- 3*this.PLANE_LENGTH + this.speedZ;
      this.terrainRightCopy2.position.z =- 3*this.PLANE_LENGTH + this.speedZ;
    }

    if (this.floorClone_3.position.z >= this.PLANE_LENGTH) {
      this.floorClone_3.position.z = - 3*this.PLANE_LENGTH + this.speedZ;
      this.terrainLeftCopy3.position.z =- 3*this.PLANE_LENGTH + this.speedZ;
      this.terrainRightCopy3.position.z =- 3*this.PLANE_LENGTH + this.speedZ;
    }
  }

  // update obstacles
  _updateObstacles() {
    // obstacles movement
    this.obstaclesGroup.position.z += this.speedZ;

    this.obstaclesGroup.children.forEach(obstacle =>{
      const obstacleZPos = obstacle.position.z + this.obstaclesGroup.position.z;
      if (obstacle instanceof THREE.Object3D) {
        if(obstacleZPos > 2){
          this._setupObstaclePlane(obstacle, -this.obstaclesGroup.position.z);
        }
      }
    });
  }

  _updateCactus() {
    this.cactusGroup.position.z += this.speedZ;

    this.cactusGroup.children.forEach(cactus =>{
      const cactusZPos = cactus.position.z + this.cactusGroup.position.z;
      if (cactus instanceof THREE.Object3D) {
        if(cactusZPos > 2){
          this._setupCactus(cactus, -this.cactusGroup.position.z);
        }
      }
    });
  }

  _updateSidewalker() {
    this.sideWalkerGroup.position.z += this.speedZ;
    this.sideWalkerGroup.children.forEach(object => {
      const childZPos = object.position.z + this.obstaclesGroup.position.z;
      if (object instanceof THREE.Object3D) {
        if(childZPos > 5 + this.size.z){
          object.position.z = -this.sideWalkerGroup.position.z + this.lastSideWalkerZ;
        }
      }
    });
  }

  _updateScene() {
    this._wheelsRotation();
    this._updateRoad();
    this._updateObstacles();
    this._updateCactus();
    this._updateSidewalker();
  }

  _checkCollisions() {
    this.obstaclesGroup.children.forEach(obstacle =>{
      
    let box1 = new THREE.Box3().setFromObject(obstacle);

    let box2 = new THREE.Box3().setFromObject(this.mainCar);

    const isIntersecting = box1.intersectsBox(box2);

    if (isIntersecting && this.vulnerable != false) {
        let heartRemove;
        this.vulnerable = false;
        //console.log("Le bounding boxes si sovrappongono (collisione).");
        heartRemove = document.getElementById("h"+this.health);
        this.health-=1;
        heartRemove.remove();
        if(this.health <= 0){
          this._gameOver();
        }
        else {
          this.materials.forEach((material) => {
            material.transparent = true;
          
            const opacityStart = material.opacity;
            const opacityEnd = 0.1;
          
            const state = { opacity: opacityStart };
          
            new TWEEN.Tween(state)
              .to({ opacity: opacityEnd }, 200)
              .easing(TWEEN.Easing.Quadratic.InOut)
              .onUpdate(() => {
                material.opacity = state.opacity;
              })
              .yoyo(true)
              .repeat(7)
              .start()
              .onComplete(() => {
                this.vulnerable = true;
              });
          });
        }

    }
  });

  }

  _updateInfoPanel() {
    this.distance.innerText = "DISTANCE: " + (this.obstaclesGroup.position.z - this.lastScore).toFixed(0) + "m";
  }

  _gameOver() {
    this.running = false;
    this.divGameOverDistance.innerText = (this.obstaclesGroup.position.z - this.lastScore).toFixed(0) + "m";
    setTimeout(() => {
      this.divGameOverPanel.style.display = 'grid';
      this.lastScore = this.obstaclesGroup.position.z;
      this._reset(true);
    }, 1000);
  }

  _streetTexture(texture, scene) {

    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set( 6, 2 );
    
    this.floor = new THREE.Mesh(
        new THREE.PlaneGeometry(14, this.PLANE_LENGTH, 8, 8),
        new THREE.MeshLambertMaterial({
            map: texture
    }));
    this.floor.rotation.x -= Math.PI / 2;

    this.floorClone_1 = this.floor.clone();
    this.floorClone_1.position.z = - this.PLANE_LENGTH;

    this.floorClone_2 = this.floor.clone();
    this.floorClone_2.position.z = - 2*this.PLANE_LENGTH;

    this.floorClone_3 = this.floor.clone();
    this.floorClone_3.position.z = - 3*this.PLANE_LENGTH;

    scene.add(this.floor);
    scene.add(this.floorClone_1);
    scene.add(this.floorClone_2);
    scene.add(this.floorClone_3);

    this.initializedFloor = true;

  }

  // create the sidewalkers
  _createSideWalkers(scene) {

    this.sideWalkerGroup = new THREE.Group();
    const numSideWalkers = 24;
    const sideWalkers = [];
    for (let i = 0; i < numSideWalkers; i++) {
      const sideWalker = new THREE.Object3D();
      sideWalkers.push(sideWalker);
      this.sideWalkerGroup.add(sideWalkers[i]);
    }

    this.sideWalker.scale.set(0.05, 0.05, 0.1);
    this.sideWalker.position.set(-12.5, -0.15, 5);
    let bbox = new THREE.Box3().setFromObject(this.sideWalker);
    let helper = new THREE.Box3Helper(bbox, new THREE.Color(0, 255, 0));
    // size variables
    this.size = bbox.getSize(new THREE.Vector3());
    this.lastSideWalkerZ = 5 - 9*this.size.z;

    for (let i = 0; i < numSideWalkers; i++) {
      sideWalkers[i].position.z = 5 - Math.floor(i/2)*this.size.z;
      if (i % 2 != 0) {
        sideWalkers[i].scale.set(-1, 1, 1);
      }
      sideWalkers[i].add(this.sideWalker.clone());
    }

    // add group of sidewalkers to the scene
    scene.add(this.sideWalkerGroup);

    this.initializedSideWalkers = true;

  }

  _createTerrain(texture, scene) {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set( 6 , 6 );  

      this.terrainLeft = new THREE.Mesh(
          new THREE.PlaneGeometry(200, this.PLANE_LENGTH, 8, 8),
          new THREE.MeshLambertMaterial({
              map: texture
      }));
      this.terrainLeft.rotation.x -= Math.PI / 2;

      this.terrainRight = this.terrainLeft.clone();
  
      this.terrainLeft.position.set(-109.5, 0.2, 0);

      this.terrainRight.position.set(109.5, 0.2, 0);

      this.terrainRightCopy1 = this.terrainRight.clone();
      this.terrainLeftCopy1 = this.terrainLeft.clone();
      this.terrainRightCopy1.position.z -= this.PLANE_LENGTH;
      this.terrainLeftCopy1.position.z -= this.PLANE_LENGTH;
      this.terrainRightCopy2 = this.terrainRight.clone();
      this.terrainLeftCopy2 = this.terrainLeft.clone();
      this.terrainRightCopy2.position.z -= 2*this.PLANE_LENGTH;
      this.terrainLeftCopy2.position.z -= 2*this.PLANE_LENGTH;
      this.terrainRightCopy3 = this.terrainRight.clone();
      this.terrainLeftCopy3 = this.terrainLeft.clone();
      this.terrainRightCopy3.position.z -= 3*this.PLANE_LENGTH;
      this.terrainLeftCopy3.position.z -= 3*this.PLANE_LENGTH;
  
      scene.add(this.terrainLeft);
      scene.add(this.terrainRight);
      scene.add(this.terrainLeftCopy1);
      scene.add(this.terrainRightCopy1);
      scene.add(this.terrainLeftCopy2);
      scene.add(this.terrainRightCopy2);
      scene.add(this.terrainLeftCopy3);
      scene.add(this.terrainRightCopy3);
  
  }

  async _initializeScene(scene, camera, retry) {
    if(!retry){
      camera.rotateX(-20 * Math.PI / 180);
      camera.position.set(0, 2.5, 3.5);

      // loaders
      const loader = new THREE.GLTFLoader();
      const loaderCubeTexture = new THREE.CubeTextureLoader();
      const loaderTexture = new THREE.TextureLoader();

      const [m1, m2, m3, m4, m5, m6, m7, m8, m9] = await Promise.all([
          loader.loadAsync("./assets/car/scene.gltf"),
          loader.loadAsync('./assets/sidewalker/scene.gltf'),
          loaderTexture.loadAsync('src/images/desert.jpg'),
          loaderTexture.loadAsync('src/images/street.jpg'),
          loader.loadAsync('./assets/obstacles/obs1/scene.gltf'),
          loader.loadAsync('./assets/obstacles/obs2/scene.gltf'),
          loader.loadAsync('./assets/obstacles/obs3/scene.gltf'),
          loader.loadAsync('./assets/car/wheel/scene.gltf'),
          loader.loadAsync('./assets/ambient/cactus/scene.gltf')
      ]);

      // CACTUS
      this.cactus = m9.scene;
      this.cactus.scale.set(0.015, 0.015, 0.015);
      this.cactus.position.y += 0.2;
      this.cactus.rotation.y = Math.PI/2;
      this.cactusGroup = new THREE.Group();
      scene.add(this.cactusGroup);
      this._cactusGenerator();

      // SKYBOX
      const textureLoader = new THREE.TextureLoader();
      const textures = [
        textureLoader.load('src/images/right.png'),
        textureLoader.load('src/images/left.png'),
        textureLoader.load('src/images/top.png'),
        textureLoader.load('src/images/bottom.png'),
        textureLoader.load('src/images/front.png'),
        textureLoader.load('src/images/back.png')
    ];

      const materials = textures.map(texture => new THREE.MeshLambertMaterial({ map: texture, side: THREE.BackSide }));
      const boxWidth = 400;
      const boxHeight = 100;
      const boxDepth = 400;
      const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

      const skybox = new THREE.Mesh(geometry, materials);

      scene.add(skybox);


      //<-- 
      //creation of the car that we control
      this.mainCar = m1.scene;
      // resizing and position

      this.mainCar.rotation.y = Math.PI;
      this.mainCar.scale.set(1.2, 1.2, 1.2);
      this.mainCar.position.set(0.5, 0.065, -2);


      /* siccome il modello importato aveva come pivot delle ruote un pivot univoco per tutte e 4 le ruote
      non mi permetteva di effettuare la rotazione lungo l'asse Y pertanto ho dovuto creare
      un nuovo gruppo dove inserire le ruote e poi creare nuove ruote */

      const utilityGroup = new THREE.Group();
      utilityGroup.add(this.mainCar.getObjectByName('Wheel'));

      this.RBWheel = m8.scene;

      this.RBWheel.scale.set(0.00053, 0.00053, 0.00053);
      this.RBWheel.position.set(-0.19, 0.21, -0.18);
      this.RBWheel.rotation.y = -Math.PI/2;
      this.RFWheel = this.RBWheel.clone();
      this.RFWheel.position.set(-0.22, 0.21, 1.81);
      this.LFWheel = this.RFWheel.clone();
      this.LFWheel.position.set(1.09, 0.21, 1.81);
      this.LFWheel.rotation.y += Math.PI;
      this.LBWheel = this.LFWheel.clone();
      this.LBWheel.position.set(1.04, 0.21, -0.18);

      this.mainCar.add(this.RBWheel);
      this.mainCar.add(this.RFWheel);
      this.mainCar.add(this.LFWheel);
      this.mainCar.add(this.LBWheel);

      this.materials = [];

      this.mainCar.traverse((child) => {
        if(child.isMesh) this.materials.push(child.material);
      });

      scene.add(this.mainCar);
      

      // add model to the scene
      
      this.initializedCar = true;

      this.sideWalker = m2.scene;

      this._createSideWalkers(scene);

      this._streetTexture(m4, scene);

      this._createTerrain(m3, scene);

      this.obsCar1 = m5.scene;

      this.obsCar1.scale.set(0.9, 0.9, 0.9);
      this.obsCar1.position.set(0, 0.68, 0);

      this.obsCar2 = m6.scene;

      this.obsCar2.scale.set(0.0085, 0.0085, 0.0085);

      this.obsCar3 = m7.scene;
      this.obsCar3.position.set(0, 0.2, -2);
      this.obsCar3.scale.set(0.8, 0.8, 0.8);
      this.obsCar3.rotation.y = Math.PI/2;

      let bbox1 = new THREE.Box3().setFromObject(this.obsCar1);
      let bbox2 = new THREE.Box3().setFromObject(this.obsCar2);
      // size variables
      this.sizeObs1 = bbox1.getSize(new THREE.Vector3());
      this.sizeObs2 = bbox2.getSize(new THREE.Vector3());
      //let helper = new THREE.Box3Helper(bbox2, new THREE.Color(0, 255, 0));

      //<---------------------------
      
      this.obstaclesGroup = new THREE.Group();

      for(let i = 0; i < this.OBSTACLE_CAR; i++) {
        this._initialSpawnObstacle(i);
      }

      scene.add(this.obstaclesGroup);

      this.initializedObstacles = true;
    } else {
      this.mainCar.position.x = 0.5;
      this.obstaclesGroup.children.forEach(obstacle =>{
        this._setupObstaclePlane(obstacle);
      });
    }
  }

  _cactusGenerator() {
    for(let i = 0; i < 100; i++){
      let cactusCopy = this.cactus.clone();
      if(i % 2 == 0){ // genero il cactus sulla sx
        cactusCopy.userData = { side: 'left'};
        cactusCopy.position.x = this._randomFloat(-10.5, -100);
      }
      else { // genero il cactus a dx
        cactusCopy.userData = { side: 'right'};
        cactusCopy.position.x = this._randomFloat(10.5, 100);
      }
      cactusCopy.rotation.y += this._randomFloat(0, 360);
      cactusCopy.position.z = this._randomFloat(-10, -220);
      this.cactusGroup.add(cactusCopy);
    }
  }

  _setupCactus(obj, refZPos = 0){
    if(obj.userData.side === 'left'){
      obj.position.x = this._randomFloat(-10.5, -100);
    }
    else if(obj.userData.side === 'right'){
      obj.position.x = this._randomFloat(10.5, 100);
    }
    obj.rotation.y += this._randomFloat(0, 360);
    obj.position.z = refZPos - 200 - this._randomFloat(0, 200);
  }

  _initialSpawnObstacle(i) {
    let obstacleCarCopy;

    if(i % 5 == 0) {
      obstacleCarCopy = this.obsCar2.clone(); //spawn bus
    }
    else if(i % 3 == 0){
      obstacleCarCopy = this.obsCar3.clone();
    }
    else{
      obstacleCarCopy = this.obsCar1.clone(); // spawn car
    }

    this._setupObstaclePlane(obstacleCarCopy);

    this.obstaclesGroup.add(obstacleCarCopy);


  }

  _setupObstaclePlane(obj, refZPos = 0) {

    obj.position.x = this._pickRandom(this.obstacleCarPosX);
    const offset = this._getMultipleInRange(this.sizeObs2.z, 0, 200);
    obj.position.z = refZPos - 200 - offset;
  }

  //*** Utility functions ***

  // This method returns a pseudorandom double greater than or equal to 0.0 and less than 1.0.
  _randomFloat(min, max) { 
    return Math.random() * (max - min) + min;
  }

  _getMultipleInRange(base, min, max) {
    const range = max - min;
    const offset = min % base === 0 ? 0 : base - (min % base); // Calcola l'offset se il minimo non è già un multiplo di base
    const validMin = min + offset;
  
    const numMultiplesInRange = Math.floor((range + 1) / base); // Calcola il numero di multipli di base nel range
    const randomMultipleIndex = Math.floor(Math.random() * numMultiplesInRange); // Scegli un indice casuale
  
    return validMin + randomMultipleIndex * base;
  }

  _pickRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

}
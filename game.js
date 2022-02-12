import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';

import {FBXLoader} from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/FBXLoader.js';
import {GLTFLoader} from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/GLTFLoader.js';
import {OrbitControls} from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js';
class KeyboardControls {
    constructor(options) {
    //   this._Init(params);
    //   this._params = params;
      this._move = {
        forward: false,
        backward: false,
        left: false,
        right: false,
      };
      this._decceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0);
      this._acceleration = new THREE.Vector3(1, 0.25, 50.0);
      this._velocity = new THREE.Vector3(0, 0, 0);

      this.game = options.game;
      this.moveplayer = options.moveplayer;
  
      document.addEventListener('keydown', (e) => this._onKeyDown(e), false);
      document.addEventListener('keyup', (e) => this._onKeyUp(e), false);
    }
  
    // _Init(params) {
      
    // }
  
    _onKeyDown(event) {
        console.log("pressed key")
      switch (event.keyCode) {
        case 87: // w
          this._move.forward = true;
          break;
        case 65: // a
          this._move.left = true;
          break;
        case 83: // s
          this._move.backward = true;
          break;
        case 68: // d
          this._move.right = true;
          break;
        case 38: // up
        case 37: // left
        case 40: // down
        case 39: // right
          break;
      }
      this.Update()
    }
  
    _onKeyUp(event) {
      switch(event.keyCode) {
        case 87: // w
          this._move.forward = false;
          break;
        case 65: // a
          this._move.left = false;
          break;
        case 83: // s
          this._move.backward = false;
          break;
        case 68: // d
          this._move.right = false;
          break;
        case 38: // up
        case 37: // left
        case 40: // down
        case 39: // right
          break;
      }
      this.Update()
    }
    Update() {
        
        var forward = 0
        var sideways = 0
        if (this._move.forward == true){
            forward = 1
        } else if (this._move.backward == true){
            forward = -1
        }

        if (this._move.left == true){
            sideways = -1
        } else if (this._move.right == true){
            sideways = 1
        }

        this.moveplayer.call(this.game, forward, sideways);
      }
    

}

class Game{
	constructor(){
		if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
		
		this.container;
		this.player = { };
		this.stats;
		this.controls;
		this.camera;
		this.scene;
		this.renderer;
		
		this.container = document.createElement( 'div' );
		this.container.style.height = '100%';
		document.body.appendChild( this.container );
        
		const game = this;
		
		this.assetsPath = '../assets/';
        this.animations = {};
        this.anims = [];
        this.animDict = {};
		
		this.clock = new THREE.Clock();
        
        this.init();

		window.onError = function(error){
			console.error(JSON.stringify(error));
		}
	}
	
	init() {

        // const fov = 60;
        // const aspect = 1920 / 1080;
        // const near = 1.0;
        // const far = 1000.0;
        // this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        // this.camera.position.set(75, 20, 0);
		this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
		this.camera.position.set(112, 100, 400);
        
		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color( 0xa0a0a0 );
		this.scene.fog = new THREE.Fog( 0xa0a0a0, 700, 1800 );

		let light = new THREE.HemisphereLight( 0xffffff, 0x444444 );
		light.position.set( 0, 200, 0 );
		this.scene.add( light );

		light = new THREE.DirectionalLight( 0xffffff );
		light.position.set( 0, 200, 100 );
		light.castShadow = true;
		light.shadow.camera.top = 180;
		light.shadow.camera.bottom = -100;
		light.shadow.camera.left = -120;
		light.shadow.camera.right = 120;
		this.scene.add( light );

		// ground
		var mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 4000, 4000 ), new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } ) );
		mesh.rotation.x = - Math.PI / 2;
		//mesh.position.y = -100;
		mesh.receiveShadow = true;
		this.scene.add( mesh );

		var grid = new THREE.GridHelper( 4000, 60, 0x000000, 0x000000 );
		//grid.position.y = -100;
		grid.material.opacity = 0.2;
		grid.material.transparent = true;
		this.scene.add( grid );

        // const loaderbg = new THREE.CubeTextureLoader();
        // const texture = loaderbg.load([
        //     './resources/posx.jpg',
        //     './resources/negx.jpg',
        //     './resources/posy.jpg',
        //     './resources/negy.jpg',
        //     './resources/posz.jpg',
        //     './resources/negz.jpg',
        // ]);
        // this.scene.background = texture;

        // const plane = new THREE.Mesh(
        //     new THREE.PlaneGeometry(100, 100, 10, 10),
        //     new THREE.MeshStandardMaterial({
        //         color: 0x202020,
        //       }));
        // plane.castShadow = false;
        // plane.receiveShadow = true;
        // plane.rotation.x = -Math.PI / 2;
        // this.scene.add(plane);

        

		// model
		const loader = new FBXLoader();
		const game = this;
		
		loader.load( `${this.assetsPath}fbx/Pug.fbx`, function ( object ) {

			object.mixer = new THREE.AnimationMixer( object );
			game.player.mixer = object.mixer;
			game.player.root = object.mixer.getRoot();
			
			object.name = "Pug";

            // const params = {
            //     target: object,
            //     camera: game.camera,
            //   }
            //   game.controls = new KeyboardControls(params);
					
			object.traverse( function ( child ) {
				if ( child.isMesh ) {
					child.castShadow = true;
					child.receiveShadow = false;		
				}
			} );
			
            // const tLoader = new THREE.TextureLoader();
            // tLoader.load(`${game.assetsPath}images/SimplePeople_FireFighter_Brown.png`, function(texture){
			// 	object.traverse( function ( child ) {
			// 		if ( child.isMesh ){
			// 			child.material.map = texture;
			// 		}
			// 	} );
			// });
            
			game.scene.add(object);
			game.player.object = object;
			game.player.mixer.clipAction(object.animations[1]).play();

            // game.animations.Idle = object.animations[0];

            game.animDict = {'Idle': object.animations[1], 'Walk': object.animations[0]};
            game.animations.Idle = object.animations[1];
            game.animations.Walking = object.animations[0];
            // game.anims = object.animations[1];
            
            game.loadNextAnim(loader);
            
            game.animate();
		} );

        // this._LoadAnimatedModel();
		
		this.renderer = new THREE.WebGLRenderer( { antialias: true } );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		this.renderer.shadowMap.enabled = true;
		this.container.appendChild( this.renderer.domElement );
        
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.target.set(0, 150, 0);
        this.controls.update();
			
		window.addEventListener( 'resize', function(){ game.onWindowResize(); }, false );
	}

    loadNextAnim(loader){
		let anim = this.anims.pop();
		const game = this;
		loader.load( `${this.assetsPath}fbx/Pug.fbx`, function( object ){
			game.animations[anim] = object.animations[0];
			if (game.anims.length>0){
				game.loadNextAnim(loader);
			}else{
                game.createCameras();
                game.joystick = new KeyboardControls({
                    moveplayer: game.playerControl,
                    game: game
                });
                // game.joystick = new JoyStick({
                //     onMove: game.playerControl,
                //     game: game
                // });
				delete game.anims;
				game.action = "Idle";
				game.animate();
			}
		});	
	}

    movePlayer(dt){	
        if (this.player.move.forward>0){
            const speed = (this.player.action=='Walking') ? 400 : 150;
            this.player.object.translateZ(dt*speed);
        }else{
            this.player.object.translateZ(-dt*30);
        }
        this.player.object.rotateY(this.player.move.turn*dt);
	}

    
	
	onWindowResize() {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();

		this.renderer.setSize( window.innerWidth, window.innerHeight );

	}

    set action(name){
		const action = this.player.mixer.clipAction( this.animations[name] );
        action.time = 0;
		this.player.mixer.stopAllAction();
		this.player.action = name;
		this.player.actionTime = Date.now();
		
		action.fadeIn(0.5);	
		action.play();
	}
    
    get action(){
        if (this.player===undefined || this.player.actionName===undefined) return "";
        return this.player.action;
    }


    playerControl(forward, turn){
		turn = -turn;
		
		if (forward>0.3){
			if (this.player.action!='Walking' && this.player.action!='Walking') this.action = 'Walking';
		}else if (forward<-0.3){
			if (this.player.action!='Walking') this.action = 'Walking';
		}else{
			forward = 0;
			if (Math.abs(turn)>0.1){
				if (this.player.action != 'Walking') this.action = 'Walking';
			}else if (this.player.action!="Idle"){
				this.action = 'Idle';
			}
		}
		
		if (forward==0 && turn==0){
			delete this.player.move;
		}else{
			this.player.move = { forward, turn }; 
		}
	}
x
    set activeCamera(object){
		this.player.cameras.active = object;
	}
    
    createCameras(){
		const offset = new THREE.Vector3(0, 80, 0);
		const front = new THREE.Object3D();
		front.position.set(112, 100, 600);
		front.parent = this.player.object;
		const back = new THREE.Object3D();
		back.position.set(0, 300, -600);
		back.parent = this.player.object;
		const wide = new THREE.Object3D();
		wide.position.set(178, 139, 1665);
		wide.parent = this.player.object;
		const overhead = new THREE.Object3D();
		overhead.position.set(0, 400, 0);
		overhead.parent = this.player.object;
		const collect = new THREE.Object3D();
		collect.position.set(40, 82, 94);
		collect.parent = this.player.object;
		this.player.cameras = { front, back, wide, overhead, collect };
		this.activeCamera = this.player.cameras.back;	
	}

	animate() {
		const game = this;
		const dt = this.clock.getDelta();
		
		requestAnimationFrame( function(){ game.animate(); } );
		
		if (this.player.mixer!==undefined) this.player.mixer.update(dt);
		
        if (this.player.action=='Walking'){
			const elapsedTime = Date.now() - this.player.actionTime;
			if (elapsedTime>10000 && this.player.move.forward>0){
				this.action = 'Walking';
			}
		}
		
		if (this.player.move !== undefined) this.movePlayer(dt);
		
		if (this.player.cameras!=undefined && this.player.cameras.active!=undefined){
			this.camera.position.lerp(this.player.cameras.active.getWorldPosition(new THREE.Vector3()), 0.05);
			const pos = this.player.object.position.clone();
			pos.y += 200;
			this.camera.lookAt(pos);
		}
        
        if (this.sun != undefined){
            this.sun.position.x = this.player.object.position.x;
            this.sun.position.y = this.player.object.position.y + 200;
            this.sun.position.z = this.player.object.position.z + 100;
            this.sun.target = this.player.object;
        }
        
		this.renderer.render( this.scene, this.camera );

	}
    
}
let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
  _APP = new Game();
}); 

// Rendering control variables
var canvas;
var renderer;

// Camera control variables
var camera;

// Constant file paths
const dicePath = "./Dice/scene.gltf";

/*
* Modifies the camera projection matrix and the canvas rendering resolution
* to account for modified canvas size.
*/
function ResizeDisplay()
{
	// Modify the camera aspect
	camera.aspect = canvas.clientWidth / canvas.clientHeight;
	camera.updateProjectionMatrix();
	
	// Modify the internal rendering resolution
	renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
}

/*
* Initialise a rendering environment.
*/
function Initialise()
{
	// Get canvas and pass it to the renderer
	canvas = document.querySelector("#c");
	renderer = new THREE.WebGLRenderer({canvas});
	
	// Set up default values for the camera
	const fov = 75;
	const aspect = canvas.clientWidth / canvas.clientHeight;
	const near = 0.1;
	const far = 5;
	camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	camera.position.z = 1.5;
	
	// Construct new Scene
	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0x330033);
	
	// Prepare to load an object
	const loader = new THREE.GLTFLoader();	
	let renderedObject;
	
	// Load a D20 model
	loader.load(dicePath, function(diceScene)
	{
		// Retrieve the GLTF scene and add it to the rendered scene
		let diceObject = (diceScene.scene);
		scene.add(diceObject);
		
		// Retrieve meshes within the scene
		let faceObject = diceObject.getObjectByName("Solid002_Material001_0");
		let numberObject = diceObject.getObjectByName("Solid002_letters_0");
		
		// Modify mesh materials
		faceObject.material.transparent = false;
		faceObject.material.color = new THREE.Color(0x730099);
		numberObject.material.color = new THREE.Color(0xFFD86B);
		faceObject.material.metalness = 0.25;
		console.log(faceObject.material);
		
		// Retrieve the parent dice mesh for manipulation
		renderedObject = diceObject.getObjectByName("Solid002");
	});
	
	// Create directional light source
	const color = 0xFFFFFF;
    const intensity = 1;
	
    var light = new THREE.DirectionalLight(color, intensity);
    light.position.set(3, 2, 2);
    light.target.position.set(0, 0, 0);
    scene.add(light);
    scene.add(light.target);
	
	var light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-3, 0, 2);
    light.target.position.set(0, 0, 0);
    scene.add(light);
    scene.add(light.target);
	
	// Begin rendering loop
	requestAnimationFrame(Render);
	
	/*
	* Internal function to maintain a rendering loop.
	* @Param time The time value provided by requestAnimationFrame
	*/
	function Render(time)
	{
		// Convert time to seconds and then half
		time *= 0.001;
		time *= 0.5;
		
		// Rotate the rendered dice
		if (renderedObject)
		{
			renderedObject.rotation.x = time;
			renderedObject.rotation.y = time;
		}
		
		// Check if resizing is required
		if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight)
		{
			ResizeDisplay();
		}
		
		// Render the current frame and calculate the next frame
		renderer.render(scene, camera);	
		requestAnimationFrame(Render);
	}
}

Initialise();
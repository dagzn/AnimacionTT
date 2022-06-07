// Get the form and file field
let form = document.querySelector('#upload');
let file = document.querySelector('#file');
let datos = {};

/**
 * Log the uploaded file to the console
 * @param {event} Event The file loaded event
 */
function logFile (event) {
	let str = event.target.result;
	let json = JSON.parse(str);
	datos = json;
	console.log('string', str);
	console.log('json', json);
	crearGrafo();
}

/**
 * Handle submit events
 * @param  {Event} event The event object
 */
function handleSubmit (event) {

	// Stop the form from reloading the page
	event.preventDefault();

	// If there's no file, do nothing
	if (!file.value.length) return;

	// Create a new FileReader() object
	let reader = new FileReader();

	// Setup the callback event to run when the file is read
	reader.onload = logFile;

	// Read the file
	reader.readAsText(file.files[0]);

}

// Listen for submit events
form.addEventListener('submit', handleSubmit);

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let network = {};
let data = {};

async function crearGrafo() {
	let nodes = [];
  let edges = [];

  data = {
    nodes: new vis.DataSet(nodes),
    edges: new vis.DataSet(edges)
  };

  var options = {
		layout: {
      hierarchical: {
        direction: "UD",
        sortMethod: "directed"
      }
    },
    nodes: {
      shape: "circle",
      borderWidth: 3,
      color: {
        border: "#6AA84F",
        background: "#3C78D8"
      },
      font: {
        color: "white",
        size: 15,
        strokeWidth: 1,
        strokeColor: "white"
      },
			physics:false
    },
    edges: {
      width: 2,
			font: {
					color: "black",
					size: 25,
					strokeWidth: 3,
					strokeColor: "white"
			},
			arrows: {
					to: {
							enabled: true,
							type: "arrow"
					}
			}
    }
  };

  let container = document.getElementById("SegmentTreeCanvas");

  network = new vis.Network(container, data, options);

	const n_materias = datos.materias.length;
	const n_profesores = datos.profesores.length;
	const n_bloques = datos.bloques.length;
	const n = 1 + n_materias + 2 * n_profesores + n_bloques + 1;
	const fuente = 0;
	data.nodes.update([{id: fuente, label: "S"}]);
	const destino = n-1;
	data.nodes.update([{id: destino, label: "T"}]);
	network.fit();
	await sleep(500);

	let indiceNombre = new Map();
	let m_id = new Map();
	let b_id = new Map();
	
	for(let i=0; i < n_materias; i++) {
		const m = datos.materias[i];
		indiceNombre.set(i+1, m.nombre);
		m_id.set(m.id, i+1);

		data.nodes.update([{id: i+1, label: m.nombre}]);

		const cap = m.cantidad;
		const cost = 0;
		console.log("Source -> "+ m.nombre + " cap=" + cap.toString() + " cost=" + cost.toString());
		data.edges.update([{from: fuente, to: i+1, color: "#545454"}]);

		network.fit();

		await sleep(500);
	}
	console.log(m_id);

	for(let i=0; i < n_bloques; i++) {
		const b = datos.bloques[i];
		const nodo = 1 + n_materias + 2*n_profesores + i;
		indiceNombre.set(nodo, b.nombre);
		b_id.set(b.id, nodo);

		data.nodes.update([{id: nodo, label: b.nombre}]);

		const cap = datos.salones;
		const cost = 0;
		console.log(b.nombre + " -> Sink cap=" + cap.toString() + " cost=" + cost.toString());
		data.edges.update([{from: nodo, to: destino, color: "#545454"}]);
		network.fit();

		await sleep(500);
	}
	console.log(b_id);

	for(let i=0; i < n_profesores; i++) {
		const p = datos.profesores[i];
		const entrada = 1 + n_materias + 2*i;
		data.nodes.update([{id: entrada, label: p.nombre}]);
		const salida  = 1 + n_materias + 2*i + 1;
		data.nodes.update([{id: salida, label: p.nombre}]);
		let cap = p.clases;
		let cost = 0;
		console.log(p.nombre + " -> "+p.nombre+" cap=" + cap.toString() + " cost=" + cost.toString());
		data.edges.update([{from: entrada, to: salida, color: "#545454"}]);

		network.fit();

		await sleep(500);

		indiceNombre.set(entrada, p.nombre);
		indiceNombre.set(salida, p.nombre);
		
		for(let j=0; j < p.materias.length; j++) {
			const m = p.materias[j];
			console.log(m);
			if(m_id.has(m.id)) {
				console.log(indiceNombre.get(m_id.get(m.id)) + " -> "+p.nombre+" cap=" + m.limite.toString() + " cost=" + m.preferencia.toString());
				data.edges.update([{from: m_id.get(m.id), to: entrada, color: "#545454"}]);
				network.fit();

				await sleep(500);
			}
		}

		for(let j=0; j < p.bloques.length; j++) {
			const b = p.bloques[j];
			console.log(b);
			if(b_id.has(b.id)) {
				const aux = 1;
				console.log(p.nombre + " -> "+ indiceNombre.get(b_id.get(b.id))  +" cap=" + aux.toString() + " cost=" + b.preferencia.toString());
				data.edges.update([{from: salida, to: b_id.get(b.id), color: "#545454"}]);
				network.fit();
				await sleep(500);
			}
		}
	}
}

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

let buildClicked = true;
let stepByStepClicked = false;
let nextStepClicked = false;
let execStarted = false;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function pause(ms = 1000) {
  if (buildClicked) return;
  if (stepByStepClicked) {
    return sleep(ms);
  } else {
    while (true) {
      await sleep(10);
      if (nextStepClicked) {
        nextStepClicked = false;
        return;
      }
    }
  }
}


let network = {};
let data = {};

async function build() {
	execStarted = true;
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
	await pause(500);

	data.nodes.update([{id: fuente, label: "Fuente"}]);
	const destino = n-1;
	data.nodes.update([{id: destino, label: "Destino"}]);
	network.fit();
	await pause(500);

	let indiceNombre = new Map();
	let m_id = new Map();
	let b_id = new Map();
	
	for(let i=0; i < n_materias; i++) {
		const m = datos.materias[i];
		indiceNombre.set(i+1, m.nombre);
		m_id.set(m.id, i+1);

		data.nodes.update([{id: i+1, label: m.nombre}]);
		network.fit();

		const cap = m.cantidad;
		const cost = 0;
		console.log("Source -> "+ m.nombre + " cap=" + cap.toString() + " cost=" + cost.toString());
		data.nodes.update([{id: fuente, color: {border: "orange"}}]);
		data.nodes.update([{id: i+1, color: {border: "orange"}}]);
		data.edges.update([{from: fuente, to: i+1, label: cap.toString()+"/"+cost.toString(), color: "orange"}]);

		await pause(500);

		data.nodes.update([{id: fuente, color: {border: "#6AA84F"}}]);
		data.nodes.update([{id: i+1, color: {border: "#6AA84F"}}]);
		data.edges.update([{from: fuente, to: i+1, label: cap.toString()+"/"+cost.toString(),color: "#545454"}]);
	}
	console.log(m_id);

	for(let i=0; i < n_bloques; i++) {
		const b = datos.bloques[i];
		const nodo = 1 + n_materias + 2*n_profesores + i;
		indiceNombre.set(nodo, b.nombre);
		b_id.set(b.id, nodo);

		data.nodes.update([{id: nodo, label: b.nombre}]);
		network.fit();

		const cap = datos.salones;
		const cost = 0;
		console.log(b.nombre + " -> Sink cap=" + cap.toString() + " cost=" + cost.toString());
		data.nodes.update([{id: nodo, color: {border: "orange"}}]);
		data.nodes.update([{id: destino, color: {border: "orange"}}]);
		data.edges.update([{from: nodo, to: destino, label: cap.toString()+"/"+cost.toString(), color: "orange"}]);

		await pause(500);

		data.nodes.update([{id: nodo, color: {border: "#6AA84F"}}]);
		data.nodes.update([{id: destino, color: {border: "#6AA84F"}}]);
		data.edges.update([{from: nodo, to: destino, label: cap.toString()+"/"+cost.toString(), color: "#545454"}]);

	}
	console.log(b_id);

	for(let i=0; i < n_profesores; i++) {
		const p = datos.profesores[i];
		const entrada = 1 + n_materias + 2*i;
		data.nodes.update([{id: entrada, label: p.nombre}]);
		const salida  = 1 + n_materias + 2*i + 1;
		data.nodes.update([{id: salida, label: p.nombre}]);
		network.fit();
		let cap = p.clases;
		let cost = 0;
		console.log(p.nombre + " -> "+p.nombre+" cap=" + cap.toString() + " cost=" + cost.toString());
		data.nodes.update([{id: entrada, color: {border: "orange"}}]);
		data.nodes.update([{id: salida, color: {border: "orange"}}]);
		data.edges.update([{from: entrada, to: salida, label: cap.toString()+"/"+cost.toString(), color: "orange"}]);

		await pause(500);

		data.nodes.update([{id: entrada, color: {border: "#6AA84F"}}]);
		data.nodes.update([{id: salida, color: {border: "#6AA84F"}}]);
		data.edges.update([{from: entrada, to: salida, label: cap.toString()+"/"+cost.toString(), color: "#545454"}]);

		indiceNombre.set(entrada, p.nombre);
		indiceNombre.set(salida, p.nombre);
		
		for(let j=0; j < p.materias.length; j++) {
			const m = p.materias[j];
			console.log(m);
			if(m_id.has(m.id)) {
				cap = m.limite.toString();
				cost = m.preferencia.toString();
				console.log(indiceNombre.get(m_id.get(m.id)) + " -> "+p.nombre+" cap=" + m.limite.toString() + " cost=" + m.preferencia.toString());
				data.nodes.update([{id: m_id.get(m.id), color: {border: "orange"}}]);
				data.nodes.update([{id: entrada, color: {border: "orange"}}]);
				data.edges.update([{from: m_id.get(m.id), to: entrada, label: cap.toString()+"/"+cost.toString(), color: "orange"}]);

				await pause(500);

				data.nodes.update([{id: m_id.get(m.id), color: {border: "#6AA84F"}}]);
				data.nodes.update([{id: entrada, color: {border: "#6AA84F"}}]);
				data.edges.update([{from: m_id.get(m.id), to: entrada, label: cap.toString()+"/"+cost.toString(), color: "#545454"}]);
			}
		}

		for(let j=0; j < p.bloques.length; j++) {
			const b = p.bloques[j];
			console.log(b);
			if(b_id.has(b.id)) {
				const aux = 1;
				cap = aux.toString();
				cost = b.preferencia.toString()
				console.log(p.nombre + " -> "+ indiceNombre.get(b_id.get(b.id))  +" cap=" + aux.toString() + " cost=" + b.preferencia.toString());
				data.nodes.update([{id: salida, color: {border: "orange"}}]);
				data.nodes.update([{id: b_id.get(b.id), color: {border: "orange"}}]);
				data.edges.update([{from: salida, to: b_id.get(b.id), label: cap.toString()+"/"+cost.toString(), color: "orange"}]);

				await pause(500);

				data.nodes.update([{id: salida, color: {border: "#6AA84F"}}]);
				data.nodes.update([{id: b_id.get(b.id), color: {border: "#6AA84F"}}]);
				data.edges.update([{from: salida, to: b_id.get(b.id), label: cap.toString()+"/"+cost.toString(), color: "#545454"}]);
			}
		}
	}

	stepByStepClicked = false;
  buildClicked = false;
  nextStepClicked = false;
  execStarted = false;
}

function nextStepOnClick() {
  nextStepClicked = true;
  buildClicked = false;
  stepByStepClicked = false;
  if (!execStarted) {
    build();
  }
}

async function justBuild() {
  // terminate next execution of step by step or next step if any
  // and then just end building
  buildClicked = true;
  if (execStarted) {
    stepByStepClicked = false;
    nextStepClicked = true;
    await sleep(20);
  } else {
    build();
  }
}

async function stepByStep() {
  // terminate next execution of step by step or next step if any
  // and then just continue with the next step
  stepByStepClicked = true;
  if (execStarted) {
    buildClicked = false;
    nextStepClicked = true;
    await sleep(20);
  } else {
    build();
  }
}


// Get the form and file field
let form = document.querySelector('#upload');
let file = document.querySelector('#file');

/**
 * Log the uploaded file to the console
 * @param {event} Event The file loaded event
 */
function logFile (event) {
	let str = event.target.result;
	let json = JSON.parse(str);
	console.log('string', str);
	console.log('json', json);
	crearGrafo(json)
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


function crearGrafo(datos) {
	// console.log(datos.salones)
	// console.log(datos.materias)
	// console.log(datos.profesores)
	// console.log(datos.bloques)
	const n_materias = datos.materias.length;
	const n_profesores = datos.profesores.length;
	const n_bloques = datos.bloques.length;
	const n = 1 + n_materias + 2 * n_profeosres + n_bloques + 1;
	const fuente = 0;
	const destino = n-1;

	let indiceNombre = new Map();
	let m_id = new Map();
	let b_id = new Map();
	
	for(let i=0; i < n_materias; i++) {
		const m = datos.materias[i];
		indiceNombre.set(i+1, m.nombre);
		m_id.set(m.id, i+1);

		const cap = m.cantidad;
		const cost = 0;
		console.log("Source -> "+ m.nombre + " cap=" + cap.toString() + " cost=" + cost.toString());
	}

	for(let i=0; i < n_bloques; i++) {
		const b = datos.bloques[i];
		const nodo = 1 + n_materias + 2*n_profesores + i;
		indiceNombre.set(nodo, b.nombre);
		b_id.set(b.id, nodo);

		const cap = datos.salones;
		const cost = 0;
		console.log(b.nombre + " -> Sink cap=" + cap.toString() + " cost=" + cost.toString());
	}

	for(let i=0; i < n_profesores; i++) {
		const p = datos.profesores[i];
		const entrada = 1 + n_materias + 2*i;
		const salida  = 1 + n_materias + 2*i + 1;
		let cap = p.clases;
		let cost = 0;
		console.log(p.nombre + " -> "+p.nombre+" cap=" + cap.toString() + " cost=" + cost.toString());

		indiceNombre.set(entrada, p.nombre);
		indiceNombre.set(salida, p.nombre);
		
		for(let j=0; j < p.materias; j++) {
			const m = p.materias[j];
			if(m_id.has(m.id)) {
				console.log(indiceNombre.get(m_id.get(m.id)) + " -> "+p.nombre+" cap=" + m.limite.toString() + " cost=" + m.preferencia.toString());
			}
		}

		for(let j=0; j < p.bloques; j++) {
			const b = p.bloques[j];
			if(b_id.has(b.id)) {
				const aux = 1;
				console.log(p.nombre + " -> "+ indiceNombre.get(b_id.get(b.id))  +" cap=" + aux.toString() + " cost=" + b.preferencia.toString());
			}
		}
	}
}

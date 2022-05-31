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

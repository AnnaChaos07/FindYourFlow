import axios from 'axios';

// Same-origin requests: credentials and database URLs never enter the bundle.
export default axios.create({ timeout: 20000 });

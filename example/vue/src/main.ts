// Import Vue's createApp method
import { createApp } from 'vue';

// Import root component
import App from './App.vue';

// Import Tailwind CSS styles
import './styles/tailwind.css';

// Create Vue app instance and mount to DOM
const app = createApp(App);
app.mount('#app');

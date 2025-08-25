// Export Commitlint configuration
// Inherit rules from @commitlint/config-conventional
export default {
  extends: ['@commitlint/config-conventional'],
};
{
  "name": "react-example",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "vite"
  },
  "dependencies": {
    "@refore-ai/copy-to-design-sdk": "^1.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.3.1",
    "tw-animate-css": "^1.3.5"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.1.11",
    "@types/react": "^19.0.4",
    "@types/react-dom": "^19.0.2",
    "@vitejs/plugin-react": "^4.3.4",
    "tailwindcss": "^4.1.11",
    "vite": "^7.0.4",
    "vite-tsconfig-paths": "^5.1.4",
    "typescript": "^5.7.3"
  }
}
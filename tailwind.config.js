const colors = require('tailwindcss/colors');
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './resources/views/**/*.blade.php'
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                danger: colors.rose,
                primary: colors.amber,
                success: colors.green,
                warning: colors.amber,
            },
        },
    },
    plugins: [],
    corePlugins: {
        preflight: false,
    }
}

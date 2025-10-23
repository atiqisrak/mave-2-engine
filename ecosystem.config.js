module.exports = {
    apps: [
        {
            name: 'mave-cms',
            script: 'dist/main.js',
            instances: 2, // Use 2 instances for 4 cores
            exec_mode: 'cluster',
            env: {
                NODE_ENV: 'production',
                PORT: 3000,
            },
            error_file: './logs/err.log',
            out_file: './logs/out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
        },
    ],
};


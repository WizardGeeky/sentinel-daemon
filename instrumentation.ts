
export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        // Skip daemon start on Vercel or if SKIP_DAEMON is set
        if (process.env.VERCEL === '1' || process.env.SKIP_DAEMON === '1') {
            console.log('Skipping Sentinel Daemon initialization (Vercel or SKIP_DAEMON set)');
            return;
        }

        const { startDaemon } = await import('./daemon/daemon');
        try {
            startDaemon();
            console.log('Sentinel Daemon started via instrumentation hook');
        } catch (err) {
            console.error('Failed to start Sentinel Daemon:', err);
        }
    }
}

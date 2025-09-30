const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const simpleGit = require('simple-git');

const app = express();
const PORT = process.env.PORT || 3000;
const git = simpleGit();

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

async function getCurrentUsername() {
    try {
        const config = await git.getConfig('user.name');
        return config.value || 'unknown';
    } catch (error) {
        console.error('Error getting git username:', error);
        return 'unknown';
    }
}

async function readMarbleData() {
    try {
        const data = await fs.readFile('marble_ownership.json', 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return {};
    }
}

async function writeMarbleData(data) {
    await fs.writeFile('marble_ownership.json', JSON.stringify(data, null, 4));
}

app.get('/api/refresh', async (req, res) => {
    try {
        await git.pull('origin', 'master');

        const username = await getCurrentUsername();
        const marbleData = await readMarbleData();
        console.log('marbleData', marbleData);

        if (!marbleData[username]) {
            marbleData[username] = 0;
        }

        await writeMarbleData(marbleData);

        res.json({
            success: true,
            username: username,
            marbles: marbleData
        });
    } catch (error) {
        console.error('Refresh error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post('/api/request-marble', async (req, res) => {
    try {
        await git.pull('origin', 'master');

        const username = await getCurrentUsername();
        const marbleData = await readMarbleData();

        const currentCount = marbleData[username] || 0;
        const newCount = currentCount + 1;

        const branchName = `marble-request-${username}-${Date.now()}`;

        await git.checkoutLocalBranch(branchName);

        marbleData[username] = newCount;
        console.log('Writing marbleData', marbleData);
        await writeMarbleData(marbleData);
        
        await git.add('marble_ownership.json');
        await git.commit(`Add marble for ${username} (${currentCount} -> ${newCount})`);

        await git.push('origin', branchName);

        await git.checkout('master');
        console.log("Pushed and returned to master");

        res.json({
            success: true,
            username: username,
            previousCount: currentCount,
            newCount: newCount,
            branch: branchName,
            message: `Created PR branch ${branchName} to add marble for ${username}`
        });
    } catch (error) {
        console.error('Request marble error:', error);
        try {
            await git.checkout('master');
        } catch (checkoutError) {
            console.error('Error returning to master:', checkoutError);
        }
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/api/marbles', async (req, res) => {
    try {
        const marbleData = await readMarbleData();
        res.json(marbleData);
    } catch (error) {
        console.error('Get marbles error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Marble server running on http://localhost:${PORT}`);
});
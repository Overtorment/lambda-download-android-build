const express = require('express')
const app = express()
const fetch = require('node-fetch')
const port = process.env.PORT || 3000

if (!process.env.TOKEN) {
	console.error('TOKEN env not provided');
	process.exit();
}

app.get('/', (req, res) => {
	  res.send('Hello World!')
})

app.get('/download/:buildid', async function (req, res) {
	const buildid = req.params.buildid
	const url = `https://api.appcenter.ms/v0.1/apps/BlueWallet/BlueWallet-1/builds/${buildid}/downloads/build`
	const result = await fetch(url, {
		method: 'GET',
		headers: {
			"accept": "application/json",
			"X-API-Token": process.env.TOKEN
		},
	});
	const json = await result.json()

	if (json && json.uri) {
		res.redirect(307, json.uri)
	} else {
		console.warn({json})
		res.send(json);
	}
})

async function handleDownloadArtifactForBranch(branch, res) {
	const url = `https://api.github.com/repos/BlueWallet/BlueWallet/actions/runs?status=success&event=pull_request&branch=${branch}`
	const result = await fetch(url, {
		method: 'GET',
		headers: {
			"accept": "application/json",
		},
	});
	const json = await result.json()

	let id = false;
	for (const run of json?.workflow_runs ?? []) {
		if (run.name === "BuildReleaseApk") {
			id = run.id;
		}
	}


	if (id) {
		res.redirect(307, `https://github.com/BlueWallet/BlueWallet/actions/runs/${id}`);
	} else {
		console.warn({json})
		res.send(json);
	}
}

app.get('/downloadArtifactForBranch/:branch', async function (req, res) {
	return await handleDownloadArtifactForBranch(req.params.branch, res)
})

app.get('/downloadArtifactForBranch/:branch/:branch2', async function (req, res) {
	if (req.params.branch2) {
		return await handleDownloadArtifactForBranch(req.params.branch + '/' + req.params.branch2, res);
	} else {
		return await handleDownloadArtifactForBranch(req.params.branch, res);
	}
})

app.listen(port, () => {
	  console.log(`app listening at http://localhost:${port}`)
})

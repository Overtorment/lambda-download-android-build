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

app.listen(port, () => {
	  console.log(`app listening at http://localhost:${port}`)
})

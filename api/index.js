import * as https from 'https';
const agent = new https.Agent({ keepAlive: true });

const config = {
	backend: 'fall.xtds.dance',
}

export default function handler(req, res) {
	const method = req.method || "GET";
	console.log(method + " " + req.path);
	const reqInner = https.request(
		{
			hostname: config.backend,
			port: 443,
			path: req.path,
			method: method,
			headers: req.headers,
			agent: agent,
		},
		(resInner) => {
			let rawData = "";
			resInner.on("data", (chunk) => {
				rawData += chunk;
			});
			resInner.on("end", () => {
				for (const header of Object.keys(resInner.headers)) {
					console.log('forwarding header: ' + header);
					res.set(header, resInner.headers[header]);
				}
				res.set("Access-Control-Allow-Origin", "*");
				res.set("Access-Control-Allow-Methods", "GET, HEAD, PUT, POST, PATCH, OPTIONS");
				res.set(
					"Access-Control-Allow-Headers",
					"Origin, Content-Type, Accept"
				);
				res.set("Access-Control-Expose-Headers", "Content-Length, ETag");
				if (method === "HEAD") {
					res.status(resInner.statusCode).end();
				} else {
					res.status(resInner.statusCode).send(rawData);
				}
			});
		}
	);
	reqInner.on("error", (e) => {
		res.status(500).send(`Error: ${e.message}`);
	});
	reqInner.end();
};

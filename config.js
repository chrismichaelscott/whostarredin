module.exports = {
	http: {
		port: 8080
	},
	cache: {
		templates: {
			enabled: false
		},
		cssInlining: {
			enabled: false
		}
	},
	elasticsearch: {
		url: "https://search-who-starred-in-xggtxxutyts6aujbbedqdvjtge.eu-west-1.es.amazonaws.com",
		index: "whostarredin",
		overlaySuffix: "overlay"
	},
	// Google Tag Manager
	gtm: {
		id: "GTM-K29BFN"
	},
	// Google Custom Search Engine
	cse: {
		id: "000564799181643116475:anhhe5mapg8"
	}
};

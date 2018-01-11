package main

import (
	"net/http"
	"net/http/httputil"
	"net/url"
	"sync"
	"time"

	"os"

	"github.com/pokstad/go-couchdb"
	"github.com/pokstad/go-couchdb/couchdaemon"
)

var logger couchdaemon.LogWriter
var serverConfigs = map[string]string{
	"username":          os.Getenv("COUCHDB_USER"),     // optional, provide credentials through local.ini
	"password":          os.Getenv("COUCHDB_PASSWORD"), // optional, provide credentials through local.ini
	"couchURL":          "http://localhost:5984",       // optional
	"static_web_assets": "/www/public",                 // static files
	"http_port":         ":8443",                       // only root can run port 80
	"ssl_port":          ":6984",                       // only root can run port 443
	"public_key":        "./server.crt",                // If you want SSL...
	"private_key":       "./server.key",                // If you want SSL...
}

func fetchCouchdbConfigs() {
	fetchedConfigs, err := couchdaemon.ConfigSection("go_server")
	if err != nil {
		logger.Err(err)
		panic(err)
	}
	for k, v := range fetchedConfigs {
		// overwrite values in default_configs with ones we received from CouchDB
		serverConfigs[k] = v
	}
	logger.Debug(serverConfigs)
}

func customAPI(rw http.ResponseWriter, req *http.Request) {
	// your middleware lives here
}

func addCORS(handler http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "X-Requested-With")
		handler.ServeHTTP(w, r)
	})
}

func main() {
	couchdaemon.Init(nil)
	logger = couchdaemon.NewLogWriter()
	fetchCouchdbConfigs()
	logger.Debug("Server starting")
	couchServer, err := couchdb.NewClient(serverConfigs["couchURL"], nil)
	if err != nil {
		logger.Err(err)
		panic(err)
	}
	couchAuth := couchdb.BasicAuth(serverConfigs["username"], serverConfigs["password"])
	couchServer.SetAuth(couchAuth)
	mux := http.NewServeMux()
	// by default, URL's will be mapped to our static assets
	mux.Handle("/", http.FileServer(http.Dir(serverConfigs["static_web_assets"])))
	// create a reverse proxy to our couch server
	proxyURL, _ := url.Parse(serverConfigs["couchURL"])
	mux.Handle("/db/", http.StripPrefix("/db/", httputil.NewSingleHostReverseProxy(proxyURL)))
	mux.HandleFunc("/api", customAPI)

	httpServ := &http.Server{
		Addr:        serverConfigs["http_port"],
		Handler:     mux,
		ReadTimeout: 30 * time.Second, // helps kill ghost Goroutines:
		// http://stackoverflow.com/questions/10971800/golang-http-server-leaving-open-goroutines
		//ErrorLog:   nil, // suppresses errors from stderr
	}

	httpSslServ := &http.Server{
		Addr:        serverConfigs["ssl_port"],
		Handler:     mux,
		ReadTimeout: 30 * time.Second, // helps kill ghost Goroutines:
		// http://stackoverflow.com/questions/10971800/golang-http-server-leaving-open-goroutines
		//ErrorLog:   nil, // suppresses errors from stderr
	}

	// In order to run these two forever blocking methods, we need goroutines
	wg := &sync.WaitGroup{}
	wg.Add(1)
	go func() {
		httpErr := httpServ.ListenAndServe() // run forever
		logger.Debug(httpErr)
		wg.Done()
	}()
	wg.Add(1)
	go func() {
		sslErr := httpSslServ.ListenAndServeTLS(
			serverConfigs["public_key"],
			serverConfigs["private_key"],
		) // run forever
		logger.Debug(sslErr)
		wg.Done()
	}()
	wg.Wait() // beyond this line is reached when both servers stop
	logger.Err("Server closing.")
}

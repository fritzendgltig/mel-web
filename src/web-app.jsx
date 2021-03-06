import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route } from "react-router-dom";
import { MelClientSocket, MelHttpService } from "mel-core";

import "./html/index.html";
import "./res/fonts/Oswald/Oswald-Regular.ttf";
import "./res/fonts/Oswald/Oswald-Bold.ttf";
import "./res/fonts/Open_Sans/OpenSans-Regular.ttf";
import "./res/fonts/Roboto/Roboto-Regular.ttf";
import "./res/favicon.ico";

import styles from "./web-app.sass";
import LibraryView from "./components/views/library-view";
import ArtistView from "./components/views/artist-view";
import AlbumView from "./components/views/album-view";
import SocketIoWebSocket from "./network/socket-io-web-socket";
import DownloadBar from "./components/download-bar";
import DownloadService from "./services/download-service";
import DownloadView from "./components/views/download-view";

const PORT = location.port;
const HOSTNAME = location.hostname;
const PROTOCOL = location.protocol.slice(0, -1);
const WEB_ROOT = fetchWebRoot();

class WebApp extends React.Component {
  constructor() {
    super();
    console.log("Initializing WebApp");
    this.state = {};
    let webSocket = new SocketIoWebSocket(HOSTNAME, PORT, {
      webRoot: WEB_ROOT
    });
    webSocket.connect();
    this.state.melClientSocket = new MelClientSocket(webSocket);
    this.state.melHttpService = new MelHttpService(HOSTNAME, PORT, {
      webRoot: WEB_ROOT,
      protocol: PROTOCOL
    });
    DownloadService.initialize(this.state.melHttpService);
  }

  render() {
    const { melClientSocket, melHttpService } = this.state;
    const { wrapper, content } = styles;

    return (
      <div className={wrapper}>
        <div id="content" className={content}>
          <Route
            exact
            path="/"
            render={props => (
              <LibraryView {...props} melClientSocket={melClientSocket} />
            )}
          />
          <Route
            path="/artist/:artistId"
            render={props => (
              <ArtistView
                {...props}
                artistId={props.match.params.artistId}
                melClientSocket={melClientSocket}
                melHttpService={melHttpService}
              />
            )}
          />
          <Route
            path="/album/:albumId"
            render={props => (
              <AlbumView
                {...props}
                albumId={props.match.params.albumId}
                melClientSocket={melClientSocket}
                melHttpService={melHttpService}
              />
            )}
          />
          <Route
            path={"/downloads"}
            render={props => <DownloadView {...props} />}
          />
          <Route
            path={"/"}
            // path={/(?!\/downloads)\//}
            render={props => <DownloadBar {...props} />}
          />
        </div>
      </div>
    );
  }
}

ReactDOM.render(
  <BrowserRouter basename={WEB_ROOT}>
    <WebApp />
  </BrowserRouter>,
  document.getElementById("root")
);

function fetchWebRoot() {
  let href = document.getElementsByTagName("base")[0].href;
  href = href.replace(new RegExp("^" + location.origin), "");
  if (!href.endsWith("/")) href += "/";
  return href;
}

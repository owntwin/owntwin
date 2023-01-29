import "./App.css";

import { Helmet } from "react-helmet-async";

import Sidenav from "./ui/Sidenav";
import ItemInfo from "./ui/ItemInfo";
import Clock from "./ui/Clock";
import ExportButton from "./ui/ExportButton";

import ModelView from "./components/ModelView";
import Debug from "./components/Debug";

import { useModelFetch } from "./lib/hooks";

// NOTE: this constant is unproblematic as it is of app
import { CANVAS } from "./lib/constants";

const addons = import.meta.env.VITE_ADDONS
  ? import.meta.env.VITE_ADDONS.split(",")
  : [];

function App() {
  const { model, basePath } = useModelFetch();

  return (
    <div id="App" className="App fixed top-0 bottom-0 left-0 right-0">
      <Helmet>
        {model?.displayName && <title>{model.displayName} - OwnTwin</title>}
      </Helmet>
      <div className="absolute top-0 bottom-0 left-0 right-0">
        {model && basePath && (
          <ModelView
            model={model}
            basePath={basePath}
            width={CANVAS.width}
            height={CANVAS.height}
            addons={addons}
            options={{
              elevationZoom: 2,
            }}
          />
        )}
      </div>
      <ItemInfo
        displayName={model?.displayName}
        type={model?.type}
        homepage={model?.homepage}
        description={model?.description}
        properties={model?.properties}
        actions={model?.actions}
        layers={model?.layers}
      />
      <Debug />
      <div className="absolute top-4 left-auto right-4 hidden sm:flex gap-2 h-10">
        <ExportButton homepage={model?.homepage} />
        <Clock />
      </div>
      <Sidenav communityURL={model?.community} />
      <a href="//beta.owntwin.com" className="cursor-pointer">
        <div className="Logo absolute bottom-4 left-auto right-4 opacity-75 font-bold text-white bg-gray-500 rounded px-3 py-2">
          <div>OwnTwin</div>
        </div>
      </a>
    </div>
  );
}

export default App;

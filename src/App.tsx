import "./App.css";
import { ConnectButton } from "thirdweb/react";
import { client } from "./client.ts";

function App() {
  return (
    <div>
      <ConnectButton client={client} />
    </div>
  );
}

export default App;
